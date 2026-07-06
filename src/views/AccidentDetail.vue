<template>
  <div class="detail-page">
    <aside class="chat-panel page-card">
      <div class="accident-summary">
        <h1>{{ detail.name }}</h1>
        <div class="meta">
          <span>来源：{{ detail.source }}</span>
          <span>采集时间：{{ detail.time }}</span>
        </div>
        <el-button type="primary" :icon="Search" @click="startAnalysis">事故根因分析</el-button>
      </div>

      <div ref="messageBox" class="messages">
        <div v-for="message in messages" :key="message.id" class="message" :class="message.role">
          <div class="message-title">
            <span class="avatar">{{ message.role === 'ai' ? 'AI' : '我' }}</span>
            <strong>{{ message.role === 'ai' ? '事故类比排查智能体' : '用户' }}</strong>
          </div>
          <p>{{ message.text }}</p>
          <div v-if="message.action === 'adopt' && !rootCauseAdopted" class="message-actions">
            <el-button size="small" type="primary" @click="adoptRootCause">采纳根因结果</el-button>
          </div>
        </div>
      </div>

      <div class="chat-input">
        <el-input v-model="chatText" placeholder="请输入您的问题..." @keyup.enter="sendChat" />
        <el-button type="primary" :icon="Promotion" @click="sendChat" />
      </div>
    </aside>

    <main class="stage-grid">
      <section class="stage-card page-card elements-card">
        <header class="stage-header">
          <span class="header-icon">🏭</span>
          <h2>关联排查要素</h2>
          <span v-if="!rootCauseAdopted" class="hint">请先完成左侧事故根因分析并采纳</span>
        </header>
        <div class="stage-body">
          <div v-for="group in tagGroups" :key="group.title" class="tag-section">
            <h3>{{ group.title }}</h3>
            <div v-if="rootCauseAdopted" class="tags">
              <span v-for="tag in group.tags" :key="tag" class="tag" :class="group.className">{{ tag }}</span>
            </div>
            <p v-else class="empty-text">请先完成左侧事故根因分析并采纳</p>
          </div>
        </div>
      </section>

      <section class="stage-card page-card units-card">
        <header class="stage-header">
          <span class="header-icon">📋</span>
          <h2>关联生产经营单位列表</h2>
          <span class="count">共 <strong>{{ rootCauseAdopted ? detail.matchTotal : 0 }}</strong> 家</span>
        </header>
        <div class="unit-filters">
          <el-input v-model="unitFilters.name" placeholder="请输入单位名称" />
          <el-input v-model="unitFilters.type" placeholder="请输入单位类型" />
          <el-input v-model="unitFilters.address" placeholder="请输入单位地址" />
        </div>
        <el-table :data="visibleUnits" height="100%" class="unit-table">
          <el-table-column prop="name" label="单位名称" min-width="210" show-overflow-tooltip />
          <el-table-column prop="type" label="单位类型" min-width="150" />
          <el-table-column prop="address" label="单位地址" min-width="220" show-overflow-tooltip />
          <el-table-column prop="street" label="所属街道" min-width="120" />
          <el-table-column label="操作" width="90">
            <template #default>
              <el-button size="small" type="primary" text>查看</el-button>
            </template>
          </el-table-column>
          <template #empty>
            <span>{{ rootCauseAdopted ? '暂无关联单位' : '请先完成左侧事故根因分析并采纳' }}</span>
          </template>
        </el-table>
      </section>
    </main>

    <aside class="right-grid">
      <section class="stage-card page-card checklist-card">
        <header class="stage-header">
          <span class="header-icon">📝</span>
          <h2>隐患排查表智能生成</h2>
          <el-button size="small" type="primary" @click="addChecklistItem">+ 新增隐患</el-button>
        </header>
        <div class="stage-body">
          <template v-if="rootCauseAdopted">
            <div v-for="(item, index) in checklist" :key="`${item.type}-${index}`" class="check-item">
              <el-tag size="small" type="success">{{ item.type }}</el-tag>
              <p>{{ item.text }}</p>
            </div>
          </template>
          <div v-else class="empty-state">
            请先完成左侧事故根因分析并采纳
          </div>
        </div>
      </section>

      <section class="stage-card page-card letter-card">
        <header class="stage-header">
          <span class="header-icon">📣</span>
          <h2>专项任务提示函生成</h2>
          <el-button size="small" type="primary" :disabled="!rootCauseAdopted" @click="generateLetter">生成提示函</el-button>
        </header>
        <div class="stage-body">
          <div v-if="letterGenerated" class="letter-preview">
            <h3>{{ detail.letterTitle }}</h3>
            <p v-for="line in detail.letterContent" :key="line">{{ line }}</p>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon">📣</span>
            <strong>暂无提示函内容</strong>
            <p>点击上方“生成提示函”按钮，AI将根据当前事故分析结果自动生成专项排查提示函</p>
          </div>
        </div>
      </section>
    </aside>

    <footer class="bottom-actions">
      <span class="save-status" :class="{ saved: saved, issued: issued }">{{ statusText }}</span>
      <el-button type="success" :icon="FolderChecked" :disabled="!rootCauseAdopted || saved" @click="savePlan">
        {{ saved ? '已保存类比排查方案' : '保存类比排查方案' }}
      </el-button>
      <el-button type="warning" :icon="UploadFilled" :disabled="!saved || issued" @click="issueTask">
        {{ issued ? '已下发专项任务' : '下发专项任务' }}
      </el-button>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { FolderChecked, Promotion, Search, UploadFilled } from '@element-plus/icons-vue'
import { getAccidentDetail, readPlanStatus, writePlanStatus, type ChecklistItem } from '@/data/accidents'

type Message = {
  id: number
  role: 'ai' | 'user'
  text: string
  action?: 'adopt'
}

const route = useRoute()
const accidentId = computed(() => Number(route.params.id || 1))
const detail = getAccidentDetail(accidentId.value)
const planStatus = readPlanStatus()

const rootCauseAdopted = ref(Boolean(planStatus[detail.id]?.generated))
const saved = ref(Boolean(planStatus[detail.id]?.generated))
const issued = ref(Boolean(planStatus[detail.id]?.issued))
const letterGenerated = ref(false)
const chatText = ref('')
const messageBox = ref<HTMLElement>()
const checklist = ref<ChecklistItem[]>(rootCauseAdopted.value ? [...detail.checklist] : [])

const unitFilters = reactive({
  name: '',
  type: '',
  address: '',
})

const messages = ref<Message[]>([
  {
    id: 1,
    role: 'ai',
    text: '您好！我是事故类比排查智能体。请点击“事故根因分析”，我会识别事故关键风险，并联动生成排查要素、关联单位、隐患清单和专项任务提示函。',
  },
])

const tagGroups = computed(() => [
  { title: '关联行业领域', tags: detail.industries, className: 'blue' },
  { title: '关联风险源', tags: detail.risks, className: 'orange' },
  { title: '关联设备设施', tags: detail.devices, className: 'green' },
  { title: '关联历史隐患项', tags: detail.histories, className: 'purple' },
])

const visibleUnits = computed(() => {
  if (!rootCauseAdopted.value) return []
  return detail.matchUnits.filter((unit) => {
    if (unitFilters.name && !unit.name.includes(unitFilters.name)) return false
    if (unitFilters.type && !unit.type.includes(unitFilters.type)) return false
    if (unitFilters.address && !unit.address.includes(unitFilters.address)) return false
    return true
  })
})

const statusText = computed(() => {
  if (issued.value) return '专项任务已下发'
  if (saved.value) return '类比排查方案已保存'
  return rootCauseAdopted.value ? '根因结果已采纳，可保存方案' : ''
})

const pushMessage = async (message: Omit<Message, 'id'>) => {
  messages.value.push({ ...message, id: Date.now() + messages.value.length })
  await nextTick()
  if (messageBox.value) {
    messageBox.value.scrollTop = messageBox.value.scrollHeight
  }
}

const startAnalysis = () => {
  pushMessage({ role: 'user', text: '请对该事故开展根因分析，并生成可用于类比排查的关键要素。' })
  pushMessage({
    role: 'ai',
    text: detail.rootCause,
    action: 'adopt',
  })
}

const adoptRootCause = () => {
  rootCauseAdopted.value = true
  checklist.value = [...detail.checklist]
  pushMessage({
    role: 'ai',
    text: `已采纳根因结果。系统已关联${detail.matchTotal}家生产经营单位，并生成排查要素和隐患排查清单草案。`,
  })
}

const sendChat = () => {
  const text = chatText.value.trim()
  if (!text) return
  chatText.value = ''
  pushMessage({ role: 'user', text })
  pushMessage({
    role: 'ai',
    text: rootCauseAdopted.value
      ? '我已结合当前根因结果更新理解。你可以继续补充行业、设备或隐患方向，右侧内容可作为后续接口联动位置。'
      : '建议先点击“事故根因分析”并采纳结果，再生成右侧四个区域的阶段内容。',
  })
}

const addChecklistItem = () => {
  if (!rootCauseAdopted.value) {
    ElMessage.warning('请先采纳事故根因分析结果')
    return
  }
  checklist.value.push({
    type: '补充项',
    text: '补充检查事故相关场景的现场安全管理、人员培训和整改闭环情况。',
  })
}

const generateLetter = () => {
  if (!rootCauseAdopted.value) return
  letterGenerated.value = true
  pushMessage({ role: 'ai', text: '专项任务提示函已生成，可在右下角区域查看并作为后续编辑入口。' })
}

const savePlan = () => {
  if (!rootCauseAdopted.value) return
  const status = readPlanStatus()
  status[detail.id] = { ...status[detail.id], generated: true }
  writePlanStatus(status)
  saved.value = true
  ElMessage.success('类比排查方案已保存')
}

const issueTask = () => {
  if (!saved.value) return
  const status = readPlanStatus()
  status[detail.id] = { ...status[detail.id], generated: true, issued: true }
  writePlanStatus(status)
  issued.value = true
  ElMessage.success('专项任务已下发')
}
</script>

<style scoped lang="scss">
.detail-page {
  display: grid;
  grid-template-columns: minmax(360px, 480px) minmax(560px, 1fr) minmax(320px, 420px);
  grid-template-rows: minmax(0, 1fr) 60px;
  gap: 12px;
  height: 100%;
  min-height: 0;
  padding: 12px;
  background: #f5f7fa;
}

.chat-panel,
.stage-card {
  display: flex;
  min-height: 0;
  overflow: hidden;
}

.chat-panel {
  grid-row: 1;
  flex-direction: column;
}

.accident-summary {
  flex-shrink: 0;
  padding: 14px 16px;
  background: #fafbfc;
  border-bottom: 1px solid $border;

  h1 {
    margin: 0;
    color: $brand;
    font-size: 16px;
    line-height: 1.5;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin: 8px 0 12px;
    color: $ink-muted;
    font-size: 12px;
  }
}

.messages {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  padding: 14px 16px;
  overflow-y: auto;
  background: #f8fafc;
}

.message {
  max-width: 92%;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.65;

  p {
    margin: 6px 0 0;
  }
}

.message.ai {
  align-self: flex-start;
  color: $ink;
  background: #fff;
  border: 1px solid $border;
  border-bottom-left-radius: 4px;
}

.message.user {
  align-self: flex-end;
  color: #fff;
  background: $brand;
  border-bottom-right-radius: 4px;
}

.message-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.message.ai .message-title {
  color: $brand;
}

.avatar {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: $brand-soft;
  font-size: 11px;
}

.message.user .avatar {
  color: #fff;
  background: rgba(255, 255, 255, 0.24);
}

.message-actions {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed $border;
}

.chat-input {
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  padding: 10px 14px;
  background: #fff;
  border-top: 1px solid $border;
}

.stage-grid,
.right-grid {
  display: grid;
  min-width: 0;
  min-height: 0;
  gap: 12px;
}

.stage-grid {
  grid-template-rows: minmax(260px, 0.68fr) minmax(320px, 1fr);
}

.right-grid {
  grid-template-rows: minmax(280px, 1.12fr) minmax(240px, 1fr);
}

.stage-card {
  flex-direction: column;
}

.stage-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  min-height: 60px;
  padding: 14px 20px;
  border-bottom: 1px solid $border-light;

  h2 {
    margin: 0;
    color: $ink;
    font-size: 16px;
    font-weight: 700;
  }

  .hint,
  .count {
    margin-left: auto;
    color: $ink-muted;
    font-size: 12px;
  }

  strong {
    color: $brand;
  }

  .el-button {
    margin-left: auto;
  }
}

.header-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #eff6ff;
}

.stage-body {
  flex: 1;
  min-height: 0;
  padding: 16px 20px;
  overflow-y: auto;
}

.tag-section {
  margin-bottom: 18px;

  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px;
    color: $ink-soft;
    font-size: 13px;
  }

  h3::before {
    width: 3px;
    height: 14px;
    content: '';
    background: $brand;
    border-radius: 2px;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 16px;
  font-size: 12px;
}

.tag.blue {
  color: #1d4ed8;
  background: #eff6ff;
  border-color: #bfdbfe;
}

.tag.orange {
  color: #c2410c;
  background: #fff7ed;
  border-color: #fed7aa;
}

.tag.green {
  color: #15803d;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.tag.purple {
  color: #7c3aed;
  background: #faf5ff;
  border-color: #e9d5ff;
}

.empty-text {
  margin: 0;
  color: #9ca3af;
  font-size: 13px;
  font-style: italic;
}

.unit-filters {
  display: grid;
  flex-shrink: 0;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid $border-light;
}

.unit-table {
  flex: 1;

  :deep(.el-table__header th) {
    background: $surface-soft;
  }
}

.check-item {
  padding: 12px;
  margin-bottom: 10px;
  background: #f8fafc;
  border-left: 3px solid $brand;
  border-radius: 8px;

  p {
    margin: 8px 0 0;
    color: $ink-soft;
    font-size: 13px;
    line-height: 1.6;
  }
}

.empty-state {
  display: flex;
  height: 100%;
  min-height: 160px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  text-align: center;
  font-size: 13px;

  strong {
    margin-top: 8px;
    color: $ink-muted;
  }

  p {
    max-width: 260px;
    margin: 8px 0 0;
  }
}

.empty-icon {
  font-size: 32px;
}

.letter-preview {
  padding: 16px;
  color: $ink-soft;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.7;

  h3 {
    margin: 0 0 12px;
    color: $ink;
    font-size: 15px;
    text-align: center;
  }
}

.bottom-actions {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 24px;
  background: #fff;
  border-top: 1px solid $border;
  border-radius: 8px;
  box-shadow: 0 -2px 8px rgba(15, 23, 42, 0.06);
}

.save-status {
  min-width: 180px;
  color: $ink-muted;
  font-size: 13px;
  text-align: right;
}

.save-status.saved {
  color: $success;
}

.save-status.issued {
  color: #ea580c;
}
</style>
