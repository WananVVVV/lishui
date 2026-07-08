<template>
  <div class="detail-page">
    <aside class="chat-panel page-card">
      <div class="accident-summary">
        <h1>{{ detail.name }}</h1>
        <div class="meta">
          <span>来源：{{ detail.source }}</span>
          <span>采集时间：{{ detail.time }}</span>
        </div>
        <el-button
          type="primary"
          :icon="Search"
          :loading="isGenerating"
          :disabled="isGenerating"
          @click="startReportGeneration"
        >
          {{ hasReportContent ? "重新生成研判报告" : "生成三警机制研判报告" }}
        </el-button>
      </div>

      <div ref="messageBox" class="messages">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message"
          :class="message.role"
        >
          <div class="message-title">
            <span class="avatar">{{
              message.role === "ai" ? "AI" : "我"
            }}</span>
            <strong>{{
              message.role === "ai" ? "事故类比排查智能体" : "用户"
            }}</strong>
          </div>
          <div
            class="message-markdown"
            v-html="renderMessageMarkdown(message.text)"
          ></div>
        </div>
      </div>

      <div v-if="isGenerating" class="chat-loading" aria-label="正在生成">
        <span class="typing-dots" aria-hidden="true">
          <i></i>
          <i></i>
          <i></i>
        </span>
      </div>

      <div class="chat-input">
        <el-input
          v-model="chatText"
          :disabled="isGenerating"
          placeholder="输入确认、继续或修改意见..."
          @keyup.enter="sendChat"
        />
        <el-button
          type="primary"
          :icon="Promotion"
          :disabled="isGenerating || !chatText.trim()"
          @click="sendChat"
        />
      </div>
    </aside>

    <main class="stage-grid">
      <section
        v-for="step in upperSteps"
        :key="step.key"
        class="stage-card page-card"
      >
        <header class="stage-header">
          <span class="header-icon">{{ step.index }}</span>
          <div class="header-title">
            <h2>{{ step.title }}</h2>
            <p>{{ step.description }}</p>
          </div>
        </header>
        <div class="stage-body">
          <div v-if="step.fieldExtraction" class="field-extraction">
            <div class="field-hero">
              <span>事故名称</span>
              <strong>{{ step.fieldExtraction.accidentName }}</strong>
              <p v-if="step.fieldExtraction.confirmText">
                {{ step.fieldExtraction.confirmText }}
              </p>
            </div>

            <section class="field-section">
              <h3>明确提取</h3>
              <div class="field-grid">
                <div
                  v-for="item in step.fieldExtraction.explicitItems"
                  :key="item.label"
                  class="field-item"
                  :class="{ wide: item.wide, emphasis: item.emphasis }"
                >
                  <span>{{ item.label }}</span>
                  <div v-if="item.values.length" class="field-tags">
                    <b
                      v-for="value in item.values"
                      :key="value"
                      class="field-tag"
                      >{{ value }}</b
                    >
                  </div>
                  <p v-else :class="{ muted: !item.value }">
                    {{ item.value || "暂无明确提取" }}
                  </p>
                </div>
              </div>
            </section>

            <section class="field-section inferred">
              <h3>推断内容</h3>
              <div class="field-grid">
                <div
                  v-for="item in step.fieldExtraction.inferredItems"
                  :key="item.label"
                  class="field-item"
                  :class="{ wide: item.wide, emphasis: item.emphasis }"
                >
                  <span>{{ item.label }}</span>
                  <div v-if="item.values.length" class="field-tags">
                    <b
                      v-for="value in item.values"
                      :key="value"
                      class="field-tag inferred"
                      >{{ value }}</b
                    >
                  </div>
                  <p v-else :class="{ muted: !item.value }">
                    {{ item.value || "暂无推断内容" }}
                  </p>
                </div>
              </div>
            </section>
          </div>
          <div v-else-if="step.enterpriseMatch" class="enterprise-match">
            <div class="match-hero">
              <div>
                <span>匹配结果</span>
                <strong>{{ step.enterpriseMatch.title }}</strong>
                <p v-if="step.enterpriseMatch.confirmText">
                  {{ step.enterpriseMatch.confirmText }}
                </p>
              </div>
              <b
                :class="[
                  'service-status',
                  step.enterpriseMatch.serviceOk ? 'ok' : 'warn',
                ]"
              >
                {{ step.enterpriseMatch.serviceStatus || "未知状态" }}
              </b>
            </div>

            <div class="match-stats">
              <div
                v-for="item in step.enterpriseMatch.summaryItems"
                :key="item.label"
                class="match-stat"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <div class="risk-distribution">
              <div
                v-for="item in step.enterpriseMatch.riskCounts"
                :key="item.key"
                :class="['risk-count', item.key]"
              >
                <span>{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
              </div>
            </div>

            <section class="match-section">
              <div class="match-section-title">
                <h3>候选企业清单</h3>
                <span>共 {{ step.enterpriseMatch.candidates.length }} 家</span>
              </div>
              <div class="enterprise-table-wrap">
                <table class="enterprise-table">
                  <thead>
                    <tr>
                      <th>序号</th>
                      <th>风险等级</th>
                      <th>企业名称</th>
                      <th>置信度</th>
                      <th>匹配依据</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="candidate in step.enterpriseMatch.candidates"
                      :key="candidate.enterpriseId"
                    >
                      <td>{{ candidate.index }}</td>
                      <td>
                        <span :class="['risk-pill', candidate.riskClass]">
                          {{ candidate.riskLevel }}
                        </span>
                      </td>
                      <td>
                        <strong>{{ candidate.enterpriseName }}</strong>
                        <code>{{ candidate.enterpriseId }}</code>
                      </td>
                      <td>{{ candidate.confidenceScore }}</td>
                      <td>{{ candidate.matchSummary }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section
              v-if="
                step.enterpriseMatch.checkItems.length ||
                step.enterpriseMatch.checkResult
              "
              class="match-section"
            >
              <div class="match-section-title">
                <h3>候选输出核对</h3>
              </div>
              <div class="check-grid">
                <div
                  v-for="item in step.enterpriseMatch.checkItems"
                  :key="item.label"
                  class="check-item"
                >
                  <span>{{ item.label }}</span>
                  <strong>{{ item.value }}</strong>
                </div>
              </div>
              <p v-if="step.enterpriseMatch.checkResult" class="check-result">
                {{ step.enterpriseMatch.checkResult }}
              </p>
            </section>

            <p v-if="step.enterpriseMatch.note" class="match-note">
              {{ step.enterpriseMatch.note }}
            </p>
          </div>
          <div v-else-if="step.isStructuredLoading" class="structured-loading">
            <span class="loading-ring"></span>
            <strong>{{ step.structuredLoadingTitle }}</strong>
            <p>{{ step.structuredLoadingText }}</p>
          </div>
          <div v-else-if="step.content" class="markdown-content">
            {{ step.content }}
          </div>
          <div v-else class="empty-state">
            <strong>{{
              step.status === "active" ? "生成中" : "等待生成"
            }}</strong>
            <p>{{ step.emptyText }}</p>
          </div>
        </div>
      </section>
    </main>

    <aside class="right-grid">
      <section class="stage-card page-card final-card">
        <header class="stage-header">
          <span class="header-icon">{{ finalStep.index }}</span>
          <div class="header-title">
            <h2>{{ finalStep.title }}</h2>
            <p>{{ finalStep.description }}</p>
          </div>
        </header>
        <div class="stage-body">
          <div v-if="streamError" class="error-box">{{ streamError }}</div>
          <div v-if="isFinalReportStreaming" class="structured-loading">
            <span class="loading-ring"></span>
            <strong>正在整合总稿</strong>
            <p>
              智能体正在汇总事故字段和企业匹配结果，完成后将展示完整研判报告。
            </p>
          </div>
          <div
            v-else-if="finalStep.content"
            class="markdown-content final-content"
            v-html="renderFinalReportMarkdown(finalStep.content)"
          ></div>
          <div v-else class="empty-state">
            <strong>暂无总稿内容</strong>
            <p>点击左侧按钮后，最终研判报告会在这里实时追加。</p>
          </div>
        </div>
      </section>

      <section class="stage-card page-card checklist-card">
        <header class="stage-header">
          <span class="header-icon success">查</span>
          <div class="header-title">
            <h2>隐患排查表智能生成</h2>
            <p>
              {{
                hazardChecklistItems.length
                  ? `已生成 ${hazardChecklistItems.length} 项检查事项`
                  : "等待真实数据接口返回检查事项"
              }}
            </p>
          </div>
        </header>
        <div class="stage-body">
          <div v-if="hazardAnalyzeError" class="error-box">
            {{ hazardAnalyzeError }}
          </div>
          <div v-if="isAnalyzingHazards" class="structured-loading">
            <span class="loading-ring"></span>
            <strong>正在生成隐患排查表</strong>
            <p>系统正在调用隐患分析接口，完成后将展示智能生成的检查事项。</p>
          </div>
          <div v-else-if="hazardChecklistItems.length" class="hazard-checklist">
            <div
              v-for="item in hazardChecklistItems"
              :key="`${item.index}-${item.labelName}`"
              class="hazard-check-item"
            >
              <span class="hazard-check-index">{{ item.index }}</span>
              <div class="hazard-check-content">
                <p>{{ item.labelName }}</p>
                <strong v-if="item.sourceBasis">{{ item.sourceBasis }}</strong>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">
            <strong>暂无隐患排查项</strong>
            <p>完成研判报告生成后，这里会展示智能生成的检查事项。</p>
          </div>
        </div>
      </section>
    </aside>

    <!-- 底部操作区暂时不用，保留原代码便于后续恢复。
    <footer class="bottom-actions">
      <el-button
        type="success"
        :icon="FolderChecked"
        :disabled="!reportReady || saved"
        @click="savePlan"
      >
        {{ saved ? "已保存研判报告" : "保存研判报告" }}
      </el-button>
      <el-button
        type="warning"
        :icon="UploadFilled"
        :disabled="!saved || issued"
        @click="issueTask"
      >
        {{ issued ? "已下发专项任务" : "下发专项任务" }}
      </el-button>
    </footer>
    -->
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref } from "vue";
import { useRoute } from "vue-router";
import { ElMessage } from "element-plus";
import {
  FolderChecked,
  Promotion,
  Search,
  UploadFilled,
} from "@element-plus/icons-vue";
import {
  createAnalogyRiskSessionId,
  getAnalogyRiskChunkContent,
  getAnalogyRiskChunkProgress,
  getAnalogyRiskChunkStep,
  getAnalogyRiskRequiredInputPrompt,
  normalizeAnalogyRiskStep,
  streamAnalogyRiskAgent,
  type AnalogyRiskVisibleStep,
} from "@/api/analogyRiskAgent";
import {
  analyzeCompanyReport,
  encodeReportContentToBase64,
} from "@/api/tagMatcher";
import {
  getAccidentDetailByFileId,
  readPlanStatus,
  writePlanStatus,
} from "@/data/accidents";

type Message = {
  id: number;
  role: "ai" | "user";
  text: string;
};

type ReportStepStatus = "pending" | "active" | "done" | "error";

type ReportStepState = {
  key: AnalogyRiskVisibleStep;
  index: string;
  title: string;
  description: string;
  emptyText: string;
  content: string;
  progress: string;
  status: ReportStepStatus;
};

type FieldDisplayItem = {
  label: string;
  value: string;
  values: string[];
  wide: boolean;
  emphasis: boolean;
};

type AccidentFieldExtraction = {
  accidentName: string;
  confirmText: string;
  explicitItems: FieldDisplayItem[];
  inferredItems: FieldDisplayItem[];
};

type MatchSummaryItem = {
  label: string;
  value: string;
};

type RiskCountItem = {
  key: "high" | "medium" | "low";
  label: string;
  value: string;
};

type EnterpriseCandidate = {
  index: string;
  riskLevel: string;
  riskClass: "high" | "medium" | "low";
  enterpriseId: string;
  enterpriseName: string;
  confidenceScore: string;
  matchSummary: string;
};

type EnterpriseMatchResult = {
  title: string;
  confirmText: string;
  serviceStatus: string;
  serviceOk: boolean;
  summaryItems: MatchSummaryItem[];
  riskCounts: RiskCountItem[];
  candidates: EnterpriseCandidate[];
  checkItems: MatchSummaryItem[];
  checkResult: string;
  note: string;
};

type HazardChecklistItem = {
  index: string;
  labelName: string;
  sourceBasis: string;
};

type ReportStepDisplayState = ReportStepState & {
  fieldExtraction?: AccidentFieldExtraction;
  enterpriseMatch?: EnterpriseMatchResult;
  isStructuredLoading?: boolean;
  structuredLoadingTitle?: string;
  structuredLoadingText?: string;
};

const route = useRoute();
const fileId = computed(() => String(route.params.fileId || ""));
const detail = getAccidentDetailByFileId(fileId.value);
const planStatus = readPlanStatus();
const reportFiles = [
  {
    fileId: detail.fileId,
    fileName: detail.fileName,
  },
];
const tenantId = import.meta.env.VITE_ANALOGY_RISK_TENANT_ID || "tenant";
const sessionStorageKey = `analogyRiskSession:${detail.id}`;

const createReportSteps = (): ReportStepState[] => [
  {
    key: "事故字段提取",
    index: "1",
    title: "事故字段提取",
    description: "从当前事故调查报告中提取结构化事故信息",
    emptyText: "等待后端返回事故字段、原因、问题和防范措施等内容。",
    content: "",
    progress: "0",
    status: "pending",
  },
  {
    key: "企业匹配结果生成",
    index: "2",
    title: "企业匹配结果生成",
    description: "基于事故风险特征生成关联企业匹配结果",
    emptyText: "等待后端输出相似企业、关联风险和匹配依据。",
    content: "",
    progress: "0",
    status: "pending",
  },
  {
    key: "总稿整合",
    index: "3",
    title: "总稿整合",
    description: "汇总形成完整三警机制研判报告",
    emptyText: "等待事故字段和企业匹配结果完成后整合总稿。",
    content: "",
    progress: "0",
    status: "pending",
  },
];

const storedSessionId = localStorage.getItem(sessionStorageKey);
const sessionId = ref(storedSessionId || createAnalogyRiskSessionId());
const reportSteps = ref<ReportStepState[]>(createReportSteps());
const isGenerating = ref(false);
const isAnalyzingHazards = ref(false);
const isFinalReportStreaming = ref(false);
const hazardChecklistItems = ref<HazardChecklistItem[]>([]);
const hazardAnalyzeError = ref("");
const chatText = ref("");
const messageBox = ref<HTMLElement>();
const streamError = ref("");
const saved = ref(Boolean(planStatus[detail.id]?.generated));
const issued = ref(Boolean(planStatus[detail.id]?.issued));
let lastChunkStep = "";
let activeChatStreamMessageId: number | undefined;
let activeStructuredStepMessageId: number | undefined;
let activeController: AbortController | undefined;
let activeRunStepKeys = new Set<AnalogyRiskVisibleStep>();

if (!storedSessionId) {
  localStorage.setItem(sessionStorageKey, sessionId.value);
}

const messages = ref<Message[]>([
  {
    id: 1,
    role: "ai",
    text: "您好！我是事故类比排查智能体。点击“生成三警机制研判报告”后，我会基于当前事故调查报告完成字段提取、企业匹配和总稿整合。后续可以直接输入“继续”、确认意见或修改意见。",
  },
]);

const upperSteps = computed<ReportStepDisplayState[]>(() =>
  reportSteps.value
    .filter((step) => step.key !== "总稿整合")
    .map((step) => {
      const fieldExtraction =
        step.key === "事故字段提取"
          ? parseAccidentFieldExtraction(step.content)
          : undefined;
      const enterpriseMatch =
        step.key === "企业匹配结果生成"
          ? parseEnterpriseMatchResult(step.content)
          : undefined;
      const isFieldExtractionLoading =
        step.key === "事故字段提取" &&
        step.status === "active" &&
        !fieldExtraction;
      const isEnterpriseMatchLoading =
        step.key === "企业匹配结果生成" &&
        step.status === "active" &&
        !enterpriseMatch;

      return {
        ...step,
        fieldExtraction,
        enterpriseMatch,
        isStructuredLoading:
          isFieldExtractionLoading || isEnterpriseMatchLoading,
        structuredLoadingTitle: isEnterpriseMatchLoading
          ? "正在匹配同类风险企业"
          : "正在整理事故字段",
        structuredLoadingText: isEnterpriseMatchLoading
          ? "智能体正在调用企业匹配服务，完成后将自动切换为候选企业清单。"
          : "智能体正在提取结构化数据，完成后将自动切换为字段卡片。",
      };
    }),
);
const finalStep = computed(
  () => reportSteps.value.find((step) => step.key === "总稿整合")!,
);
const hasReportContent = computed(() =>
  reportSteps.value.some((step) => Boolean(step.content.trim())),
);
const reportReady = computed(
  () => Boolean(finalStep.value.content.trim()) && !isGenerating.value,
);

const pushMessage = async (message: Omit<Message, "id">) => {
  messages.value.push({ ...message, id: Date.now() + messages.value.length });
  await nextTick();
  if (messageBox.value) {
    messageBox.value.scrollTop = messageBox.value.scrollHeight;
  }
};

const scrollMessagesToBottom = () => {
  void nextTick(() => {
    if (messageBox.value) {
      messageBox.value.scrollTop = messageBox.value.scrollHeight;
    }
  });
};

const stripGeneratingPlaceholder = (content: string) => {
  return content.replace(/^(?:\s*正在生成[.。…]*\s*)+/u, "");
};

const appendChatStreamContent = (content: string) => {
  if (!content) return;

  let message = activeChatStreamMessageId
    ? messages.value.find((item) => item.id === activeChatStreamMessageId)
    : undefined;
  const nextText = stripGeneratingPlaceholder(
    `${message?.text || ""}${content}`,
  );
  if (!nextText) return;

  if (!message) {
    message = {
      id: Date.now() + messages.value.length,
      role: "ai",
      text: "",
    };
    activeChatStreamMessageId = message.id;
    messages.value.push(message);
  }

  message.text = nextText;
  scrollMessagesToBottom();
};

const getStructuredStepText = (stepKey: AnalogyRiskVisibleStep) => {
  const textMap: Record<AnalogyRiskVisibleStep, string> = {
    事故字段提取: "事故字段提取：正在从事故调查报告中提取结构化事故信息。",
    企业匹配结果生成:
      "企业匹配结果生成：正在基于事故风险特征生成同类企业匹配结果。",
    总稿整合: "总稿整合：正在汇总生成完整三警机制研判报告。",
  };

  return textMap[stepKey];
};

const updateStructuredStepMessage = (
  currentStepKey: AnalogyRiskVisibleStep,
  done = false,
) => {
  const stepOrder: AnalogyRiskVisibleStep[] = [
    "事故字段提取",
    "企业匹配结果生成",
    "总稿整合",
  ];
  const touchedSteps = stepOrder.filter(
    (stepKey) => activeRunStepKeys.has(stepKey) || stepKey === currentStepKey,
  );
  const text = touchedSteps
    .map((stepKey) => {
      if (done || stepKey !== currentStepKey) {
        return `${stepKey}：已完成。`;
      }

      return getStructuredStepText(stepKey);
    })
    .join("\n");
  let message = activeStructuredStepMessageId
    ? messages.value.find((item) => item.id === activeStructuredStepMessageId)
    : undefined;

  if (!message) {
    message = {
      id: Date.now() + messages.value.length,
      role: "ai",
      text,
    };
    activeStructuredStepMessageId = message.id;
    messages.value.push(message);
  } else {
    message.text = text;
  }

  scrollMessagesToBottom();
};

const escapeHtml = (value: string) => {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const renderInlineMarkdown = (value: string) => {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
};

const renderMessageMarkdown = (content: string) => {
  const lines = stripGeneratingPlaceholder(content).split(/\r?\n/);
  const html: string[] = [];
  let listType: "ul" | "ol" | "" = "";

  const closeList = () => {
    if (!listType) return;
    html.push(`</${listType}>`);
    listType = "";
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      closeList();
      return;
    }

    if (/^-{3,}$/.test(line)) {
      closeList();
      html.push("<hr>");
      return;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      const level = Math.min(headingMatch[1].length, 4);
      html.push(
        `<h${level}>${renderInlineMarkdown(headingMatch[2])}</h${level}>`,
      );
      return;
    }

    const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      if (listType !== "ul") {
        closeList();
        html.push("<ul>");
        listType = "ul";
      }
      html.push(`<li>${renderInlineMarkdown(unorderedMatch[1])}</li>`);
      return;
    }

    const orderedMatch = line.match(/^\d+[.、]\s+(.+)$/);
    if (orderedMatch) {
      if (listType !== "ol") {
        closeList();
        html.push("<ol>");
        listType = "ol";
      }
      html.push(`<li>${renderInlineMarkdown(orderedMatch[1])}</li>`);
      return;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  closeList();
  return html.join("");
};

const normalizeFinalReportContent = (content: string) => {
  return stripGeneratingPlaceholder(content)
    .split(/\r?\n/)
    .filter((line) => !/^#{1,6}\s*$/.test(line.trim()))
    .join("\n")
    .trim();
};

const renderFinalReportMarkdown = (content: string) => {
  return renderMessageMarkdown(normalizeFinalReportContent(content));
};

const toRecord = (value: unknown): Record<string, unknown> => {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
};

const toText = (value: unknown) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (value == null) return "";
  return JSON.stringify(value);
};

const toTextList = (value: unknown) => {
  if (!Array.isArray(value)) return [];

  return value.map((item) => toText(item)).filter(Boolean);
};

const getFirstExistingValue = (
  source: Record<string, unknown>,
  keys: string[],
) => {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
  }

  return undefined;
};

const getHazardResultSource = (response: unknown): unknown => {
  if (Array.isArray(response)) return response;

  const data = toRecord(response);
  const directResult = getFirstExistingValue(data, [
    "results",
    "文本一",
    "文本1",
    "text1",
    "text_one",
  ]);

  if (directResult !== undefined) return directResult;

  const nestedData = getFirstExistingValue(data, ["data", "result"]);
  if (nestedData !== undefined && nestedData !== response) {
    return getHazardResultSource(nestedData);
  }

  return [];
};

const parseHazardChecklistItems = (response: unknown): HazardChecklistItem[] => {
  const source = getHazardResultSource(response);
  const list = Array.isArray(source) ? source : source ? [source] : [];

  return list
    .map((item, index) => {
      const record = toRecord(item);
      const labelName =
        toText(
          getFirstExistingValue(record, [
            "label_name",
            "labelName",
            "检查事项",
            "隐患排查项",
            "文本",
          ]),
        ) || toText(item);
      const sourceBasis = toText(
        getFirstExistingValue(record, [
          "source_basis",
          "sourceBasis",
          "依据",
          "法规依据",
        ]),
      );

      return {
        index: String(index + 1).padStart(2, "0"),
        labelName,
        sourceBasis,
      };
    })
    .filter((item) => item.labelName);
};

const createFieldItems = (
  source: Record<string, unknown>,
  orderedLabels: string[],
  emphasisLabels: string[],
): FieldDisplayItem[] => {
  const labels = [
    ...orderedLabels.filter((label) =>
      Object.prototype.hasOwnProperty.call(source, label),
    ),
    ...Object.keys(source).filter((label) => !orderedLabels.includes(label)),
  ];

  return labels.map((label) => {
    const values = toTextList(source[label]);
    const value = values.length ? "" : toText(source[label]);
    const emphasis = emphasisLabels.includes(label);

    return {
      label,
      value,
      values,
      wide: emphasis || value.length > 36 || values.length > 3,
      emphasis,
    };
  });
};

const parseAccidentFieldExtraction = (
  content: string,
): AccidentFieldExtraction | undefined => {
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0 || end <= start) return undefined;

  try {
    const data = JSON.parse(content.slice(start, end + 1)) as Record<
      string,
      unknown
    >;
    const explicit = toRecord(data["明确提取"]);
    const inferred = toRecord(data["推断内容"]);
    const confirmText = content
      .slice(end + 1)
      .replace(/```/g, "")
      .trim();

    return {
      accidentName: toText(data["事故名称"]) || "未命名事故",
      confirmText,
      explicitItems: createFieldItems(
        explicit,
        [
          "事故类型",
          "事故时间",
          "事故场所",
          "事故等级",
          "伤亡情况",
          "核心危险物质",
          "涉及工艺",
          "涉及设备",
          "核心风险点",
          "直接触发因素",
          "工贸细分领域",
          "国民经济行业分类中类",
          "国名经济行业分类中类",
        ],
        ["核心风险点", "直接触发因素"],
      ),
      inferredItems: createFieldItems(
        inferred,
        ["相似工艺", "相似设备", "关联隐患"],
        ["关联隐患"],
      ),
    };
  } catch {
    return undefined;
  }
};

const stripMarkdown = (value: string) => {
  return value
    .replace(/^#{1,6}\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/`/g, "")
    .replace(/^>\s*/, "")
    .trim();
};

const escapeRegExp = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const getMarkdownBulletValue = (content: string, labels: string | string[]) => {
  const labelList = Array.isArray(labels) ? labels : [labels];
  const lines = content.split(/\r?\n/).map(stripMarkdown);

  for (const label of labelList) {
    const labelRegExp = new RegExp(
      `^(?:-\\s*)?${escapeRegExp(label)}\\s*[：:]\\s*(.+)$`,
    );
    const line = lines.find((item) => labelRegExp.test(item));

    if (line) return line.match(labelRegExp)?.[1]?.trim() || "";
  }

  return "";
};

const splitMarkdownTableRow = (line: string) => {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => stripMarkdown(cell));
};

const parseRiskClass = (
  riskLevel: string,
): EnterpriseCandidate["riskClass"] => {
  const value = riskLevel.toLowerCase();
  if (value.includes("high") || value.includes("高")) return "high";
  if (value.includes("medium") || value.includes("中")) return "medium";
  return "low";
};

const parseCandidateRows = (content: string): EnterpriseCandidate[] => {
  const listStart = content.indexOf("候选企业清单");
  const checkStart = content.indexOf("候选输出核对");
  const tableContent =
    listStart >= 0
      ? content.slice(
          listStart,
          checkStart > listStart ? checkStart : undefined,
        )
      : content;

  return tableContent
    .split(/\r?\n/)
    .filter((line) => /^\|\s*\d+\s*\|/.test(line))
    .map((line) => {
      const [
        index = "",
        riskLevel = "",
        enterpriseId = "",
        enterpriseName = "",
        confidenceScore = "",
        matchSummary = "",
      ] = splitMarkdownTableRow(line);

      return {
        index,
        riskLevel,
        riskClass: parseRiskClass(riskLevel),
        enterpriseId,
        enterpriseName,
        confidenceScore,
        matchSummary,
      };
    });
};

const parseCheckRows = (content: string): MatchSummaryItem[] => {
  const checkStart = content.indexOf("候选输出核对");
  if (checkStart < 0) return [];

  const isDividerCell = (value: string) => /^:?-+:?$/.test(value);

  return content
    .slice(checkStart)
    .split(/\r?\n/)
    .filter((line) => /^\|\s*[^|]+\s*\|\s*[^|]+\s*\|/.test(line))
    .map(splitMarkdownTableRow)
    .filter(([label, value]) => {
      if (!label || !value) return false;
      return (
        label !== "核对项" && !isDividerCell(label) && !isDividerCell(value)
      );
    })
    .map(([label, value]) => ({ label, value }));
};

const parseEnterpriseMatchResult = (
  content: string,
): EnterpriseMatchResult | undefined => {
  const isComplete =
    content.includes("企业匹配结果已展示") || content.includes("核对结果");
  if (!isComplete) return undefined;

  const candidates = parseCandidateRows(content);
  if (!candidates.length) return undefined;

  const serviceStatus = getMarkdownBulletValue(content, "服务调用状态");
  const totalMatched = getMarkdownBulletValue(content, [
    "总匹配企业数（total_matched）",
    "总匹配企业数 (total_matched)",
    "满足召回条件的企业总数（total_matched）",
    "满足召回条件的企业总数 (total_matched)",
  ]);
  const returnedCount = getMarkdownBulletValue(content, "本次返回候选数");
  const countCandidatesByRiskClass = (
    riskClass: EnterpriseCandidate["riskClass"],
  ) => `${candidates.filter((item) => item.riskClass === riskClass).length} 家`;
  const highCount =
    getMarkdownBulletValue(content, [
      "high 档",
      "高风险（high）企业",
      "高风险（high）",
      "高风险 (high)",
      "高风险(high)",
    ]) || countCandidatesByRiskClass("high");
  const mediumCount =
    getMarkdownBulletValue(content, [
      "medium 档",
      "中风险（medium）企业",
      "中风险（medium）",
      "中风险 (medium)",
      "中风险(medium)",
    ]) || countCandidatesByRiskClass("medium");
  const lowCount =
    getMarkdownBulletValue(content, [
      "low 档",
      "低风险（low）企业",
      "低风险（low）",
      "低风险 (low)",
      "低风险(low)",
    ]) || countCandidatesByRiskClass("low");
  const checkResultMatch = content.match(/\*\*核对结果\*\*[：:]\s*([^\n]+)/);
  const noteMatch =
    content.match(/>\s*\*\*(本结果.+?)\*\*/) ||
    content.match(/\*\*(本结果.+?)\*\*/);
  const lastDividerIndex = content.lastIndexOf("---");
  const confirmSource =
    lastDividerIndex >= 0 ? content.slice(lastDividerIndex + 3) : content;
  const confirmText = confirmSource
    .replace(/>\s*\*\*.+?\*\*/g, "")
    .trim()
    .split(/\r?\n/)
    .find((line) => line.includes("企业匹配结果已展示"));

  return {
    title: "同类风险企业匹配结果",
    confirmText: stripMarkdown(confirmText || ""),
    serviceStatus,
    serviceOk:
      serviceStatus.includes("成功") || serviceStatus.includes("success=true"),
    summaryItems: [
      {
        label: "总匹配企业数",
        value: totalMatched || String(candidates.length),
      },
      {
        label: "本次返回候选数",
        value: returnedCount || String(candidates.length),
      },
    ],
    riskCounts: [
      { key: "high", label: "高风险", value: highCount },
      { key: "medium", label: "中风险", value: mediumCount },
      { key: "low", label: "低风险", value: lowCount },
    ],
    candidates,
    checkItems: parseCheckRows(content),
    checkResult: stripMarkdown(checkResultMatch?.[1] || ""),
    note: stripMarkdown(noteMatch?.[1] || ""),
  };
};

const refreshStep = (
  stepKey: AnalogyRiskVisibleStep,
  updater: (step: ReportStepState) => void,
) => {
  const stepIndex = reportSteps.value.findIndex((step) => step.key === stepKey);
  if (stepIndex < 0) return;

  const nextSteps = [...reportSteps.value];
  updater(nextSteps[stepIndex]);
  reportSteps.value = nextSteps;
};

const markPreviousStepsDone = (currentStepKey: AnalogyRiskVisibleStep) => {
  const currentIndex = reportSteps.value.findIndex(
    (step) => step.key === currentStepKey,
  );
  if (currentIndex <= 0) return;

  reportSteps.value = reportSteps.value.map((step, index) => {
    if (
      index < currentIndex &&
      step.content.trim() &&
      step.status === "active"
    ) {
      return { ...step, status: "done", progress: "100" };
    }

    return step;
  });
};

const handleStreamChunk = (
  chunk: Parameters<typeof getAnalogyRiskChunkContent>[0],
) => {
  const rawStep = getAnalogyRiskChunkStep(chunk, lastChunkStep);
  if (rawStep) {
    lastChunkStep = rawStep;
  }

  const requiredInputPrompt = getAnalogyRiskRequiredInputPrompt(chunk);
  if (requiredInputPrompt) {
    streamError.value = requiredInputPrompt;
    throw new Error(requiredInputPrompt);
  }

  const stepKey = normalizeAnalogyRiskStep(rawStep);
  const content = getAnalogyRiskChunkContent(chunk);
  const progress = getAnalogyRiskChunkProgress(chunk);
  if (!stepKey) {
    appendChatStreamContent(content);
    return;
  }
  const strippedContent = stripGeneratingPlaceholder(content);
  const isGeneratingPlaceholderOnly =
    Boolean(content.trim()) && !strippedContent.trim();
  if (!strippedContent && !progress && !isGeneratingPlaceholderOnly) return;

  markPreviousStepsDone(stepKey);
  refreshStep(stepKey, (step) => {
    if (!activeRunStepKeys.has(stepKey)) {
      activeRunStepKeys.add(stepKey);
      step.content = "";
      step.progress = "0";
      if (stepKey === "总稿整合") {
        isFinalReportStreaming.value = true;
      }
    }
    updateStructuredStepMessage(stepKey);

    const stepContent = step.content.trim() ? content : strippedContent;
    if (!stepContent && !progress && !isGeneratingPlaceholderOnly) return;

    step.status = progress === "100" ? "done" : "active";
    if (progress) step.progress = progress;
    if (stepContent) step.content += stepContent;
  });
};

const finishActiveSteps = () => {
  reportSteps.value = reportSteps.value.map((step) => {
    if (!step.content.trim()) {
      return step.status === "active"
        ? { ...step, status: "pending", progress: "0" }
        : step;
    }
    return { ...step, status: "done", progress: "100" };
  });
  if (activeRunStepKeys.size) {
    const completedSteps = [...activeRunStepKeys];
    const completedStep = completedSteps[completedSteps.length - 1];
    if (completedStep) updateStructuredStepMessage(completedStep, true);
  }
  isFinalReportStreaming.value = false;
};

const analyzeFinalReportHazards = async () => {
  const reportContent = finalStep.value.content.trim();
  if (!reportContent) return;

  const reportContentBase64 = encodeReportContentToBase64(reportContent);

  hazardChecklistItems.value = [];
  hazardAnalyzeError.value = "";
  isAnalyzingHazards.value = true;
  try {
    const response = await analyzeCompanyReport(reportContentBase64);
    hazardChecklistItems.value = parseHazardChecklistItems(response);
  } catch (error) {
    console.error("[tag-matcher] analyze failed", error);
    hazardAnalyzeError.value =
      error instanceof Error ? error.message : "隐患分析接口调用失败";
  } finally {
    isAnalyzingHazards.value = false;
  }
};

const resetReportState = () => {
  activeController?.abort();
  sessionId.value = createAnalogyRiskSessionId();
  localStorage.setItem(sessionStorageKey, sessionId.value);
  reportSteps.value = createReportSteps();
  streamError.value = "";
  hazardChecklistItems.value = [];
  hazardAnalyzeError.value = "";
  isAnalyzingHazards.value = false;
  isFinalReportStreaming.value = false;
  lastChunkStep = "";
  activeChatStreamMessageId = undefined;
  activeStructuredStepMessageId = undefined;
  activeRunStepKeys = new Set();
  saved.value = false;
  issued.value = false;
};

const runAgent = async (message: string, initial: boolean) => {
  if (isGenerating.value) return;

  if (initial) {
    resetReportState();
  } else {
    streamError.value = "";
    hazardChecklistItems.value = [];
    hazardAnalyzeError.value = "";
    isAnalyzingHazards.value = false;
    isFinalReportStreaming.value = false;
    lastChunkStep = "";
    activeChatStreamMessageId = undefined;
    activeStructuredStepMessageId = undefined;
    activeRunStepKeys = new Set();
    saved.value = false;
    issued.value = false;
  }

  isGenerating.value = true;
  activeController = new AbortController();
  await pushMessage({ role: "user", text: message });

  try {
    await streamAnalogyRiskAgent({
      sessionId: sessionId.value,
      tenantId,
      message,
      files: reportFiles,
      initial,
      signal: activeController.signal,
      onChunk: handleStreamChunk,
    });

    finishActiveSteps();
    const shouldAnalyzeHazards = activeRunStepKeys.has("总稿整合");
    isGenerating.value = false;
    if (shouldAnalyzeHazards) {
      await analyzeFinalReportHazards();
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") return;

    const messageText =
      error instanceof Error ? error.message : "三警机制研判报告生成失败";
    streamError.value = messageText;
    isFinalReportStreaming.value = false;
    reportSteps.value = reportSteps.value.map((step) =>
      step.status === "active" ? { ...step, status: "error" } : step,
    );
    ElMessage.error(messageText);
    await pushMessage({ role: "ai", text: `接口调用失败：${messageText}` });
  } finally {
    isGenerating.value = false;
    activeController = undefined;
  }
};

const startReportGeneration = () => {
  runAgent("请基于上传事故调查报告生成完整三警机制研判报告", true);
};

const sendChat = () => {
  const text = chatText.value.trim();
  if (!text || isGenerating.value) return;

  chatText.value = "";
  runAgent(text, !hasReportContent.value);
};

const savePlan = () => {
  if (!reportReady.value) return;

  const status = readPlanStatus();
  status[detail.id] = { ...status[detail.id], generated: true };
  writePlanStatus(status);
  saved.value = true;
  ElMessage.success("研判报告已保存");
};

const issueTask = () => {
  if (!saved.value) return;

  const status = readPlanStatus();
  status[detail.id] = { ...status[detail.id], generated: true, issued: true };
  writePlanStatus(status);
  issued.value = true;
  ElMessage.success("专项任务已下发");
};

onBeforeUnmount(() => {
  activeController?.abort();
});
</script>

<style scoped lang="scss">
.detail-page {
  display: grid;
  grid-template-columns: minmax(360px, 460px) minmax(560px, 1fr) minmax(
      360px,
      480px
    );
  grid-template-rows: minmax(0, 1fr);
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
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.65;
}

.message-markdown {
  margin-top: 6px;
  word-break: break-word;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 12px 0 7px;
    color: $ink;
    font-weight: 700;
    line-height: 1.45;
  }

  :deep(h1) {
    font-size: 16px;
  }

  :deep(h2),
  :deep(h3) {
    font-size: 15px;
  }

  :deep(h4) {
    font-size: 14px;
  }

  :deep(p) {
    margin: 7px 0;
  }

  :deep(ul),
  :deep(ol) {
    padding-left: 18px;
    margin: 7px 0;
  }

  :deep(li) {
    margin: 4px 0;
  }

  :deep(strong) {
    color: $ink;
    font-weight: 700;
  }

  :deep(code) {
    padding: 1px 4px;
    background: #f1f5f9;
    border-radius: 4px;
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 12px;
  }

  :deep(hr) {
    height: 1px;
    margin: 12px 0;
    background: $border-light;
    border: 0;
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

.message.user .message-markdown {
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(strong) {
    color: #fff;
  }

  :deep(code) {
    color: #fff;
    background: rgba(255, 255, 255, 0.18);
  }

  :deep(hr) {
    background: rgba(255, 255, 255, 0.35);
  }
}

.chat-loading {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  padding: 9px 16px 8px;
  background: #f8fafc;
  border-top: 1px solid $border-light;
}

.typing-dots {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-width: 34px;
  height: 22px;
  padding: 0 8px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: 999px;
  box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);

  i {
    display: block;
    width: 5px;
    height: 5px;
    background: $brand;
    border-radius: 50%;
    animation: typing-dot-pulse 1s ease-in-out infinite;
  }

  i:nth-child(2) {
    animation-delay: 0.15s;
  }

  i:nth-child(3) {
    animation-delay: 0.3s;
  }
}

@keyframes typing-dot-pulse {
  0%,
  80%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  40% {
    opacity: 1;
    transform: translateY(-3px);
  }
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
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.right-grid {
  grid-template-rows: repeat(2, minmax(0, 1fr));
}

.stage-card {
  flex-direction: column;
}

.stage-header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 10px;
  min-height: 68px;
  padding: 12px 16px;
  border-bottom: 1px solid $border-light;
}

.stage-header.compact {
  min-height: 60px;
}

.header-icon {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  color: $brand;
  background: $brand-soft;
  border-radius: 8px;
  font-weight: 700;
}

.header-icon.success {
  color: #15803d;
  background: #f0fdf4;
}

.header-title {
  min-width: 0;

  h2 {
    margin: 0;
    color: $ink;
    font-size: 16px;
    font-weight: 700;
    line-height: 1.3;
  }

  p {
    margin: 4px 0 0;
    color: $ink-muted;
    font-size: 12px;
    line-height: 1.3;
  }
}

.stage-body {
  flex: 1;
  min-height: 0;
  padding: 14px 16px 16px;
  overflow-y: auto;
}

.markdown-content {
  color: $ink-soft;
  font-size: 13px;
  line-height: 1.75;
  white-space: pre-wrap;
  word-break: break-word;
}

.structured-loading {
  display: flex;
  min-height: 220px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: $ink-muted;
  text-align: center;

  strong {
    margin-top: 12px;
    color: $ink-soft;
    font-size: 14px;
  }

  p {
    max-width: 320px;
    margin: 6px 0 0;
    font-size: 12px;
    line-height: 1.6;
  }
}

.loading-ring {
  width: 30px;
  height: 30px;
  border: 3px solid #dbeafe;
  border-top-color: $brand;
  border-radius: 50%;
  animation: field-loading-spin 0.8s linear infinite;
}

@keyframes field-loading-spin {
  to {
    transform: rotate(360deg);
  }
}

.field-extraction {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-hero {
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid $border-light;
  border-left: 3px solid $brand;
  border-radius: 8px;

  span {
    display: block;
    color: $ink-muted;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: $ink;
    font-size: 15px;
    line-height: 1.55;
  }

  p {
    margin: 8px 0 0;
    color: $ink-muted;
    font-size: 12px;
    line-height: 1.6;
  }
}

.field-section {
  h3 {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 10px;
    color: $ink;
    font-size: 13px;
    font-weight: 700;
  }

  h3::before {
    width: 3px;
    height: 14px;
    content: "";
    background: $brand;
    border-radius: 2px;
  }
}

.field-section.inferred h3::before {
  background: $warning;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.field-item {
  min-width: 0;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: 8px;

  > span {
    display: block;
    margin-bottom: 6px;
    color: $ink-muted;
    font-size: 12px;
    line-height: 1.3;
  }

  p {
    margin: 0;
    color: $ink-soft;
    font-size: 13px;
    line-height: 1.65;
    word-break: break-word;
  }

  p.muted {
    color: #a3aab7;
  }
}

.field-item.wide {
  grid-column: 1 / -1;
}

.field-item.emphasis {
  background: #fff7ed;
  border-color: #fed7aa;

  > span {
    color: #c2410c;
  }

  p {
    color: #7c2d12;
  }
}

.field-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.field-tag {
  max-width: 100%;
  padding: 3px 8px;
  color: #1d4ed8;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  word-break: break-word;
}

.field-tag.inferred {
  color: #15803d;
  background: #f0fdf4;
  border-color: #bbf7d0;
}

.enterprise-match {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  background: #f8fafc;
  border: 1px solid $border-light;
  border-left: 3px solid $brand;
  border-radius: 8px;

  span {
    display: block;
    color: $ink-muted;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: $ink;
    font-size: 15px;
  }

  p {
    margin: 8px 0 0;
    color: $ink-muted;
    font-size: 12px;
    line-height: 1.6;
  }
}

.service-status {
  flex-shrink: 0;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
}

.service-status.ok {
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
}

.service-status.warn {
  color: #c2410c;
  background: #fff7ed;
  border: 1px solid #fed7aa;
}

.match-stats,
.risk-distribution,
.check-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.match-stats {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.match-stat,
.risk-count,
.check-item {
  min-width: 0;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: 8px;

  span {
    display: block;
    color: $ink-muted;
    font-size: 12px;
  }

  strong {
    display: block;
    margin-top: 4px;
    color: $ink;
    font-size: 15px;
    word-break: break-word;
  }
}

.risk-count.high {
  background: #fef2f2;
  border-color: #fecaca;

  strong {
    color: $danger;
  }
}

.risk-count.medium {
  background: #fff7ed;
  border-color: #fed7aa;

  strong {
    color: #c2410c;
  }
}

.risk-count.low {
  background: #f0fdf4;
  border-color: #bbf7d0;

  strong {
    color: #15803d;
  }
}

.match-section {
  h3 {
    margin: 0;
    color: $ink;
    font-size: 13px;
    font-weight: 700;
  }
}

.match-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;

  span {
    color: $ink-muted;
    font-size: 12px;
  }
}

.enterprise-table-wrap {
  overflow: auto;
  border: 1px solid $border-light;
  border-radius: 8px;
}

.enterprise-table {
  width: 100%;
  min-width: 840px;
  border-collapse: collapse;
  background: #fff;
  font-size: 12px;

  th,
  td {
    padding: 9px 10px;
    border-bottom: 1px solid $border-light;
    color: $ink-soft;
    text-align: left;
    vertical-align: top;
  }

  th {
    position: sticky;
    top: 0;
    z-index: 1;
    color: $ink-muted;
    background: #f8fafc;
    font-weight: 700;
  }

  tr:last-child td {
    border-bottom: 0;
  }

  td:first-child,
  th:first-child {
    width: 54px;
    text-align: center;
  }

  td:nth-child(2),
  th:nth-child(2) {
    width: 124px;
    text-align: center;
  }

  td:nth-child(4),
  th:nth-child(4) {
    width: 86px;
  }

  strong {
    display: block;
    color: $ink;
    font-size: 12px;
    line-height: 1.45;
  }

  code {
    display: block;
    margin-top: 3px;
    color: $ink-muted;
    font-size: 11px;
    word-break: break-all;
  }
}

.risk-pill {
  display: inline-flex;
  min-width: 78px;
  align-items: center;
  justify-content: center;
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  white-space: nowrap;
}

.risk-pill.high {
  color: $danger;
  background: #fef2f2;
}

.risk-pill.medium {
  color: #c2410c;
  background: #fff7ed;
}

.risk-pill.low {
  color: #15803d;
  background: #f0fdf4;
}

.check-result,
.match-note {
  margin: 10px 0 0;
  color: $ink-muted;
  font-size: 12px;
  line-height: 1.6;
}

.match-note {
  padding: 10px 12px;
  background: #fffbeb;
  border: 1px solid #fef3c7;
  border-radius: 8px;
}

.hazard-checklist {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.hazard-check-item {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 10px;
  padding: 12px;
  background: #fff;
  border: 1px solid $border-light;
  border-left: 3px solid $success;
  border-radius: 8px;
}

.hazard-check-index {
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
}

.hazard-check-content {
  min-width: 0;

  p {
    margin: 0;
    color: $ink;
    font-size: 13px;
    line-height: 1.7;
    word-break: break-word;
  }

  strong {
    display: block;
    margin-top: 8px;
    color: $ink-muted;
    font-size: 12px;
    font-weight: 600;
    line-height: 1.5;
    word-break: break-word;
  }
}

.final-content {
  color: $ink;
  padding: 16px 18px 18px;
  background: #fff;
  border: 1px solid $border-light;
  border-radius: 8px;
  box-shadow: inset 0 3px 0 $brand;
  font-size: 14px;
  line-height: 1.9;
  white-space: normal;

  :deep(p) {
    margin: 10px 0;
    color: #334155;
    text-align: justify;
  }

  :deep(p:first-child) {
    display: inline-flex;
    margin: 0 0 12px;
    padding: 3px 8px;
    color: #991b1b;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 700;
    line-height: 1.4;
  }

  :deep(p:first-child strong) {
    color: inherit;
  }

  :deep(h1) {
    margin: 2px 0 8px;
    color: $ink;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.45;
    text-align: center;
  }

  :deep(h2) {
    margin: 18px 0 10px;
    padding: 8px 10px;
    color: #1d4ed8;
    background: #eff6ff;
    border-left: 4px solid $brand;
    border-radius: 6px;
    font-size: 16px;
    font-weight: 800;
    line-height: 1.45;
  }

  :deep(h3) {
    margin: 16px 0 8px;
    color: $ink;
    font-size: 15px;
    font-weight: 800;
    line-height: 1.5;
  }

  :deep(h4) {
    margin: 14px 0 8px;
    color: $ink-soft;
    font-size: 14px;
    font-weight: 700;
  }

  :deep(strong) {
    color: $ink;
    font-weight: 800;
  }

  :deep(ol),
  :deep(ul) {
    margin: 8px 0 12px;
    padding-left: 22px;
    color: #334155;
  }

  :deep(li) {
    margin: 5px 0;
    padding-left: 2px;
  }

  :deep(hr) {
    height: 1px;
    margin: 18px 0;
    background: $border-light;
    border: 0;
  }
}

.final-card .error-box {
  margin-bottom: 10px;
}

.empty-state {
  display: flex;
  height: 100%;
  min-height: 140px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  text-align: center;
  font-size: 13px;

  strong {
    color: $ink-muted;
  }

  p {
    max-width: 280px;
    margin: 8px 0 0;
  }
}

.error-box {
  padding: 10px 12px;
  color: $danger;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.5;
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
</style>
