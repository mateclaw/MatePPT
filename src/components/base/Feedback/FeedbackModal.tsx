
import React, { useEffect, useMemo, useState } from 'react';
import { FeedbackType, FeedbackFormState, FeedbackTypeOptions } from './types';
import { CloseIcon, FeedbackIcon } from './Icons';
import { FeedbackService } from "@/services/feedback.service";
import { App, Form } from "antd";
import useUserStore from "@/stores/userStore";
import { ValidService } from '@/utils/valid.service';
import { FeedbackPoRule } from '@/models/rules/feedbackPo.rule';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const feedbackService = FeedbackService.getInstance();
export const FeedbackModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { message } = App.useApp();
  const [form] = Form.useForm<FeedbackFormState>();
  const validService = useMemo(() => ValidService.getInstance(), []);
  const feedbackRules = useMemo(
    () => validService.convertCheck<FeedbackFormState>(FeedbackPoRule),
    [validService],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { userInfo } = useUserStore();

  useEffect(() => {
    if (!isOpen) return;
    form.resetFields();
    setIsSubmitting(false);
    setIsSuccess(false);
  }, [form, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (values: FeedbackFormState) => {
    setIsSubmitting(true);

    try {
      const payload = {
        userId: userInfo?.userId || '',
        userName: userInfo?.userName || '',
        category: values.category,
        content: values.content?.trim(),
        contact: values.contact?.trim(),
      };

      await new Promise((resolve, reject) => {
        feedbackService.add(payload as any).subscribe({
          next: resolve,
          error: reject,
        });
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      form.resetFields();
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    } catch (error: any) {
      setIsSubmitting(false);
      message.error(error?.message || error?.msg || '提交失败，请稍后重试');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-2 font-bold text-gray-800 text-lg">
            <FeedbackIcon className="w-5 h-5 text-indigo-600" />
            <span>反馈工单</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <CloseIcon />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">提交成功</h3>
            <p className="text-gray-500 mt-2">感谢您的反馈，我们会尽快处理！</p>
          </div>
        ) : (
          <Form
            form={form}
            onFinish={handleSubmit}
            className="p-6 space-y-6"
            initialValues={{
              category: FeedbackType.BUG_REPORT,
              content: '',
              contact: '',
            }}
          >
            {/* Type */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">反馈类型</label>
              <Form.Item name="category" rules={[feedbackRules.category]} className="mb-0">
                <select
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none bg-gray-50 transition-all text-gray-800"
                >
                  {FeedbackTypeOptions.map((type) => (
                    <option key={type.value} value={type.value}>{
                      type.label
                    }</option>
                  ))}
                </select>
              </Form.Item>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                请详细描述您的问题，我们会尽快回复您
              </label>
              <Form.Item
                name="content"
                rules={[feedbackRules.content]}
                className="mb-0"
              >
                <textarea
                  placeholder="请输入详细内容..."
                  className="w-full px-4 py-3 h-32 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 transition-all text-gray-800 resize-none"
                />
              </Form.Item>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                <span className="text-red-500 mr-1">*</span>请留下您的联系方式，便于我们进一步接触
              </label>
              <Form.Item
                name="contact"
                rules={[feedbackRules.contact]}
                className="mb-0"
              >
                <input
                  type="text"
                  placeholder="请输入您的手机号、微信号或者邮箱"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-gray-50 transition-all text-gray-800"
                />
              </Form.Item>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'}`}
            >
              {isSubmitting ? '正在提交...' : '提交'}
            </button>
          </Form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
