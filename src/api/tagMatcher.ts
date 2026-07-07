const TAG_MATCHER_ANALYZE_URL = import.meta.env.VITE_TAG_MATCHER_ANALYZE_URL

export type TagMatcherAnalyzePayload = {
  tasktype: '1'
  report_content: string
  filter_ids: []
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

export const analyzeCompanyReport = async (reportContent: string) => {
  if (!TAG_MATCHER_ANALYZE_URL) {
    throw new Error('请配置 VITE_TAG_MATCHER_ANALYZE_URL')
  }

  const encodedReportContent = reportContent.trim()
  if (!encodedReportContent) {
    throw new Error('隐患分析接口缺少 report_content')
  }

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
