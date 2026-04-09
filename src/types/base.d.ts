import type { UploadFile} from "antd";

declare export interface iRoute {
    component?: (string | undefined);
    layout?: (false | undefined);
    path?: (string | undefined);
    redirect?: (string | undefined);
    routes?: iRoute[];
    wrappers?: (Array<string> | undefined);
    meta?: any;
    sss?: string;
    access?: (string | undefined);
    pageClassname?: string;
    activeMenu?: string ;
    // 以下是自动附加的
    id?: string;
    children?: iRoute[];
    submenuRender?: boolean;
    element?: any;
    index?:any;
}



export interface SysRightPoWithChildren {
    meta: any,
    rightId: number;
    rightName: string;
    pageUrl: string;
    icon?: string;
    children: Array<SysRightPoWithChildren>;
}

export interface SysRightPo {
    meta: any,
    rightId: number;
    rightName: string;
    pageUrl: string;
    parentId: number;
    children: Array<SysRightPo>;
}

export interface CropperOptions {
    img: string | ArrayBuffer | null // 裁剪图片的地址
    info: true, // 裁剪框的大小信息
    outputSize: number, // 裁剪生成图片的质量 [1至0.1]
    outputType: 'jpeg', // 裁剪生成图片的格式
    canScale: boolean, // 图片是否允许滚轮缩放
    autoCrop: boolean, // 是否默认生成截图框
    autoCropWidth: number // 默认生成截图框宽度
    autoCropHeight: number // 默认生成截图框高度
    fixedBox: boolean // 固定截图框大小 不允许改变
    fixed: boolean, // 是否开启截图框宽高固定比例
    fixedNumber: Array<number>, // 截图框的宽高比例  需要配合centerBox一起使用才能生效
    full: boolean, // 是否输出原图比例的截图
    canMoveBox: boolean, // 截图框能否拖动
    original: boolean, // 上传图片按照原始比例渲染
    centerBox: boolean, // 截图框是否被限制在图片里面
    infoTrue: boolean // true 为展示真实输出图片宽高 false 展示看到的截图框宽高
}


export declare interface MyUploadFile extends UploadFile {
    fileUrl?: string;
}

export declare interface S3Result {
    err?: Error,
    xhr: XMLHttpRequest,
    file: MyUploadFile,
    result: {
        fileUrl: string,
        newFileName: string,
        fileId: string,
        fileSize: number,
        fileType: string,
        fileName: string,
        fileSuffix: string,
        httpUrl?: string
    }
}

export interface uploadRequestOption {
    file: File,
    url?: string,
    renameType?: 'int' | 'nanoid',
    onProgress?: (progressEvent: any) => void,
    onSuccess?: (res: any) => void,
    onError?: (err: any) => void,
    expireTime?: number
}

/**
 * 视频的源
 */
export interface videoPlayerSourcesOption {
    src: string,
    type: string,
    // 1080 | 720 | 480
    size?: number
}
export interface videoPlayerTracksOption {
    kind: 'captions';
    label: string;
    srclang: string;
    src: string;
    default?:boolean;
}
export interface videoPlayerOptions {
    type: 'video';
    title: string;
    sources: videoPlayerSourcesOption[];
    poster?: string;
    previewThumbnails?: {
        src: string,
    };
    tracks: videoPlayerTracksOption[]

}

export interface FloatButtonPo {
    key: string;
    icon: any;
    title: string;
    active: boolean;
    visible: boolean | ComputedRef<boolean>;
    onClick?: () => Promise<any>;
}

export interface fileObj {
    url: string;
    id: number;
}
