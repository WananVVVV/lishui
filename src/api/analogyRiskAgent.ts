const ANALOGY_RISK_AGENT_URL =
  import.meta.env.VITE_ANALOGY_RISK_AGENT_URL ||
  '/agent/analogy-risk-agent/v1/chat/completions'

export const ANALOGY_RISK_VISIBLE_STEPS = [
  '事故字段提取',
  '企业匹配结果生成',
  '总稿整合',
] as const

export type AnalogyRiskVisibleStep = (typeof ANALOGY_RISK_VISIBLE_STEPS)[number]

export type AnalogyRiskFile = {
  fileId: string
  fileName: string
}

export type AnalogyRiskStreamChunk = {
  choices?: Array<{
    delta?: {
      content?: string
      reasoning_content?: string | null
      role?: string
    }
    finish_reason?: string | null
    index?: number
  }>
  custom?: {
    current_step?: {
      step?: string
      progress?: string
    }
    ws_result?: {
      subtask?: string
      type?: string
      input_kind?: string
      prompt?: string
      missing_sources?: string[]
      [key: string]: unknown
    } | null
  }
  [key: string]: unknown
}

export type AnalogyRiskStreamPayload = {
  sessionId: string
  tenantId: string
  message: string
  files?: AnalogyRiskFile[]
  initial?: boolean
  signal?: AbortSignal
  onChunk: (chunk: AnalogyRiskStreamChunk) => void
}

export const createAnalogyRiskSessionId = () =>
  `front-session-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`

const nonEmptyString = (value: unknown) =>
  typeof value === 'string' && value.trim() ? value.trim() : ''

export const getAnalogyRiskChunkStep = (
  chunk: AnalogyRiskStreamChunk,
  lastStep = '',
) => {
  const wsSubtask = nonEmptyString(chunk.custom?.ws_result?.subtask)
  if (wsSubtask) return wsSubtask

  const currentStep = nonEmptyString(chunk.custom?.current_step?.step)
  if (currentStep) return currentStep

  return lastStep
}

export const normalizeAnalogyRiskStep = (
  step: string,
): AnalogyRiskVisibleStep | undefined => {
  if (ANALOGY_RISK_VISIBLE_STEPS.includes(step as AnalogyRiskVisibleStep)) {
    return step as AnalogyRiskVisibleStep
  }

  if (step.includes('事故字段')) return '事故字段提取'
  if (step.includes('企业匹配')) return '企业匹配结果生成'
  if (step.includes('总稿')) return '总稿整合'

  return undefined
}

export const getAnalogyRiskChunkContent = (chunk: AnalogyRiskStreamChunk) =>
  chunk.choices?.[0]?.delta?.content ?? ''

export const getAnalogyRiskChunkProgress = (chunk: AnalogyRiskStreamChunk) =>
  nonEmptyString(chunk.custom?.current_step?.progress)

export const getAnalogyRiskRequiredInputPrompt = (chunk: AnalogyRiskStreamChunk) => {
  const wsResult = chunk.custom?.ws_result
  if (wsResult?.type !== 'requires_input') return ''

  const prompt = nonEmptyString(wsResult.prompt)
  if (prompt) return prompt

  const missingSources = Array.isArray(wsResult.missing_sources)
    ? wsResult.missing_sources.filter((item): item is string => typeof item === 'string')
    : []

  return missingSources.length ? `请提供以下文件：${missingSources.join('、')}` : '接口需要补充输入'
}

const buildPayload = ({
  sessionId,
  tenantId,
  message,
  files = [],
  initial = false,
}: Omit<AnalogyRiskStreamPayload, 'signal' | 'onChunk'>) => {
  const selectedFiles = initial ? files : []

  return {
    messages: [
      {
        role: 'user',
        content: message,
      },
    ],
    sessionId,
    chatType: 'doc-generate',
    customParams: initial
      ? {
          tags: selectedFiles.map((file) => ({
            keyName: '文件名',
            valueName: file.fileName,
          })),
        }
      : {},
    fileIds: selectedFiles.map((file) => file.fileId),
    model: 'doc-generate-agent',
    stream: true,
    tenantId,
  }
}

const parseSseLine = (
  line: string,
  onChunk: (chunk: AnalogyRiskStreamChunk) => void,
) => {
  if (!line.startsWith('data:')) {
    return
  }

  const data = line.slice(5).trim()
  if (!data || data === '[DONE]') return

  let chunk: AnalogyRiskStreamChunk
  try {
    chunk = JSON.parse(data) as AnalogyRiskStreamChunk
  } catch (error) {
    console.warn('analogy-risk-agent SSE chunk parse failed', error)
    return
  }

  onChunk(chunk)
}

export const streamAnalogyRiskAgent = async ({
  sessionId,
  tenantId,
  message,
  files,
  initial,
  signal,
  onChunk,
}: AnalogyRiskStreamPayload) => {
  const payload = buildPayload({ sessionId, tenantId, message, files, initial })

  const response = await fetch(ANALOGY_RISK_AGENT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      sessionId,
      tenantId,
    },
    body: JSON.stringify(payload),
    signal,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `三警机制研判报告生成失败：${response.status}`)
  }

  if (!response.body) {
    throw new Error('三警机制研判报告接口未返回流式内容')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() ?? ''

    lines.forEach((line) => parseSseLine(line, onChunk))
  }

  buffer += decoder.decode()
  if (buffer) {
    buffer.split(/\r?\n/).forEach((line) => parseSseLine(line, onChunk))
  }
}
