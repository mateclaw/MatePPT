import { useNavigate } from 'umi';
import { useTranslate } from '@/hooks/common-hooks';
import { Button, Card, Col, Row, Space, Typography, Divider, message, Modal, Spin } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, RocketOutlined, BgColorsOutlined, DatabaseOutlined, ApiOutlined } from '@ant-design/icons';
import styles from './home-index.less';
import { cn } from '@/utils/classnames';

import { useState } from 'react';
import pricebgImg from '@/assets/home/price-bg.webp';
import PriceCard from '@/components/base/cards/PriceCard';
import { OrderService } from '@/services/order.service';
import { OrderPo } from '@/models/orderPo';
import { ProductPlanService } from "@/services/productPlan.service";
import { ProductPlanPo } from "@/models/productPlanPo";
import { lastValueFrom, map } from 'rxjs';
import { useQuery } from '@tanstack/react-query';
import { QRCodeSVG } from "qrcode.react";
import { getLocale } from "umi";


const { Title, Paragraph, Text } = Typography;

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const PayCycle = {
    MONTHLY: 'monthly',
    YEARLY: 'yearly',
    LIFETIME: 'lifetime'
};

const productPlanService = ProductPlanService.getInstance();
const orderService = OrderService.getInstance();

const HomeIndex = () => {
    const navigate = useNavigate();
    const { t } = useTranslate();
    const [isLoading, setIsLoading] = useState(false);
    const [paymentModalVisible, setPaymentModalVisible] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [orderId, setOrderId] = useState<string>('');
    const [paymentLoading, setPaymentLoading] = useState(false);

    const locale: string = getLocale();

    // 获取场景分类
    const { data: plansData } = useQuery<ProductPlanPo[]>(
        {
            queryKey: ['productPlans', locale],
            initialData: [],
            queryFn: () => {
                return lastValueFrom(productPlanService.list({ pageSize: 1000, locale: locale.replace('-', '_'), sortord: 'price_monthly asc' } as ProductPlanPo).pipe(
                    map(res => res.data)
                ))
            },
        }

    );

    console.log(plansData);


    // 处理付款按钮点击
    const handlePayment = async (plan: ProductPlanPo) => {
        setPaymentLoading(true);
        try {
            const orderParam = new OrderPo();
            orderParam.planId = plan.planId;
            orderParam.payCycle = PayCycle.MONTHLY;
            orderParam.payType = 'WechatPay';

            // 调用业务 API 自动增录 - 微信扣码支付（Native）
            const response = await lastValueFrom(orderService.nativeOrder(orderParam));

            if (response?.data) {
                const { codeUrl, orderId: newOrderId } = response.data;
                setQrCodeUrl(codeUrl);
                setOrderId(newOrderId);
                setPaymentModalVisible(true);
            } else {
                message.error('创建订单失败，请稍后重试');
            }
        } catch (error) {
            console.error('支付错误:', error);
            message.error('支付失败，请稍后重试');
        } finally {
            setPaymentLoading(false);
        }
    };

    //  需要微信支付二维码
    const QRCodeComponent = () => {
        return (
            <div style={{ textAlign: 'center' }}>
                <p>请使用微信扫一扫下方二维码完成支付</p>
                {qrCodeUrl ? (
                    <QRCodeSVG
                        value={qrCodeUrl}
                        size={250} style={{ width: '250px', height: '250px', marginTop: '20px' }}

                    />
                ) : (
                    <Spin />
                )}
                <p style={{ marginTop: '20px', fontSize: '12px', color: '#999' }}>
                    订单号: {orderId}
                </p>
            </div>
        );
    };

    // 关闭PaymentModal（不会清除订单ID和QR码）
    const handlePaymentModalClose = () => {
        setPaymentModalVisible(false);
        // 可选：检查支付状态，如果已支付，关闭Modal；否则不关闭
    };


    const toCreate = () => {
        navigate('/ppt/new');
    };





    return (
        <div className='pt-20 flex flex-col items-center'>
            {/* Hero Section bg-[#ECF2FD]*/}
            <section className={cn(styles.heroSection, 'pt-16 pb-8 px-[68px] w-full h-[480px]  relative flex-none ')}>

                <div className='absolute left-1/2 -translate-x-1/2 top-0 w-[1440px] h-[480px]'>
                    <img src={pricebgImg} alt="hero" className='w-full h-full ' />
                </div>
                <div className='w-full flex justify-center relative z-10 mt-[186px]'>

                    <div className='max-w-[1264px] w-full'>



                        <div className={cn(' font-bold text-left', styles.linearTitle)}>
                            1个月会员仅需29元
                        </div>

                        <div className={cn(styles.featureItemContent, 'text-center text-[22px] !mt-5')}>
                            选择适合您的套餐，一起开启智能PPT大门
                        </div>
                        <div className={cn(styles.featureItemContent, 'text-center text-[22px] !mt-0')}>
                            Choose the package that suits you, or choose a trial.
                        </div>

                    </div>


                </div>
            </section>

            <section className='py-[75px] px-[168px] w-[1440px] relative'>
                <div className='w-full flex items-end gap-[25px] '>
                    {plansData && plansData.length > 0 ? (
                        plansData.map((plan) => {
                            // 将价格从分转换为元（价格单位为分）
                            const displayPrice = plan.priceMonthly ? (plan.priceMonthly / 100).toFixed(2) : '0';
                            const isPopular = plan.planCode === 'plus';
                            const buttonText = plan.priceMonthly === 0 ? '立即体验' : '立即下单';
                            const handleClick = plan.priceMonthly === 0
                                ? () => {
                                    navigate('/ppt/new');
                                }
                                : () => handlePayment(plan);

                            return (
                                <PriceCard
                                    key={plan.planId}
                                    paymentLoading={paymentLoading}
                                    plan={{
                                        level: plan.planName,
                                        planDesc: plan.planDesc,
                                        price: displayPrice,
                                        isPopular: isPopular,
                                        planId: plan.planId,
                                        payCycle: 'monthly',
                                        buttonText: buttonText,
                                        permissions: [], // 使用数据库字段而不是自定义权限列表
                                        aiGenerationLimit: plan.aiGenerationLimit,
                                        aiImageLimit: plan.aiImageLimit,
                                        maxSlidesLimit: plan.maxSlidesLimit,
                                        importLocalFile: plan.importLocalFile,
                                        importFromUrl: plan.importFromUrl,
                                        importGoogleDrive: plan.importGoogleDrive,
                                        watermarkFree: plan.watermarkFree,
                                        exportPptx: plan.exportPptx,
                                        exportPdf: plan.exportPdf,
                                        userDefineTemplate: plan.userDefineTemplate,
                                        customerSupport: plan.customerSupport,
                                        onButtonClick: handleClick
                                    }}
                                    backgroundColor={isPopular ? 'dark' : 'white'}
                                    className='w-[320px]'
                                />
                            );
                        })
                    ) : (
                        <div>暂无套餐信息</div>
                    )}
                </div>
            </section>

            {/* 微信支付二维码Modal */}
            <Modal
                title="微信支付"
                open={paymentModalVisible}
                onCancel={handlePaymentModalClose}
                footer={null}
                width={400}
            >
                {paymentLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin tip="生成二维码中..." />
                    </div>
                ) : (
                    <QRCodeComponent />
                )}
            </Modal>

        </div>
    );
};

export default HomeIndex;
