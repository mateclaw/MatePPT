import { dictOptions } from "@/utils/dict";


export const pptPageRange: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "pptPageRange",
  dataSource: [
    {
      label: '5-10',
      value: '5-10'
    },
    {
      label: '10-15',
      value: '10-15'
    },
    {
      label: '20-30',
      value: '20-30'
    },
    {
      label: '25-35',
      value: '25-35'
    },


  ]
}
export const pptLanguage: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "pptLanguage",
  dataSource: [
    {
      label: 'zh-CN',
      value: 'zh-CN'
    },
    {
      label: 'en-US',
      value: 'en-US'
    },

  ]
}
export const pptCreateMode: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "pptCreateMode",
  dataSource: [
    {
    },
    {
      label: 'classic',
      value: 'classic'
    },

  ]
}

export const pptProjectStatus: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "pptProjectStatus",
  dataSource: [
    {
      label: '等待处理',
      value: 'pending'
    },
    {
      label: '处理中',
      value: 'processing'
    },
    {
      label: '已完成',
      value: 'completed'
    },
    {
      label: '失败',
      value: 'failed'
    },
  ]
}

export const pptProjectSortOrder: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "pptProjectSortOrder",
  dataSource: [
    {
      label: 'timeDesc',
      value: 'create_time desc'
    },
    {
      label: 'timeAsc',
      value: 'create_time asc'
    },
  ]
}