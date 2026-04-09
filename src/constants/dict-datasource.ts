import type { AisqlAxis } from "@/types/aisql.d";
import { type dictOptions } from "@/utils/dict";
export const orderStatus: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "orderStatus",
  dataSource: [
    {
      label: '待分析',
      value: 0
    },
    {
      label: '分析中',
      value: 1
    },
    {
      label: '分析完成',
      value: 2
    },
    {
      label: '分析失败',
      value: 3
    },
  ]
}
export const sourceType: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "sourceType",
  dataSource: [
    {
      label: 'MYSQL',
      value: 'MYSQL'
    },
    {
      label: 'ORACLE',
      value: 'ORACLE'
    },
    {
      label: 'SQLSERVER',
      value: 'SQLSERVER'
    },
    {
      label: 'POSTGRESQL',
      value: 'POSTGRESQL'
    },
    {
      label: 'KINGBASE',
      value: 'KINGBASE',
    },
    {
      label: 'GBASE',
      value: 'GBASE',
    },
    {
      label: 'CLICKHOUSE',
      value: 'CLICKHOUSE',
    },
    {
      label: 'STARROCKS',
      value: 'STARROCKS',
    }
  ]
}

export const chartType: dictOptions = {
  keyName: "value",
  valueName: "label",
  name: "chartType",
  dataSource: [
    {
      label: '折线图',
      value: 'Line',
      axis: [
        {
          label: 'X轴',
          value: 'x_axis',
          dataType: "",
          data: ""
        },
        {
          label: 'Y轴',
          value: 'y_axis',
          data: ""
        }
      ] as AisqlAxis[]
    },
    {
      label: '柱状图',
      value: 'Bar',
      axis: [
        {
          label: 'X轴',
          value: 'x_axis',
          data: ""
        },
        {
          label: 'Y轴',
          value: 'y_axis',
          data: ""
        }
      ] as AisqlAxis[]
    },
    {
      label: '饼图',
      value: 'Pie',
      axis: [
        {
          label: 'X轴',
          value: 'x_axis',
          data: ""
        },
        {
          label: 'Y轴',
          value: 'y_axis',
          data: ""
        }
      ] as AisqlAxis[]
    },
    {
      label: '散点图',
      value: 'Scatter',
      axis: [
        {
          label: 'X轴',
          value: 'x_axis',
          data: "",
          dataType: "",
        },
        {
          label: 'Y轴',
          value: 'y_axis',
          data: ""
        }
      ] as AisqlAxis[]
    },
    {
      label: '雷达图',
      value: 'Radar',
      axis: [
        {
          label: 'X轴',
          value: 'x_axis',
          data: ""
        },
      ] as AisqlAxis[]
    },
    {
      label: '热力图',
      value: 'Heatmap',
      axis: [
        {
          label: 'X轴',
          value: 'x_axis',
          data: ""
        },
        {
          label: 'Y轴',
          value: 'y_axis',
          data: ""
        },
        {
          label: '数值',
          value: 'color_scale',
          data: "",
          // dataType: "NUMERIC"
        }
      ] as AisqlAxis[]
    },
    {
      label: '盒须图',
      value: 'BoxPlot',
      axis: [
        {
          label: 'X轴',
          value: 'x_axis',
          data: ""
        },
        {
          label: 'Y轴',
          value: 'y_axis',
          data: ""
        }
      ] as AisqlAxis[]
    }
  ]
}