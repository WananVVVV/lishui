const TAG_MATCHER_ANALYZE_URL = import.meta.env.VITE_TAG_MATCHER_ANALYZE_URL
const TAG_MATCHER_REQUEST_URL = `${import.meta.env.BASE_URL}documents/tagmatcher-request.txt`

export type TagMatcherAnalyzePayload = {
  tasktype: '1'
  report_content: string
  filter_ids: []
}

const extractReportContent = (requestText: string) => {
  const match = requestText.match(/"report_content"\s*:\s*"([^"]+)"/)
  const reportContent = match?.[1]?.trim()

  if (!reportContent) {
    throw new Error('未在 tagmatcher-request.txt 中找到 report_content')
  }

  return reportContent
}

export const loadCompanyReportBase64 = async () => {
  const response = await fetch(TAG_MATCHER_REQUEST_URL)

  if (!response.ok) {
    throw new Error(`隐患分析请求文本读取失败：${response.status}`)
  }

  return extractReportContent(await response.text())
}

export const encodeReportContentToBase64 = (content: string) => {
  const bytes = new TextEncoder().encode(content)
  let binary = ''
  const chunkSize = 0x8000

  for (let index = 0; index < bytes.length; index += chunkSize) {
    const chunk = bytes.subarray(index, index + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return btoa(binary)
}

export const analyzeCompanyReport = async (reportContent?: string) => {
  if (!TAG_MATCHER_ANALYZE_URL) {
    throw new Error('请配置 VITE_TAG_MATCHER_ANALYZE_URL')
  }

  const encodedReportContent =
    reportContent ?? (await loadCompanyReportBase64())
  const payload: TagMatcherAnalyzePayload = {
    tasktype: '1',
    report_content: encodedReportContent,
    filter_ids: [],
  }

  const response = await fetch(TAG_MATCHER_ANALYZE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `隐患分析接口调用失败：${response.status}`)
  }

  return response.json()
}
