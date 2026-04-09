import { autoConvert } from "@/utils/file-util";
import { CloudUploadOutlined } from "@ant-design/icons";
import { Attachments, AttachmentsProps, Sender } from "@ant-design/x";
import { App, GetProp } from "antd";
import { FC, useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from "react";
import { useS3Uploader } from "@/hooks/s3uploader-hooks";
interface SenderHeaderProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    uploadConfig?: Record<string, any>;
    senderRef: React.MutableRefObject<any>;
}

export interface SenderHeaderRef {
    upload: () => Promise<any[]>; // 暴露上传方法给父组件
    items: any[];
    clearItems: () => void;
}

export const SenderHeader = forwardRef<SenderHeaderRef, SenderHeaderProps>((props, ref) => {


    const [items, setItems] = useState<GetProp<AttachmentsProps, 'items'>>([]);

    const uploadConfig = props.uploadConfig;
    const uploadTypes = uploadConfig ? uploadConfig.uploadTypes : "*";
    const uploadMaxCount = uploadConfig ? uploadConfig.uploadMaxCount : 1;
    const uploadMaxSize = uploadConfig ? uploadConfig.uploadMaxSize : 1024 * 1024 * 10;
    const uploadPath = uploadConfig ? uploadConfig.uploadUrl : '';
    const manualUpload = uploadConfig ? uploadConfig.manualUpload : false;

    const { message } = App.useApp();



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
        fileList: items,
        setFileList: setItems
    })

    const sharedAttachmentProps: AttachmentsProps = {
        // beforeUpload: () => false,
        // items,
        // onChange: ({ file, fileList }) => {
        //     console.log('onChange:', fileList);
        //     setItems(fileList);
        // },
        accept: fileTypes,
        items: manualUpload ? pendingFiles : vFileList,
        customRequest: manualUpload ? undefined : customUpload,
        beforeUpload: beforeUpload,
        onChange: onFileChange,
        maxCount: uploadMaxCount,
        multiple: uploadMaxCount > 1
        // maxCount: uploadMaxCount,
        // customRequest: (options) => {
        //     console.log('customRequest:', options);

        // },
        // multiple: uploadMaxCount > 1

    };

    const AttachmentsRef = useRef();


    useImperativeHandle(ref, () => ({
        upload: () => {
            return handleManualUpload();
        },
        clearItems: ()=>{
            setItems([]),
            setPendingFiles([])

        },
        items
    }));

    return (
        <Sender.Header
            title="上传附件"
            open={props.open}
            onOpenChange={props.setOpen}
            styles={{
                content: {
                    padding: 0,
                },
            }}
        >
            <Attachments
                // Mock not real upload file
                // beforeUpload={() => false}
                // items={items}
                // onChange={({ fileList }) => setItems(fileList)}
                {...sharedAttachmentProps}
                ref={AttachmentsRef}
                classNames={
                    { item: '' }
                }
                placeholder={(type) =>
                    type === 'drop'
                        ? {
                            title: '拖拽文件到此处',
                        }
                        : {
                            icon: <CloudUploadOutlined />,
                            title: '上传附件',
                            description: '点击或者拖拽文件上传',
                        }
                }
                getDropContainer={() => props.senderRef.current?.nativeElement}
            />
        </Sender.Header>
    );
})

export default SenderHeader;