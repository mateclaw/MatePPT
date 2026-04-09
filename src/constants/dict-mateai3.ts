import { type dictOptions } from "@/utils/dict";


export const roleType: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "roleType",
  dataSource: [
    {
      label: '系统角色',
      value: 'system'
    },
    {
      label: '用户定义角色',
      value: 'user'
    },

  ]
}

export const userPoStatus: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "userPoStatus",
  dataSource: [
    {
      label: '待激活',
      value: 1,
      class: "warning",
    },
    {
      label: '正常',
      value: 2,
      class: "success",
    },
    {
      label: '停用',
      value: 3,
      class: "error",
    },
  ]
}
export const worktableType: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "worktableType",
  dataSource: [
    {
      label: '知识库问答',
      value: 1,

    },
    {
      label: '数据库问答',
      value: 2,

    },
    {
      label: '图谱问答',
      value: 3,

    },
    {
      label: '流程编排',
      value: 4,

    },
    {
      label: '智能体应用',
      value: 5,

    },

  ]
}
export const agentType: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "agentType",
  dataSource: [
    {
      label: '通用问答',
      value: 1,
      description: "融合知识库、数据库、图谱与工具能力，打造多源信息整合型智能体，大幅提升工作效率与决策能力。"

    },
    {
      label: '流程编排',
      value: 2,
      description: "基于 Dify 平台实现可视化流程编排，快速打造高效智能体，实现多步骤自动处理任务。"

    },
    // {
    //   label: '图谱问答',
    //   value: 3,

    // },
    // {
    //   label: '流程编排',
    //   value: 4,

    // },
    {
      label: '智能体应用',
      value: 5,

    },

  ]
}


// -- label类型，对应的标注信息options=["YES","NO"]，标注结果result={"label":"YES"}
// -- multilabel类型，对应的标注信息options=["YES","NO"]，标注结果result={"multilabel":["YES","NO"]}（多标签）
// -- text类型，对应的options=空，标注结果result={"text":"This is labeled result."}
// -- rating类型，对应的options=[1, 2, 3, 4, 5]，标注结果result={"rating":2}
// -- ranking类型，对应的options=[{"title":"reply-1","text":"text-content1"},{"title":"reply-1","text":"text-content1"}]，标注结果result={"ranking":["reply-2","reply-1"]}
// -- 总结：option是json数组，针对不同的question类型不同
// -- 总结：result是个json对象，对象字段包括：label、multilabel、text、rating、ranking、span（暂不支持），每一种字段对应后面的内容是不同的。

export const datasetResponseStatus = {
  keyName: "value",
  valueName: "label",
  name: "datasetResponseStatus",
  dataSource: [
    {
      label: '未标注',
      value: 1,
      class: "pending",
      color: "#BB720A",
    },
    {
      label: '草稿',
      value: 2,
      class: "draft",
      color: "#73BFBD"
    },
    {
      label: '已标注',
      value: 3,
      class: "submitted",
      color: "#3E5CC9"
    },
    // {
    //   label: '已审核',
    //   value: 4,
    //   class:"confirmed",
    //   color: "#3E5CC9"
    // },
    {
      label: '丢弃',
      value: 5,
      class: "discard",
      color: "#B7B7B7"
    },
  ]
};


export const trainStatus: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "trainStatus",
  dataSource: [
    {
      label: '未启动',
      value: 0,
      // color:"#3a3a3a",

    },
    {
      label: '进行中',
      value: 1,
      color: "#108ee9",// 蓝色
    },
    {
      label: '训练完成',
      value: 2,
      color: "#88cf6e",//绿色
    },
    {
      label: '手动终止',
      value: 3,
      color: "#faad14", //橙色
    },
    {
      label: '异常',
      value: 4,
      color: "#ff0000", //红色
    },
    {
      label: '合并完成',
      value: 5,
      color: "#895ad7", //紫色

    },
    {
      label: '未知',
      value: 6,
      color: "#ff0000", //红色

    },
  ]
}

export const dockerStatus: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "dockerStatus",
  dataSource: [
    {
      label: 'running',
      value: 'running',
      color: "#88cf6e",//绿色

    },
    {
      label: 'exited',
      value: 'exited',
      color: "#faad14", //橙色
    },
    {
      label: 'paused',
      value: 'paused',
      color: "#895ad7", //紫色
    },
    {
      label: 'restarting',
      value: 'restarting',
      color: "#108ee9",// 蓝色
    },
    {
      label: 'dead',
      value: 'dead',
      color: "#ff0000", //红色
    },
    {
      label: 'created',
      value: 'created',

    },
    {
      label: 'stopped',
      value: 'stopped',
      color: "#faad14", //橙色
    },
  ]
}

export const recallPolicyOption: dictOptions = {
  name: 'recallPolicy',
  keyName: 'value',
  valueName: 'label',
  dataSource: [
    {
      value: 1,
      label: 'QA/LLM顺序',

    },
    {
      value: 2,
      label: 'QA&LLM组合',
    },
    {
      value: 3,
      label: 'KG/QA/LLM顺序',
    },
    {
      value: 4,
      label: 'KG/QA/LLM组合',
    },


  ]
}

export const isPublicOption: dictOptions = {
  name: 'isPublic',
  keyName: 'value',
  valueName: 'label',
  dataSource: [
    {
      value: 0,
      label: '否',

    },
    {
      value: 1,
      label: '是',
    },



  ]
}

export const modelStatus: dictOptions = {
  name: 'modelStatus',
  keyName: 'value',
  valueName: 'label',
  dataSource: [
    {
      value: 1,
      label: '启用',

    },
    {
      value: 0,
      label: '禁用',
    },



  ]
}

export const fileSourceOption: dictOptions = {
  name: 'fileSource',
  keyName: 'value',
  valueName: 'label',
  dataSource: [

    {
      value: 1,
      label: 'local',
    },
    {
      value: 2,
      label: 'http',
    },
    {
      value: 3,
      label: 'ftp',
    },
    {
      value: 4,
      label: 'oss',
    },

    {
      value: 5,
      label: 's3',

    },

  ]
}
export const imageSourceOption: dictOptions = {
  name: 'imageSource',
  keyName: 'value',
  valueName: 'label',
  dataSource: [

    {
      value: 0,
      label: '上传',
    },
    {
      value: 1,
      label: '嵌入',
    },


  ]
}
// QA的来源
export const fromSourceOption: dictOptions = {
  name: 'fromSource',
  keyName: 'value',
  valueName: 'label',
  dataSource: [

    {
      value: 1,
      label: '导入',
    },
    {
      value: 2,
      label: '标注',
    },
    {
      value: 3,
      label: '生成',
    },


  ]
}
export const buildStatusOption: dictOptions = {
  name: '文件状态',
  keyName: 'value',
  valueName: 'label',
  dataSource: [
    {
      value: 0,
      label: '初始状态',

    },
    {
      value: 1,
      label: '构建成功',
    },
    {
      value: 2,
      label: '构建失败',
    },



  ]
}
export const llmStatus: dictOptions = {
  name: 'llmStatus',
  keyName: 'value',
  valueName: 'label',
  dataSource: [
    {
      value: 0,
      label: '禁用',

    },
    {
      value: 1,
      label: '启用',
    },

  ]
}

export const splitterOption = {
  name: 'splitter',
  keyName: "id",
  valueName: 'value',
  dataSource: [
    {
      id: 1,
      value: "按段落（Paragraph）"
    },
    {
      id: 2,
      value: "按行（Line）"
    },
    {
      id: 3,
      value: "正则表达式（Regex）"
    },
    {
      id: 4,
      value: "MD分层（MarkdownHeader）"
    },
    {
      id: 5,
      value: "自定义"
    },
  ]

}

export const modelProvider: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "modelProvider",
  dataSource: [
    {
      label: 'OpenAI',
      value: 'OpenAI',
      color: "#88cf6e",//绿色

    },
    {
      label: 'Azure',
      value: 'Azure',
      color: "#faad14", //橙色
    },
    {
      label: 'Alibaba',
      value: 'Alibaba',
      color: "#895ad7", //紫色
    },
    {
      label: 'Huawei',
      value: 'Huawei',
      color: "#108ee9",// 蓝色
    },
    {
      label: 'Zhipu',
      value: 'Zhipu',
      color: "#ff0000", //红色
    },
    {
      label: 'Meta',
      value: 'Meta',

    },
    {
      label: 'Mistral',
      value: 'Mistral',
      color: "#faad14", //橙色
    },
  ]
}

export const llmTypeOptions: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "llmTypeOptions",
  dataSource: [
    {
      label: '聊天模型',
      value: 0,


    },
    {
      label: '多模态模型',
      value: 1,

    },
    {
      label: '嵌入模型',
      value: 2,
    },
    {
      label: '重排模型',
      value: 3,
    },

  ]
}


export const jsonVarType = {
  name: 'jsonVarType',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: 'String',
      value: "string"
    },
    {
      label: 'Number',
      value: 'number'
    },
    {
      label: 'Boolean',
      value: 'boolean'
    },
    {
      label: 'Object',
      value: 'object'
    },
    {
      label: 'Array',
      value: 'array'
    },
  ]

}

export const httpMethod = {
  name: 'httpMethod',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: 'GET',
      value: "GET",
      className: 'text-green-500'
    },
    {
      label: 'POST',
      value: 'POST',
      className: 'text-blue-500'
    },
    {
      label: 'PUT',
      value: 'PUT',
      className: 'text-purple-500'
    },
    {
      label: 'DELETE',
      value: 'DELETE',
      className: 'text-red-500'
    },

  ]

}
export const authType = {
  name: 'authType',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: '不需要鉴权',
      value: "none",

    },
    {
      label: 'Token',
      value: 'Token'
    },
    {
      label: 'ApiKey',
      value: 'ApiKey'
    },

  ]

}
export const pluginType = {
  name: 'pluginType',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: '内置插件',
      value: 1
    },
    {
      label: '自定义插件',
      value: 2
    },

  ]

}

export const authLoc = {
  name: 'authLoc',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: 'Header',
      value: 'Header'
    },
    {
      label: 'Query',
      value: 'Query'
    },
    {
      label: 'Body',
      value: 'Body'
    },


  ]

}
export const bodyParamsType = {
  name: 'bodyParamsType',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: 'application/json',
      value: 'application/json'
    },
    {
      label: 'application/x-www-form-urlencoded',
      value: 'application/x-www-form-urlencoded'
    },
    {
      label: 'multipart/form-data',
      value: 'multipart/form-data'
    },


  ]

}

export const requestParamLoc = {
  name: 'requestParamLoc',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: 'Header',
      value: 'header'
    },
    {
      label: 'Path',
      value: 'path'
    },
    {
      label: 'Query',
      value: 'query'
    },
    {
      label: 'Body',
      value: 'body'
    },


  ]

}


export const docxGenerateStatus = {
  keyName: "value",
  valueName: "label",
  name: "docxGenerateStatus",
  dataSource: [
    {
      label: '等待处理',
      value: 'pending',
      class: "pending",
      color: "",
    },
    {
      label: '处理中',
      value: 'processing',
      class: "processing",
      color: "blue"
    },
    {
      label: '已完成',
      value: 'completed',
      class: "completed",
      color: "green"
    },
    // {
    //   label: '已审核',
    //   value: 4,
    //   class:"confirmed",
    //   color: "#3E5CC9"
    // },
    {
      label: '生成失败',
      value: 'failed',
      class: "failed",
      color: "red"
    },
  ]
};

export const mcpType = {
  name: 'mcpType',
  keyName: "value",
  valueName: 'label',
  dataSource: [
    {
      label: '标准输入/输出（stdio）',
      value: 'stdio'
    },
    {
      label: '服务器发送事件（sse）',
      value: 'sse'
    },
    {
      label: '可流式传输的http（streamable-http）',
      value: 'streamable-http'
    },



  ]

}
