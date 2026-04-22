import React, { useCallback, useMemo, useRef, useState } from 'react';
import { App, Button } from 'antd';
import { history } from 'umi';
import { lastValueFrom } from 'rxjs';
import PageHead from '@/components/base/page-head';
import LoadingComponent from '@/components/base/loading';
import S3Uploader from '@/components/base/file-uploader/s3-uploader';
import { PptTemplateService } from '@/services/pptTemplate.service';
import { PptTemplatePo } from '@/models/pptTemplatePo';
import { S3Service } from '@/services/s3.service';
import { FileInfoVo } from '@/models/fileInfoVo';
import { S3Result } from '@/types/base';
import type { UploadTarget } from '@/hooks/s3uploader-hooks';
import { useTranslate } from '@/hooks/common-hooks';
import { GUIDE_ITEMS, PAGE_TYPE_RULES, QUANTITY_RULES, GuideCard, AnnotationRule } from './components/template-upload';

const pptTemplateService = PptTemplateService.getInstance();
const s3service = S3Service.getInstance();

const buildDirectUploadTarget = (uploadUrl: string): UploadTarget => ({
  uploadUrl,
  method: 'PUT',
});

const AddMyTemplates: React.FC = () => {
  const { t } = useTranslate();
  const { message } = App.useApp();
  const uploaderRef = useRef<any>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [tips, setTips] = useState('');
  const [fileList, setFileList] = useState<any[]>([]);
  const uploadTypes = '.pptx';
  const uploadMaxSize = 1024 * 1024 * 50;
  const templateUploadPath = 'aippt/pptTemplate/templateFile';
  const hasFile = useMemo(() => fileList.length > 0, [fileList]);

  const getTemplateUploadTarget = useCallback(async (file: File) => {
    const request = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      fileUrl: templateUploadPath,
    } as FileInfoVo;
    const response = await lastValueFrom(s3service.getTemplateUploadUrl(request));
    if (!response || response.code !== 0 || !response.data) {
      throw new Error(response?.msg || '获取上传地址失败');
    }
    return buildDirectUploadTarget(String(response.data));
  }, []);

  const uploadPpt = useCallback(async () => {
    if (!fileList.length || !uploaderRef.current) return;
    try {
      setUploadingFile(true);
      setTips('文件上传中，请稍候...');
      const [res] = await uploaderRef.current.upload();
      const result = res.result as S3Result;
      message.success('文件上传成功，正在处理，请稍候');
      setTips('文件上传成功，正在处理，请稍候');

      pptTemplateService
        .addClassic({
          createMode: 'classic',
          originalFileUrl: result.result.httpUrl,
          originalFileName: result.result.fileName,
          templateName: result.result.fileName,
        } as PptTemplatePo)
        .subscribe({
          next: (response) => {
            setUploadingFile(false);
            if (response.code === 0 && response.data) {
              const templateData = response.data as PptTemplatePo;
              history.push(`/ppt/my-templates/${templateData.templateId}`, { templateData });
            } else {
              message.error('模板保存失败，请重试');
              setTips('');
            }
          },
          error: (error) => {
            setUploadingFile(false);
            setTips('');
            message.error(error?.message || '模板保存失败，请重试');
          },
        });
    } catch (error) {
      message.error('文件上传失败');
      setUploadingFile(false);
      setTips('');
    }
  }, [fileList, message]);

  const selectFile = useCallback((newFileList: any[]) => {
    if (newFileList.length > 0) {
      const file = newFileList[0];
      const fileType = file.name.split('.').reverse()[0];
      if (!uploadTypes.includes(fileType)) return false;
      if (file.size > uploadMaxSize) return false;
    }
    setFileList(newFileList);
  }, []);

  return (
    <div className="h-full w-full bg-[#F9FAFE] overflow-hidden flex flex-col">
      <div className="px-8 py-4">
        <PageHead pageTitle={t?.('ppt.myTemplates.title') || '我的模板'} goBack={null} pageDesc="上传已有 PPTX 文件，转换为可复用的自定义模板。" />
      </div>

      <div className="px-8 flex-1 overflow-auto">
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-10">
          <div className="xl:col-span-7 flex flex-col h-full">
            <h3 className="text-[15px] font-bold text-[#1E293B] mb-3">上传文件</h3>
            <div className="[&_.ant-upload-drag]:!border-2 [&_.ant-upload-drag]:!border-dashed [&_.ant-upload-drag]:!border-[#CBD5E1] [&_.ant-upload-drag]:!rounded-[24px] [&_.ant-upload-drag]:!bg-white [&_.ant-upload-drag:hover]:!border-[#6366F1] [&_.ant-upload-drag:hover]:!bg-[#FEF2F2]">
              <S3Uploader
                uploadPath={templateUploadPath}
                uploadTypes={uploadTypes}
                uploadMaxSize={uploadMaxSize}
                manualUpload
                uploadMaxCount={1}
                fileList={fileList}
                setFileList={selectFile}
                ref={uploaderRef}
                showFileList
                getUploadTarget={getTemplateUploadTarget}
              >
                <div className="min-h-[240px] flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-[#EEF2FF] rounded-2xl flex items-center justify-center mb-5">
                    <svg className="w-8 h-8 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-[#334155] font-bold text-base">点击或拖拽上传符合规范的 PPTX 模板文件</p>
                  <p className="text-[#94A3B8] text-sm mt-2 font-medium">文件上限 50M，推荐比例 16:9</p>
                </div>
              </S3Uploader>
            </div>
          </div>

          <div className="xl:col-span-5 flex flex-col h-full bg-[#EEF2FF] rounded-[24px] p-8 border border-[#D0DBFF]">
            <h3 className="text-base font-bold text-[#4F46E5] mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-[#6366F1] rounded-full" />
              内容页面布局规范
            </h3>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {QUANTITY_RULES.map((rule, idx) => (
                <div key={idx} className={`rounded-xl p-4 border flex flex-col justify-center ${rule.highlight ? 'bg-white border-[#6366F1]/20 shadow-sm' : 'bg-white/40 border-transparent'}`}>
                  <p className="text-sm text-[#64748B] mb-1">{rule.label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-2xl font-black text-[#6366F1]">{rule.count}</span>
                    <span className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-1">页以上</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-lg font-bold text-[#1E293B]">标注指南</h2>
            <span className="text-sm text-[#64748B]">(上传的 PPTX 文件建议包含以下页面)</span>
            <div className="h-px flex-1 bg-[#E8EEFB]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {PAGE_TYPE_RULES.map((rule, idx) => (
              <AnnotationRule key={idx} rule={rule} />
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-10">
          <div className="lg:col-span-9 bg-white rounded-[24px] p-8 border border-[#E8EEFB] shadow-sm h-full">
            <h3 className="text-[14px] font-bold text-[#1E293B] mb-6 flex items-center gap-2">
              <span className="w-1 h-4 bg-amber-400 rounded-full" />
              标注注意事项
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {GUIDE_ITEMS.map((item) => (
                <GuideCard key={item.id} item={item} />
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 bg-[#F8FAFF] rounded-[24px] p-6 border border-[#E0E7FF] flex flex-col items-center justify-center text-center h-full">
            <div className="w-full max-w-[200px] aspect-video bg-[#C7D2FE] rounded-xl shadow-inner flex items-center justify-center border border-[#818CF8] mb-4">
              <span className="text-3xl font-black text-[#4F46E5] tracking-tight">16:9</span>
            </div>
            <p className="text-[13px] font-bold text-[#334155] mb-2">推荐分辨率</p>
            <div className="space-y-1">
              <p className="text-[11px] font-mono text-[#64748B]">1280 x 720 px</p>
              <p className="text-[11px] font-mono text-[#64748B]">960 x 540 px</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none py-4 flex flex-col items-center border-t border-[#E8EEFB] bg-white">
        <Button type="primary" size="large" disabled={!hasFile} loading={uploadingFile} onClick={uploadPpt} className="px-16 rounded-full">
          去标注
        </Button>
        {!hasFile && <p className="text-[11px] text-[#94A3B8] mt-2">请先上传文件以解锁标注功能</p>}
      </div>

      {uploadingFile && <LoadingComponent type="app" text={tips} />}
    </div>
  );
};

export default AddMyTemplates;
