export type Accident = {
  id: number
  name: string
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
  { id: 1, name: '6·21银川烧烤店爆炸事故', source: '国家应急管理部', time: '2026-06-05 09:30:00', generated: false, issued: false, hazardCount: 0 },
  { id: 2, name: '3·21响水化工企业爆炸事故', source: '江苏省应急管理厅', time: '2026-06-04 14:20:00', generated: false, issued: false, hazardCount: 0 },
  { id: 3, name: '11·12浏阳烟花厂爆燃事故', source: '其他省级部门', time: '2026-06-04 10:15:00', generated: false, issued: false, hazardCount: 0 },
  { id: 4, name: '某有限空间作业中毒窒息事故', source: '国家应急管理部', time: '2026-06-03 16:45:00', generated: true, issued: true, hazardCount: 12 },
  { id: 5, name: '某加油站油罐区火灾事故', source: '江苏省应急管理厅', time: '2026-06-03 08:00:00', generated: true, issued: false, hazardCount: 8 },
  { id: 6, name: '某烟花爆竹仓库爆炸事故', source: '其他省级部门', time: '2026-06-02 11:30:00', generated: false, issued: false, hazardCount: 0 },
  { id: 7, name: '某铝加工企业深井铸造爆炸事故', source: '国家应急管理部', time: '2026-06-02 07:20:00', generated: true, issued: true, hazardCount: 15 },
  { id: 8, name: '某危化品运输车辆泄漏事故', source: '南京市应急管理局', time: '2026-06-01 15:10:00', generated: true, issued: false, hazardCount: 6 },
  { id: 9, name: '某非煤矿山边坡坍塌事故', source: '江苏省应急管理厅', time: '2026-06-01 09:00:00', generated: false, issued: false, hazardCount: 0 },
  { id: 10, name: '某化工企业管道破裂泄漏事故', source: '国家应急管理部', time: '2026-05-31 13:40:00', generated: true, issued: true, hazardCount: 9 },
  { id: 11, name: '某高温熔融金属企业炉体穿漏事故', source: '其他省级部门', time: '2026-05-31 08:30:00', generated: true, issued: false, hazardCount: 7 },
  { id: 12, name: '某粉尘涉爆企业铝镁粉尘爆炸事故', source: '南京市应急管理局', time: '2026-05-30 16:00:00', generated: false, issued: false, hazardCount: 0 },
  { id: 13, name: '某有限空间作业缺氧窒息事故', source: '江苏省应急管理厅', time: '2026-05-30 10:20:00', generated: true, issued: true, hazardCount: 11 },
  { id: 14, name: '某加油站卸油作业火灾事故', source: '国家应急管理部', time: '2026-05-29 14:50:00', generated: true, issued: false, hazardCount: 5 },
  { id: 15, name: '某危化品使用企业反应失控事故', source: '南京市应急管理局', time: '2026-05-29 09:10:00', generated: false, issued: false, hazardCount: 0 },
]

const commonUnits: MatchUnit[] = [
  { name: '南京溧水华燃餐饮管理有限公司', type: '餐饮燃气用户', address: '永阳街道中山东路88号', street: '永阳街道' },
  { name: '溧水区蓝湾商业综合体', type: '商业综合体', address: '经济开发区秦淮大道168号', street: '开发区' },
  { name: '南京润安液化气供应站', type: '燃气经营单位', address: '石湫街道明觉路21号', street: '石湫街道' },
  { name: '溧水区金陵美食城', type: '餐饮集中区', address: '永阳街道珍珠南路56号', street: '永阳街道' },
  { name: '南京安顺设备维保有限公司', type: '特种设备维保', address: '洪蓝街道工业路9号', street: '洪蓝街道' },
]

export const accidentDetails: Record<number, AccidentDetail> = {
  1: {
    ...accidents[0],
    rootCause: '事故暴露出燃气管线维护不到位、用气场所报警联锁缺失、人员应急处置能力不足等问题，需要围绕餐饮燃气用户、燃气经营单位和商业综合体开展类比排查。',
    industries: ['餐饮燃气', '商业综合体', '燃气经营', '人员密集场所'],
    risks: ['燃气泄漏', '报警装置失效', '违规动火', '应急疏散不畅'],
    devices: ['燃气管线', '可燃气体报警器', '切断阀', '排风系统'],
    histories: ['燃气软管老化', '报警器未通电', '后厨通风不良', '员工未培训'],
    matchTotal: 342,
    matchUnits: commonUnits,
    checklist: [
      { type: '燃气安全', text: '检查餐饮场所燃气管线、阀门、连接软管是否存在老化、松动、私拉乱接。' },
      { type: '设备设施', text: '检查可燃气体报警装置、自动切断阀、排风系统是否安装到位并保持有效。' },
      { type: '现场管理', text: '检查后厨动火、用电、油烟清理和消防通道管理情况。' },
      { type: '应急处置', text: '检查从业人员燃气泄漏识别、初期处置和疏散演练记录。' },
    ],
    letterTitle: '关于立即开展燃气安全专项排查整治的提示函',
    letterContent: [
      '排查范围：餐饮燃气用户、商业综合体、燃气经营供应站及相关设备维保单位。',
      '排查重点：燃气管线、报警切断装置、通风排烟设施、人员培训和应急处置能力。',
      '工作要求：各属地和行业部门应在限定时间内完成自查、复查和问题闭环。'
    ],
  },
  2: {
    ...accidents[1],
    rootCause: '事故反映出危化品企业风险辨识不足、重大危险源管控不到位和特殊作业审批流于形式。',
    industries: ['化工生产', '危化品储存', '园区企业'],
    risks: ['爆炸冲击', '反应失控', '危化品泄漏', '特殊作业失控'],
    devices: ['储罐', '反应釜', '安全联锁', '有毒可燃探测器'],
    histories: ['承包商管理缺失', '检维修审批不严', '重大危险源巡检不足'],
    matchTotal: 18,
    matchUnits: [
      { name: '南京新材料科技有限公司', type: '化工生产企业', address: '开发区滨淮大道66号', street: '开发区' },
      { name: '江苏润华精细化工有限公司', type: '危化品储存企业', address: '柘塘街道工业园12号', street: '柘塘街道' },
    ],
    checklist: [
      { type: '重大危险源', text: '核查重大危险源包保责任、监测预警和巡检记录是否完整有效。' },
      { type: '特殊作业', text: '核查动火、受限空间、检维修等特殊作业审批和现场监护情况。' },
    ],
    letterTitle: '关于立即开展化工企业安全专项排查整治的提示函',
    letterContent: [
      '排查范围：化工生产、危化品储存和涉及重点监管工艺的单位。',
      '排查重点：重大危险源、特殊作业、安全联锁、承包商管理和应急准备。',
      '工作要求：建立问题清单、责任清单、整改清单，实行闭环销号。'
    ],
  },
  3: {
    ...accidents[2],
    rootCause: '事故暴露出烟花爆竹生产储存环节超量存放、人员违章操作和防爆防静电措施不足。',
    industries: ['烟花爆竹', '仓储物流', '涉爆场所'],
    risks: ['爆燃', '超量储存', '静电积聚', '违规混放'],
    devices: ['防爆电气', '防静电设施', '库房监控', '消防设施'],
    histories: ['库房超量', '防雷检测过期', '作业人员违规操作'],
    matchTotal: 32,
    matchUnits: [
      { name: '溧水区祥安烟花爆竹经营部', type: '烟花爆竹经营', address: '白马镇集镇路31号', street: '白马镇' },
      { name: '南京华彩仓储有限公司', type: '涉爆仓储', address: '晶桥镇工业路19号', street: '晶桥镇' },
    ],
    checklist: [
      { type: '储存管理', text: '检查库房是否存在超量储存、混存混放、通道堵塞等问题。' },
      { type: '防爆措施', text: '检查防爆电气、防雷防静电检测和视频监控运行状态。' },
    ],
    letterTitle: '关于立即开展烟花爆竹安全专项排查整治的提示函',
    letterContent: [
      '排查范围：烟花爆竹批发、零售、仓储及相关运输环节。',
      '排查重点：储存限量、防爆防静电、值守巡查、消防设施和人员操作规范。',
      '工作要求：对发现的重大隐患立即停用整改，严禁带险经营。'
    ],
  },
}

export const getAccidentDetail = (id: number) => {
  const base = accidents.find((item) => item.id === id) || accidents[0]

  return accidentDetails[id] || {
    ...base,
    rootCause: '根据事故类型提取关键风险因素，形成类比排查对象、隐患清单和专项任务提示内容。',
    industries: ['重点监管行业', '相关生产经营单位'],
    risks: ['现场管理缺失', '设备设施异常', '作业审批不严'],
    devices: ['安全设施', '监测报警装置', '应急装备'],
    histories: ['同类隐患反复出现', '闭环整改不彻底'],
    matchTotal: 0,
    matchUnits: [],
    checklist: [
      { type: '基础管理', text: '核查企业风险辨识、隐患排查和整改闭环台账。' },
      { type: '现场安全', text: '核查事故相关设备设施和作业现场管理情况。' },
    ],
    letterTitle: '关于开展同类事故专项排查整治的提示函',
    letterContent: [
      '排查范围：与事故类型、作业场景和设备设施相近的生产经营单位。',
      '排查重点：事故暴露出的关键风险、薄弱环节和历史隐患。',
      '工作要求：形成问题清单并按期完成整改闭环。',
    ],
  }
}

export type PlanStatus = Record<number, { generated?: boolean; issued?: boolean }>

export const readPlanStatus = (): PlanStatus => {
  try {
    return JSON.parse(localStorage.getItem('accidentPlanStatus') || '{}') as PlanStatus
  } catch {
    return {}
  }
}

export const writePlanStatus = (status: PlanStatus) => {
  localStorage.setItem('accidentPlanStatus', JSON.stringify(status))
}
