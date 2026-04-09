/**
*
*  VoiceFilePo rule (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import { ValidRule } from '../../utils/models/validRule';
import { ValidType } from '../../utils/models/valid-type';

export const VoiceFilePoRule: ValidRule[] = [
    { 
        field: 'fileId', 
        name: '音频文件ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'fileName', 
        name: '文件名', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'fileUrl', 
        name: '文件所在S3key', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 128], 
        ] 
    }, 
    { 
        field: 'fileSize', 
        name: '文件大小', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'fileFormat', 
        name: '文件格式', 
        types: [ 
            [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'createUserId', 
        name: '创建人ID', 
        types: [ 
            ValidType.REQUIRED, ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'createUserName', 
        name: '创建人姓名', 
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
        field: 'inputText', 
        name: '合成文本', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'styleId', 
        name: '音色id', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'styleName', 
        name: '音色名称（语音文件生成不会改变', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 64], 
        ] 
    }, 
    { 
        field: 'modelName', 
        name: '模型', 
        types: [ 
            ValidType.REQUIRED, [ValidType.MAXLENGTH, 32], 
        ] 
    }, 
    { 
        field: 'speed', 
        name: '合成语速（支持两位小数', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'textStream', 
        name: '文本流数据（用于接收外部传入的文本流）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'textChunk', 
        name: '文本片段（用于流式传输）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'streamId', 
        name: '流ID（用于标识流式连接）', 
        types: [ 
            
        ] 
    }, 
    { 
        field: 'audioFormat', 
        name: '音频格式类型', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'sessionID', 
        name: 'LiveTalking会话ID', 
        types: [ 
            ValidType.NUMBER, 
        ] 
    }, 
    { 
        field: 'avatarId', 
        name: '数字人ID', 
        types: [ 
            
        ] 
    }, 
] 
