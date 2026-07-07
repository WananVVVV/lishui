<template>
  <div class="list-page">
    <section class="search-card page-card">
      <el-form :model="filters" inline label-position="top" class="search-form">
        <el-form-item label="事故名称">
          <el-input v-model="filters.name" placeholder="请输入事故名称" clearable />
        </el-form-item>
        <el-form-item label="事故来源">
          <el-select v-model="filters.source" placeholder="全部" clearable>
            <el-option v-for="source in sourceOptions" :key="source" :label="source" :value="source" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否生成类比排查方案">
          <el-select v-model="filters.generated" placeholder="全部" clearable>
            <el-option label="是" value="yes" />
            <el-option label="否" value="no" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否下发方案">
          <el-select v-model="filters.issued" placeholder="全部" clearable>
            <el-option label="是" value="yes" />
            <el-option label="否" value="no" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button type="primary" :icon="Search" @click="currentPage = 1">查询</el-button>
          <el-button :icon="RefreshLeft" @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </section>

    <section class="table-card page-card">
      <div class="table-header">
        <h2>事故报告列表</h2>
        <span>共 <strong>{{ filteredData.length }}</strong> 条记录</span>
      </div>

      <el-table :data="pageData" height="100%" class="accident-table">
        <el-table-column type="index" label="序号" width="90" :index="tableIndex" />
        <el-table-column prop="name" label="事故报告名称" min-width="300" show-overflow-tooltip />
        <el-table-column prop="source" label="事故报告来源" min-width="180" show-overflow-tooltip />
        <el-table-column prop="time" label="事故报告采集时间" min-width="190" />
        <el-table-column label="是否生成类比排查方案" min-width="190">
          <template #default="{ row }">
            <el-tag :type="row.generated ? 'success' : 'danger'" effect="light">
              {{ row.generated ? '已生成' : '未生成' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否下发方案" min-width="150">
          <template #default="{ row }">
            <el-tag :type="row.issued ? 'success' : 'warning'" effect="light">
              {{ row.issued ? '已下发' : '未下发' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="隐患发现数" min-width="140">
          <template #default="{ row }">
            <span class="hazard-count" :class="{ active: row.hazardCount > 0 }">{{ row.hazardCount }} 项</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="130" fixed="right">
          <template #default="{ row }">
            <el-button size="small" type="primary" plain @click="openDetail(row.fileId)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <span>共 {{ totalPages }} 页</span>
        <el-pagination
          v-model:current-page="currentPage"
          layout="prev, pager, next"
          :page-size="pageSize"
          :total="filteredData.length"
          background
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RefreshLeft, Search } from '@element-plus/icons-vue'
import { accidents, readPlanStatus, type Accident } from '@/data/accidents'

type AccidentRow = Accident & { generated: boolean; issued: boolean }

const router = useRouter()
const currentPage = ref(1)
const pageSize = 10

const filters = reactive({
  name: '',
  source: '',
  generated: '',
  issued: '',
})

const mergedData = computed<AccidentRow[]>(() => {
  const status = readPlanStatus()
  return accidents.map((item) => ({
    ...item,
    generated: Boolean(status[item.id]?.generated ?? item.generated),
    issued: Boolean(status[item.id]?.issued ?? item.issued),
  }))
})

const sourceOptions = computed(() => {
  return Array.from(new Set(mergedData.value.map((item) => item.source)))
})

const filteredData = computed(() => {
  return mergedData.value.filter((item) => {
    if (filters.name && !item.name.includes(filters.name)) return false
    if (filters.source && item.source !== filters.source) return false
    if (filters.generated && item.generated !== (filters.generated === 'yes')) return false
    if (filters.issued && item.issued !== (filters.issued === 'yes')) return false
    return true
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredData.value.length / pageSize)))

const pageData = computed(() => {
  const page = Math.min(currentPage.value, totalPages.value)
  const start = (page - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

const tableIndex = (index: number) => (currentPage.value - 1) * pageSize + index + 1

const resetFilters = () => {
  filters.name = ''
  filters.source = ''
  filters.generated = ''
  filters.issued = ''
  currentPage.value = 1
}

const openDetail = (fileId: string) => {
  router.push(`/accidents/${fileId}`)
}
</script>

<style scoped lang="scss">
.list-page {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
  padding: 20px;
  overflow: hidden;
}

.search-card {
  flex-shrink: 0;
  padding: 20px;
}

.search-form {
  display: flex;
  align-items: flex-end;
  gap: 16px;

  :deep(.el-form-item) {
    margin: 0;
  }

  :deep(.el-form-item__label) {
    margin-bottom: 6px;
    color: $ink-soft;
    font-weight: 600;
    line-height: 1.2;
  }

  :deep(.el-input),
  :deep(.el-select) {
    width: 220px;
  }
}

.search-actions {
  padding-top: 22px;
}

.table-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  padding: 20px;
}

.table-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  h2 {
    margin: 0;
    color: $ink;
    font-size: 16px;
    font-weight: 700;
  }

  span {
    color: $ink-muted;
    font-size: 13px;
  }

  strong {
    color: $brand;
  }
}

.accident-table {
  flex: 1;

  :deep(.el-table__header th) {
    color: $ink-soft;
    background: $surface-soft;
  }
}

.hazard-count {
  color: #94a3b8;
}

.hazard-count.active {
  color: $brand;
  font-weight: 700;
  cursor: pointer;
}

.pagination {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid $border;
  color: $ink-muted;
  font-size: 13px;
}
</style>
