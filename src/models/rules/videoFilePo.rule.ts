/**
*
*  PptVideoFilePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const VideoFilePoRule: ValidRule[] = [
    { 
        field: 'videoId', 
        name: '视频编号（主键）', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'taskId', 
        name: '所属视频任务ID', 
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
        name: '数字人ID（无数字人时可为空）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarName', 
        name: '数字人名称（无数字人时可为空）', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
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
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'speed', 
        name: '语速快照（支持两位小数', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'inputText', 
        name: '合成文本（审计/回溯用途）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'fileName', 
        name: '文件名', 
        types: [ 
            [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'fileUrl', 
        name: '视频文件S3地址', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'coverUrl', 
        name: '封面图片S3地址', 
        types: [ 
            [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'fileSize', 
        name: '文件大小（单位MB）', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'fileFormat', 
        name: '文件格式（默认mp4）', 
        types: [ 
            [ValidType.MAXLENGTH, 16], 
        ] 
    }, 
    { 
        field: 'videoWidth', 
        name: '输出视频宽(px)', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'videoHeight', 
        name: '输出视频高(px)', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'duration', 
        name: '输出视频时长(ms)', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'fps', 
        name: '输出视频帧率', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'bitrateKbps', 
        name: '输出视频码率(kbps)', 
        types: [ 
            ValidType.NUMBER, 
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
] 

