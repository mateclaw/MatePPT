/**
*
*  PptVideoTaskPo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const VideoTaskPoRule: ValidRule[] = [
    { 
        field: 'taskId', 
        name: '任务编号（主键）', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'renderMode', 
        name: '渲染模式', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarId', 
        name: '形象ID（无数字人时可为空）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarName', 
        name: '形象名称（无数字人时可填固定值）', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'avatarX', 
        name: '数字人区域X（像素）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarY', 
        name: '数字人区域Y（像素）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarHeight', 
        name: '数字人区域高（像素）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarWidth', 
        name: '数字人区域宽（像素）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'styleId', 
        name: '音色ID', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'styleName', 
        name: '音色名称', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'speed', 
        name: '合成语速（支持两位小数', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'subtitlesJson', 
        name: '字幕配置', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'tagJson', 
        name: '标记配置', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'outWidth', 
        name: '输出视频宽度', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'outHeight', 
        name: '输出视频高度', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'pptTitle', 
        name: 'PPT标题', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'pptCover', 
        name: 'PPT封面（图片地址或key）', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'pptWidth', 
        name: 'PPT画布宽(px)', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'pptHeight', 
        name: 'PPT画布高(px)', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'projectId', 
        name: '所属项目业务ID', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'totalSlide', 
        name: '总页数', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'currentSlide', 
        name: '当前处理到的页数（进度）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'taskStatus', 
        name: '任务状态', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'errorMessage', 
        name: '失败原因', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'createUserId', 
        name: '创建用户ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'createUserName', 
        name: '创建用户姓名', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'createTime', 
        name: '创建时间', 
        types: [ 
            ValidType.REQUIRED, 
        ] 
    }, 
    { 
        field: 'startTime', 
        name: '开始处理时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'endTime', 
        name: '结束时间', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'background', 
        name: '背景颜色', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'slideId', 
        name: '指定slide', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
] 

