import { Minio, putObject, initMinio, Buffer, } from "minio-js"
import Axios, { type AxiosResponse } from "axios";
import { config } from '@/config';
import { random } from "lodash";
import { Observable } from "rxjs";
// import { S3Service } from "@/services/s3.service";
import type { AmazonS3Vo } from "@/models/amazonS3Vo";
import { nanoid } from "nanoid";
import type { uploadRequestOption } from "@/types/base";
import { generateRandomNumber } from "@/utils/common-util";
import { autoConvert } from "@/utils/file-util";

export interface S3UploadResult { etag: string, fileUrl: string, newFileName: string, fileId: string, fileSize: number, fileType: string, fileName: string, fileSuffix: string, httpUrl: string }
// const http = Axios.create({
//     baseURL: `http://${config.baseMinioEndPoint}:${config.baseMinioPort}`
// })

function removeLeadingSlashes(str) {
    return str.replace(/^\/*/, '');
}
// /**
//  * 根据文件的md5获取未上传完的任务
//  * @param identifier 文件md5
//  * @returns {Promise<AxiosResponse<any>>}
//  */
// const taskInfo = (identifier) => {
//     return http.get(`/v1/minio/tasks/${identifier}`)
// }

// /**
//  * 获取accessKey
//  * @returns {Promise<AxiosResponse<any>>}
//  */
// const getAccessKey = () => {
//     return http.get(`/v1/minio/tasks/accessKey`)
// }

// /**
//  * 初始化一个分片上传任务
//  * @param identifier 文件md5
//  * @param fileName 文件名称
//  * @param totalSize 文件大小
//  * @param chunkSize 分块大小
//  * @returns {Promise<AxiosResponse<any>>}
//  */
// const initTask = ({ identifier, fileName, totalSize, chunkSize }) => {
//     return http.post('/v1/minio/tasks', { identifier, fileName, totalSize, chunkSize })
// }

// /**
//  * 获取预签名分片上传地址
//  * @param identifier 文件md5
//  * @param partNumber 分片编号
//  * @returns {Promise<AxiosResponse<any>>}
//  */
// const preSignUrl = ({ identifier, partNumber }) => {
//     return http.get(`/v1/minio/tasks/${identifier}/${partNumber}`)
// }

// /**
//  * 合并分片
//  * @param identifier
//  * @returns {Promise<AxiosResponse<any>>}
//  */
// const merge = (identifier) => {
//     return http.post(`/v1/minio/tasks/merge/${identifier}`)
// }

export interface MinIOConfig {
    // IP地址
    endPoint: string,
    port: number,
    bucketName: string,
    useSSL: boolean,
    accessKey: string,
    secretKey: string,
    sessionToken: string,
    region: string,
    path: string,
    host: string
    // accessKey: "T1WTw9Gtwnk0nHeO3QHX",
    // secretKey: "RChDOX6kYSJZnRAI6Wbh2kjHEGoGunU0n8FQt8vy",

}



// const getFile = (file) => {
//     let reader = new FileReader
//     let obj = {
//         fileName: file.name
//     }
//     let fileResult = ''
//     // 决定转换的类型
//     reader.readAsBinaryString(file)
//     // 开始
//     reader.onload = function () {
//         fileResult = reader.result
//     }
//     // 失败
//     reader.onerror = function (error) {
//         reject(error)
//     }
//     // 结束 
//     reader.onloadend = function () {
//         obj.caCert = fileResult
//     }
//     return fileResult
// }
function extractIPAndPort(inputString) {
    // 移除协议前缀 (http:// 或 https://)
    let url = inputString.replace(/^https?:\/\//, '');

    // 尝试匹配 IP地址:端口 或 域名:端口 的格式
    const withPortRegex = /^([\w.-]+):(\d+)$/;
    const match = url.match(withPortRegex);

    if (match) {
        const endPoint = match[1];
        const port = match[2];
        return { ipAddress: endPoint, port };
    }

    // 如果没有端口号，返回整个字符串作为 endPoint
    if (url && !/^[\s]*$/.test(url)) {
        return { ipAddress: url, port: null };
    }

    return null;
}

function getFileType(suffix: string) {

    const extension = suffix.toLowerCase();
    switch (extension) {

        case 'txt':
            return 'TXT';
        case 'pdf':
            return 'PDF';
        case 'html':
            return 'HTML';
        case 'doc':
        case 'docx':
            return 'DOC';
        case 'ppt':
        case 'pptx':
            return 'PPT';
        default:
            return extension.toUpperCase();
    }
}
export class MinIOService {
    public config: MinIOConfig = {
        endPoint: config.baseMinioEndPoint,
        port: config.baseMinioPort,
        useSSL: false,
        accessKey: '',
        secretKey: '',
        sessionToken: '',
        region: 'cn-north-1',
        path: '',
        bucketName: config.baseBucketName,
        host: ''
    }

    constructor({ ...configProps }: MinIOConfig) {
        const handler = this;
        // 将 param 中存在的属性赋予 config  

        this.config = { ...this.config, ...configProps };



    }

    public client: Minio.Client;
    private initPromise;

    public initMateaiMinio = () => {

        const handler = this;
        if (handler.initPromise) {
            return handler.initPromise;
        }
        else {
            handler.initPromise = new Promise((resolve, reject) => {
                if (typeof handler.config.endPoint === 'string' && handler.config.endPoint.includes('://')) {
                    const result = extractIPAndPort(handler.config.endPoint);
                    if (result) {
                        handler.config.useSSL = handler.config.endPoint.startsWith('https://');
                        handler.config.host = handler.config.endPoint;
                        handler.config.endPoint = result.ipAddress;
                        if (result.port) {
                            handler.config.port = Number(result.port);
                        }
                    }
                }
                if (!handler.config.host && handler.config.endPoint) {
                    const protocol = handler.config.useSSL ? 'https' : 'http';
                    const port = handler.config.port ? `:${handler.config.port}` : '';
                    handler.config.host = `${protocol}://${handler.config.endPoint}${port}`;
                }
                handler.client = new Minio.Client(handler.config);
                resolve(handler.client)

                // S3Service.getInstance().getAuthToken({
                //     bucketName: handler.config.bucketName,
                //     baseDir: handler.config.path
                // } as AmazonS3Vo).subscribe({
                //     next: (res) => {
                //         const { code, data, msg } = res;

                //         if (code != 0) {
                //             console.error(msg);
                //         }

                //         if (data.endPoint) {
                //             const result = extractIPAndPort(data.endPoint);
                //             this.config.host = data.endPoint;

                //             if (result) {
                //                 handler.config.useSSL = data.endPoint.startsWith('https');
                //                 handler.config.path = data.baseDir;
                //                 handler.config.endPoint = result.ipAddress;
                //                 if (result.port) {
                //                     handler.config.port = Number(result.port);
                //                 }
                //             } else {
                //                 console.log("endPoint 格式不正常");
                //             }
                //             delete data.endPoint;
                //         }

                //         Object.assign(handler.config, data);



                //         handler.client = new Minio.Client(handler.config);
                //         resolve(handler.client)
                //     },
                //     error: (err) => [
                //         reject(err)
                //     ]
                // })

            });
        }
        return handler.initPromise;



    }


    public uploadRequest = async (options: uploadRequestOption) => {
        const file = options.file;
        const handler = this;
        if (!file) {
            return false;
        }

        const type = file.type
        const fileSize = file.size
        const name: string = file.name;
        // 参数
        const metadata = {
            'content-type': type,
            'content-length': fileSize
        }

        const fileNameList = name.split('.');
        const fileSuffix = fileNameList[fileNameList.length - 1];
        const oldFileName = name.replace(`.${fileSuffix}`, '');
        let fileId = nanoid();
        if (options.renameType == 'int') {

            const randomNumber = generateRandomNumber(9);
            fileId = '1' + randomNumber.toFixed();
        }

        const newFileName = oldFileName + '-' + fileId + '.' + fileSuffix;
        const path = (handler.config.path || '') + '/' + newFileName;
        const expireTime = options.expireTime || 60 * 60 * 1;



        const url = options.url || await handler.client.presignedPutObject(handler.config.bucketName, path, expireTime)
        const xhr = new XMLHttpRequest()

        xhr.upload.addEventListener('progress', (e) => {
            // file.status = 'uploading';
            if (options.onProgress) {
                const percent = Number(`${((e.loaded / e.total) * 100).toFixed(2)}`) || 0;

                options.onProgress({ percent }) // 更新进度，此处不保留小数点
            }
        })

        xhr.onload = () => {
            if (xhr.status === 200) {
                try {

                    const fileUrl = `/${path}`;
                    const fileType = getFileType(fileSuffix);
                    const httpUrl = handler.getFileUrl(fileUrl);
                    const result = { fileUrl, newFileName, fileId, fileSize, fileType, fileName: name, fileSuffix, httpUrl }

                    options.onSuccess({
                        result: result,
                        xhr: xhr,
                        file: file,

                    }) // 响应上传完成事件
                }
                catch (error) {
                    // file.status = 'error';
                    options.onError(
                        {
                            err: error,
                            xhr: xhr,
                            file: file
                        }) // 响应上传错误，此处ts处理error
                }
            }
            else {
                // file.status = 'error';

                options.onError({
                    err: new Error(`http code is ${xhr.status}`),
                    xhr: xhr,
                    file: file
                })
            } // 响应上传错误
        }

        xhr.open('PUT', url, true)
        xhr.send(file as any);

        return xhr;
    }

    public removeRequest = (path: string) => {

        // 执行文件删除操作
        const bucketName = this.config.bucketName;
        const objectName = path;
        // return S3Service.getInstance().deleteObject({ bucketName, baseDir: objectName } as AmazonS3Vo)
    }


    /**
     * 上传文件，生成一个10位数的id
     * @param options {file}
     * @returns 
     */
    public handleMinioUpload = (options) => {

        const file = options.file
        if (file) {
            const type = file.type
            const fileSize = file.size
            const name: string = file.name;
            // 参数
            const metadata = {
                'content-type': type,
                'content-length': fileSize
            }
            //定义流
            // let bufferStream = getFile(file);
            // this.client.fPutObject('mateai', name, 'bufferStream', size, metadata, (err, data) => {
            //     if (err) {
            //         return
            //     }
            //     console.log(data)
            // })
            return new Observable<any>((observer) => {

                const randomNumber = generateRandomNumber(9);
                const fileNameList = name.split('.');
                const fileSuffix = fileNameList[fileNameList.length - 1].toLowerCase();
                // fileNameList.splice(fileNameList.length - 1, 0, '1' + randomNumber.toFixed());
                // 获取随机生成一个1开头的10位整数作为文件id
                const fileId = '1' + randomNumber.toFixed();

                const newFileName = fileId + '.' + fileSuffix;
                const path = this.config.path + '/' + newFileName;


                function createReadableStream(uint8Array) {
                    const { readable, writable } = new TransformStream();

                    const writer = writable.getWriter();
                    writer.write(uint8Array);
                    writer.close();

                    return readable;
                }
                try {
                    const { name } = file;

                    // 使用 FileReader 读取文件内容
                    const fileReader = new FileReader();
                    fileReader.onloadend = async () => {
                        // 获取文件内容
                        // const fileData = fileReader.result;
                        const fileData = fileReader.result as ArrayBuffer;

                        const readableStream = createReadableStream(fileData);

                        // const fileData = new Uint8Array(fileReader.result as ArrayBuffer);


                        // 使用 MinIO 客户端的 putObject 方法上传文件
                        initMinio(this.config);
                        await putObject(this.config.bucketName, fileData, path, (err, etag) => {
                            if (err) {
                                console.error('Error uploading file:', err);
                                observer.error(err);
                                observer.complete();
                            } else {
                                console.log('File uploaded successfully. ETag:', etag);

                                const fileUrl = `/${path}`;
                                const fileType = getFileType(fileSuffix);
                                observer.next({ etag, fileUrl, newFileName, fileId, fileSize, fileType, fileName: name, fileSuffix });
                                observer.complete();
                            }
                        });

                        // await this.client.putObject(this.config.bucketName, path, readableStream, metadata, fileSize, (err, etag) => {
                        //     if (err) {
                        //         console.error('Error uploading file:', err);
                        //         observer.error(err);
                        //         observer.complete();
                        //     } else {
                        //         console.log('File uploaded successfully. ETag:', etag);

                        //         const fileUrl = `/${path}`;
                        //         const fileType = getFileType(fileSuffix);
                        //         observer.next({ etag, fileUrl, newFileName, fileId, fileSize, fileType, fileName: name, fileSuffix });
                        //         observer.complete();
                        //     }
                        // });

                    };

                    // 开始读取文件
                    fileReader.readAsArrayBuffer(file);
                } catch (error) {
                    console.error('Error uploading file:', error);

                }


            })

            // })

        }
    }

    public handleMinioRemove = (file) => {

        return new Observable<any>((observer) => {


            // 执行文件删除操作
            const bucketName = this.config.bucketName;
            const objectName = file.fileUrl;
            this.client.removeObject(bucketName, objectName, function (err) {
                if (err) {
                    observer.error(err);
                    observer.complete();
                    return console.error('Error removing object: ', err);
                }

                observer.next({ code: 0 });
                observer.complete();
                console.log('Object removed successfully');
            });

        });

    }

    /**
     * 初始化以后预览，使用服务器返回的
     * @param option ｛path:文件路径｝
     */
    public previewFile(option: MinIOConfig | string, searchText?: string) {
        const baseConfig = {
            endPoint: config.baseMinioEndPoint,
            port: config.baseMinioPort,
            bucketName: config.baseBucketName,
            path: ""
        } as MinIOConfig;
        if (typeof option === "string") {
            const theOption = { path: option } as MinIOConfig;
            Object.assign(baseConfig, theOption);
        }
        else {
            Object.assign(baseConfig, option);
        }
        const baseFileUrl = this.config.host;
        const bucket = this.config.bucketName;
        const fileUrl = baseConfig.path.startsWith("http") ? baseConfig.path : `${baseFileUrl}/${bucket}/${baseConfig.path}`;
        let url = `/preview?fileUrl=${fileUrl}`


        if (searchText) {
            url = url.concat(`&searchText=${encodeURIComponent(searchText)}`)
        }
        window.open(url, "_blank");
    }



    public getFileUrl(path: string) {

        path = removeLeadingSlashes(path);

        if (path.startsWith("http")) {
            return path;
        }
        else if (path.startsWith('data:image')) {
            return path;

        }
        else if (path.startsWith("s3://")) {
            path = path.replace("s3://", "");
            return `${this.config.host}/${path}`;
        }
        else if (path.startsWith("/" + this.config.bucketName) || path.startsWith(this.config.bucketName)) {
            return `${this.config.host}/${path}`;
        }
        else {
            return `${this.config.host}/${this.config.bucketName}/${path}`;
        }

    }

}











// import { Client } from 'minio'

// // 创建一个 MinIO 客户端实例
// const minioClient = new Client({
//   endPoint: 'your-minio-endpoint',
//   port: 9000,
//   useSSL: false,
//   accessKey: 'your-access-key',
//   secretKey: 'your-secret-key'
// })

// // 获取存储桶列表
// minioClient.listBuckets((err, buckets) => {
//   if (err) {
//     console.log('Error:', err)
//     return
//   }

//   console.log('Buckets:', buckets)
// })

// // 上传文件到指定存储桶
// const bucketName = 'your-bucket-name'
// const objectName = 'your-object-name'
// const filePath = '/path/to/your/file'

// minioClient.fPutObject(bucketName, objectName, filePath, (err, etag) => {
//   if (err) {
//     console.log('Error:', err)
//     return
//   }

//   console.log('File uploaded successfully. ETag:', etag)
// })

// // 下载文件
// const downloadPath = '/path/to/save/downloaded/file'

// minioClient.fGetObject(bucketName, objectName, downloadPath, (err) => {
//   if (err) {
//     console.log('Error:', err)
//     return
//   }

//   console.log('File downloaded successfully.')
// })
