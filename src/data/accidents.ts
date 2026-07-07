export type Accident = {
  id: number
  name: string
  fileId: string
  fileName: string
  source: string
  time: string
  generated: boolean
  issued: boolean
  hazardCount: number
}

export type MatchUnit = {
  name: string
  type: string
  address: string
  street: string
}

export type ChecklistItem = {
  type: string
  text: string
  sourceBasis?: string
}

export type AccidentDetail = Accident & {
  rootCause: string
  industries: string[]
  risks: string[]
  devices: string[]
  histories: string[]
  matchTotal: number
  matchUnits: MatchUnit[]
  checklist: ChecklistItem[]
  letterTitle: string
  letterContent: string[]
}

export const accidents: Accident[] = [
  {
    id: 1,
    name: '泰州医药高新区江苏惠利生物科技有限公司3·11较大爆炸事故调查报告',
    fileId: '5261986d829940dd8de7f5f4147c786c',
    fileName: '泰州医药高新区江苏惠利生物科技有限公司3·11较大爆炸事故调查报告',
    source: '江苏省人民政府调查组',
    time: '2025-09-01 00:00:00',
    generated: false,
    issued: false,
    hazardCount: 0,
  },
  {
    id: 2,
    name: '无锡江阴市恒园彩纤有限公司“7•17”较大闪爆事故调查报告',
    fileId: '7dcd1c6c8e394d6786cb25bc7328c840',
    fileName: '无锡江阴市恒园彩纤有限公司“7•17”较大闪爆事故调查报告',
    source: '无锡市人民政府事故调查组',
    time: '2025-06-01 00:00:00',
    generated: false,
    issued: false,
    hazardCount: 0,
  },
  {
    id: 3,
    name: '海安亚太轻合金（南通）科技有限公司“2•18”较大爆炸事故调查报告',
    fileId: '5941bda9621b4245a41259229ecd3935',
    fileName: '海安亚太轻合金（南通）科技有限公司“2•18”较大爆炸事故调查报告',
    source: '海安市事故调查组',
    time: '2024-02-18 00:00:00',
    generated: false,
    issued: false,
    hazardCount: 0,
  },
]

export const accidentDetails: Record<number, AccidentDetail> = {
  1: {
    ...accidents[0],
    rootCause: '事故涉及不具备安全生产条件、非法生产爆炸性物质、工艺变更失控和监管责任缺位等问题。',
    industries: ['生物科技', '精细化工', '危化品使用', '中试生产'],
    risks: ['爆炸性物质', '非法生产', '工艺变更', '安全条件不足'],
    devices: ['反应釜', '中试装置', '晾干场地', '通风设施'],
    histories: ['操作规程缺失', '人员培训不足', '项目手续不全', '现场风险辨识不足'],
    matchTotal: 0,
    matchUnits: [],
    checklist: [],
    letterTitle: '关于立即开展同类危化风险专项排查整治的提示函',
    letterContent: [
      '排查范围：涉及爆炸性物质、危化品使用、中试生产和工艺变更的生产经营单位。',
      '排查重点：项目手续、工艺安全、操作规程、人员培训、现场储存和晾干作业安全条件。',
      '工作要求：对不具备安全生产条件的场所立即停用整改，形成问题闭环。'
    ],
  },
  2: {
    ...accidents[1],
    rootCause: '事故暴露出化纤行业生产工艺安全风险认识不足、企业安全管理流于形式、“厂中厂”专项整治不彻底等问题。',
    industries: ['化纤生产', '纺织加工', '厂中厂', '技术改造'],
    risks: ['闪爆', '工艺改造风险', '安全管理缺失', '厂房租赁交叉风险'],
    devices: ['生产装置', '改造设备', '通风设施', '厂房建筑'],
    histories: ['风险辨识不足', '安全检查流于形式', '行业监管不到位', '专项整治不彻底'],
    matchTotal: 0,
    matchUnits: [],
    checklist: [],
    letterTitle: '关于立即开展化纤及厂中厂安全专项排查整治的提示函',
    letterContent: [
      '排查范围：化纤生产、纺织加工、存在技术改造和厂中厂形态的生产经营单位。',
      '排查重点：工艺改造风险、设备更新、安全管理体系、租赁厂房边界和现场应急条件。',
      '工作要求：属地和行业部门应推动设备更新改造，全面管控同类安全风险。'
    ],
  },
  3: {
    ...accidents[2],
    rootCause: '事故暴露出铝加工深井铸造设备缺陷、风险管控措施失效、作业人员违规操作和安全教育培训不足等问题。',
    industries: ['铝加工', '深井铸造', '有色金属加工', '高温熔融金属'],
    risks: ['铝液遇水爆炸', '设备定位缺陷', '违规撬动作业', '风险辨识不足'],
    devices: ['铸造机', '模盘', '引锭盘', '液压平台'],
    histories: ['定位螺杆缺失', '设备维护不到位', '违规操作长期存在', '专项检查不深入'],
    matchTotal: 0,
    matchUnits: [],
    checklist: [],
    letterTitle: '关于立即开展铝加工深井铸造安全专项排查整治的提示函',
    letterContent: [
      '排查范围：铝加工深井铸造、高温熔融金属和相关设备设施使用单位。',
      '排查重点：铸造设备定位、模盘和引锭盘维护、铝液遇水风险、作业规程和现场违章行为。',
      '工作要求：对重点设备、重点工艺、重点环节开展深度检查，及时消除重大风险。'
    ],
  },
}

const createFallbackAccidentDetail = (base: Accident): AccidentDetail => ({
  ...base,
  rootCause: '根据事故类型提取关键风险因素，形成类比排查对象、隐患清单和专项任务提示内容。',
  industries: ['重点监管行业', '相关生产经营单位'],
  risks: ['现场管理缺失', '设备设施异常', '作业审批不严'],
  devices: ['安全设施', '监测报警装置', '应急装备'],
  histories: ['同类隐患反复出现', '闭环整改不彻底'],
  matchTotal: 0,
  matchUnits: [],
  checklist: [],
  letterTitle: '关于开展同类事故专项排查整治的提示函',
  letterContent: [
    '排查范围：与事故类型、作业场景和设备设施相近的生产经营单位。',
    '排查重点：事故暴露出的关键风险、薄弱环节和历史隐患。',
    '工作要求：形成问题清单并按期完成整改闭环。',
  ],
})

export const getAccidentDetail = (id: number) => {
  const base = accidents.find((item) => item.id === id) || accidents[0]

  return accidentDetails[id] || createFallbackAccidentDetail(base)
}

export const getAccidentDetailByFileId = (fileId: string) => {
  const base = accidents.find((item) => item.fileId === fileId) || accidents[0]

  return accidentDetails[base.id] || createFallbackAccidentDetail(base)
}

export type PlanStatus = Record<number, { generated?: boolean; issued?: boolean }>

const PLAN_STATUS_STORAGE_KEY = 'realAccidentPlanStatus'

export const readPlanStatus = (): PlanStatus => {
  try {
    return JSON.parse(localStorage.getItem(PLAN_STATUS_STORAGE_KEY) || '{}') as PlanStatus
  } catch {
    return {}
  }
}

export const writePlanStatus = (status: PlanStatus) => {
  localStorage.setItem(PLAN_STATUS_STORAGE_KEY, JSON.stringify(status))
}
