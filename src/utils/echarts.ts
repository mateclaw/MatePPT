// src/utils/echarts.ts
import * as echarts from 'echarts/core';

// 按需引图表
import {
    BarChart,
    LineChart,
    PieChart,
    RadarChart,
    ScatterChart,
} from 'echarts/charts';

// 按需引组件
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    DatasetComponent,
    TransformComponent,
    DataZoomComponent,
    ToolboxComponent,
    VisualMapComponent,
} from 'echarts/components';


// 只选一个 renderer
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    // charts
    BarChart,
    LineChart,
    PieChart,
    RadarChart,
    ScatterChart,

    // components
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    DatasetComponent,
    TransformComponent,

    DataZoomComponent,
    ToolboxComponent,
    VisualMapComponent,
    // renderer
    CanvasRenderer,
]);

export default echarts;