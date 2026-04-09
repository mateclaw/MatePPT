import { Button, Modal, Pagination, type PaginationProps, Upload, UploadProps, App } from "antd";
import { FC, useMemo, useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from "react";
import { Icon } from "umi";
import { useS3Uploader, type UploadTarget } from "@/hooks/s3uploader-hooks";

interface Props {
    uploadTypes?: string;
    uploadPath?: string;
    uploadMaxSize?: number;
    uploadMaxCount?: number;
    onProgress?: (progress: number) => void;
    onSuccess?: (file: File) => void;
    onError?: (error: Error) => void;
    onChange?: UploadProps['onChange'];
    onRemove?: (file: File) => void;
    onConfirm?: (fileList: any[]) => void;
    children?: React.ReactNode;
    tips?: React.ReactNode;
    fileList?: any[];
    setFileList?: (fileList: any[]) => void;
    showFileList?: boolean;
    isModal?: boolean;
    manualUpload?: boolean; // 是否手动上传
    getUploadTarget?: (file: File) => Promise<UploadTarget | null>;
    renderFileList?: (fileList: any[]) => React.ReactNode;
}

export interface S3UploaderSimpleRef {
    upload: () => Promise<any[]>; // 暴露上传方法给父组件
}

const S3UploaderSimple = forwardRef<S3UploaderSimpleRef, Props>((props, ref) => {

    const {
        uploadTypes = '.xlsx',
        uploadPath = '',
        uploadMaxSize = 1024 * 1024 * 10,
        uploadMaxCount = 1,
        onProgress,
        onSuccess,
        onError,
        onChange,
        onRemove,
        onConfirm,
        children,
        tips,
        fileList,
        setFileList,
        showFileList,
        isModal = false,
        manualUpload = false, // 新增属性默认值
        getUploadTarget,
        renderFileList,
        ...rest
    } = props;

    const [modalVisible, setModalVisible] = useState(false);
    

    const {
        fileTypes,
        maxFileSize,
        isUploading,
        pendingFiles,
        vFileList,
        customUpload,
        beforeUpload,
        onFileChange,
        handleManualUpload,
        setPendingFiles
    } = useS3Uploader({
        uploadTypes,
        uploadPath,
        uploadMaxSize,
        uploadMaxCount,
        manualUpload,
        fileList,
        setFileList,
        onProgress,
        onSuccess,
        onError,
        onChange,
        getUploadTarget
    })



    const { Dragger } = Upload;


    // 暴露给父组件的上传方法
    useImperativeHandle(ref, () => ({
        upload: () => {
            return handleManualUpload();
        }
    }));


    const dragNode = (
        <Upload
            accept={fileTypes}
            className="w-full h-full relative [&_.ant-upload]:w-full [&_.ant-upload]:h-full [&_.ant-upload]:block"
            
            fileList={manualUpload ? pendingFiles : vFileList}
            customRequest={manualUpload ? undefined : customUpload}
            beforeUpload={beforeUpload}
            showUploadList={renderFileList ? false : showFileList}
            maxCount={uploadMaxCount}
            onChange={onFileChange}
            multiple={uploadMaxCount > 1 ? true : false}
        >
            {
                children ? children :
                    <div className="mt-8 mb-4">
                        <div className="ma-upload-dragger-icon text-center flex items-center justify-center" >
                            <Icon icon="local:icon-files"></Icon>
                        </div>
                        <div className="ma-upload-dragger-hint1 mt-5 text-textcolor-300 text-sm">
                            点击或将文件拖拽至此上传（最多上传{uploadMaxCount}个文件）
                        </div>
                        <div className="ma-upload-dragger-hint2 mt-5 text-textcolor-300 text-xs">
                            仅限 {fileTypes}文件，文件大小不超过{maxFileSize}
                            {manualUpload && "（文件将不会自动上传）"}
                        </div>
                    </div>
            }
            {renderFileList && renderFileList(manualUpload ? pendingFiles : vFileList)}
        </Upload>
    )

    const cancelFiles = () => {
        setModalVisible(false);
    }

    const confirmFiles = () => {
        setModalVisible(false);
        if (onConfirm) {
            onConfirm(fileList);
        }
    }

    return (
        <div className=" w-full h-full ">
            {
                isModal ?
                    (children ? children :
                        <Button className="mate-upload-button" onClick={() => setModalVisible(true)}>
                            上传
                        </Button>) :
                    (
                        <>
                            {dragNode}
                            {/* 不再在组件内部显示上传按钮 */}
                        </>
                    )
            }

            <Modal open={modalVisible} onCancel={cancelFiles} onOk={confirmFiles}>
                <>
                    {dragNode}
                </>
            </Modal>
        </div>
    )
});

export default S3UploaderSimple;
