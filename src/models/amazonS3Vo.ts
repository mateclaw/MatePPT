/**
*
*  AmazonS3Vo module (Auto generated code)
*
*  @Author bubuxiu@gmail.com
*
**/

import {PageBean} from './common/pageBean';

export class AmazonS3Vo extends PageBean {
    /** 访问S3的endPoint，包含ip和端口，比如：http://139.129.194.245:9000 */
    public endPoint:string;
    /** 访问S3的临时授权accessKey */
    public accessKey:string;
    /** 访问S3的临时授权secretKey */
    public secretKey:string;
    /** 访问S3的临时授权sessionToken */
    public sessionToken:string;
    /** 访问S3的bucket */
    public bucketName:string;
    /** 根目录 */
    public baseDir:string;
}

