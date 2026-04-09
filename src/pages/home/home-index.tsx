import { useNavigate } from 'umi';
import { useTranslate } from '@/hooks/common-hooks';
import { Button, Card, Col, Row, Space, Typography, Divider } from 'antd';
import { ArrowRightOutlined, CheckCircleOutlined, RocketOutlined, BgColorsOutlined, DatabaseOutlined, ApiOutlined } from '@ant-design/icons';
import styles from './home-index.less';
import { cn } from '@/utils/classnames';
import PptGeneratePanel from '@/ppt/components/PptGeneratePanel';
import { useState } from 'react';
import topbgImg from '@/assets/home/topbg.webp';
import heroImg from '@/assets/home/herobg.webp';
import productImg from '@/assets/home/product.webp';
import priceImg from '@/assets/home/price.svg';
import qualityImg from '@/assets/home/quality.svg';
import lightningImg from '@/assets/home/lightning.svg';
import templateImg from '@/assets/home/template.svg';
import customImg from '@/assets/home/custom.webp';
import doubleModeImg from '@/assets/home/doublemode.webp';
import { MetaDataVo } from '@/models/metaDataVo';




const { Title, Paragraph, Text } = Typography;

interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const HomeIndex = () => {
    const navigate = useNavigate();
    const { t } = useTranslate();
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateOutline = async (userInput: string, metaData: MetaDataVo) => {
        setIsLoading(true);
        try {
            // 跳转到 PPT 生成页面，并传递参数
            navigate('/ppt/new', {
                state: {
                    userInput,
                    metaData

                },
            });
        } finally {
            setIsLoading(false);
        }
    };

    const toCreate = () => {
        navigate('/ppt/new');
    };


    const features: Feature[] = [
        {
            icon: <RocketOutlined className={styles.featureIcon} />,
            title: t('common.menus.home.product') || 'AI-Powered PPT',
            description: '使用 AI 快速生成专业演示文稿，节省您的时间和精力',
        },
        {
            icon: <BgColorsOutlined className={styles.featureIcon} />,
            title: t('common.menus.home.solution') || 'Rich Templates',
            description: '精心设计的模板库，涵盖各行业和用途',
        },
        {
            icon: <DatabaseOutlined className={styles.featureIcon} />,
            title: t('common.menus.home.pricing') || 'Data Management',
            description: '安全的云端存储，随时随地访问您的演示文稿',
        },
        {
            icon: <ApiOutlined className={styles.featureIcon} />,
            title: t('common.menus.home.partnership') || 'Easy Collaboration',
            description: '与团队成员实时协作，提高工作效率',
        },
    ];



    return (
        <div className=''>
            {/* Hero Section */}
            <section className={cn(styles.heroSection, 'pt-16 pb-8 px-36  relative')}>

                <div className='absolute right-0 top-0 w-full h-full'>
                    <img src={heroImg} alt="hero" className='w-full h-full object-contain' />
                </div>
                <div className='w-full flex justify-center relative z-10 mt-20'>

                    <div className='max-w-[1264px] w-full'>

                        <div className='absolute right-0 top-0 w-[704px] h-[508px]'>
                            <img src={topbgImg} alt="hero" className='w-full h-full object-contain' />
                        </div>

                        <div className='text-primary-500 text-[72px] leading-[90px] font-bold text-left'>
                            MateAI PPT
                        </div>
                        <div className={styles.heroSubTitle}>
                            从文字到可视化，创作快人N步
                        </div>
                        <div className={styles.heroTextContent}>
                            Effortlessly turn your ideas into a fully functional PPT
                        </div>



                        <div className='pt-[100px] relative  '>
                          

                                <PptGeneratePanel
                                    className=''
                                    isLoading={isLoading}
                                    onQuery={handleGenerateOutline}
                                />
                          
                        </div>
                    </div>


                </div>
            </section>

            <section className='pt-16 pb-8 px-36 relative'>
                <div className='w-full flex justify-center '>

                    <div className='absolute right-0 top-0 w-full h-full'>
                        <img src={productImg} alt="product" className='w-full h-full ' />
                    </div>
                    <div className='max-w-[1264px] w-full relative z-10'>

                        <div className={cn(styles.featureSectionTitle, 'text-black dark:text-white',)}>
                            主要功能
                        </div>

                        <div className={styles.featureSectionContent}>
                            强大、快速、高质量、精准
                        </div>

                        <div className='mt-20'>
                            <Row gutter={80}>
                                <Col span={6} >
                                    <div className={styles.featureItem}>

                                        <img src={priceImg} alt="" className={styles.featureItemIcon} />

                                        <div className={styles.featureItemTitle}>
                                            低成本创作
                                        </div>

                                        <div className={styles.featureItemContent}>
                                            低成本生成完整的高质量PPT，媲美商业化
                                        </div>


                                        <div className={styles.featureItemLink}>
                                            <a href="#" onClick={toCreate}>
                                                立刻生成 →
                                            </a>

                                        </div>

                                    </div>

                                </Col>
                                <Col span={6} >
                                    <div className={styles.featureItem}>

                                        <img src={qualityImg} alt="" className={styles.featureItemIcon} />

                                        <div className={styles.featureItemTitle}>
                                            顶级的品质
                                        </div>

                                        <div className={styles.featureItemContent}>
                                            基于多种大模型，精准生成各类PPT
                                        </div>


                                        <div className={styles.featureItemLink}>
                                            <a href="#" onClick={toCreate}>
                                                立刻生成 →
                                            </a>

                                        </div>

                                    </div>

                                </Col>
                                <Col span={6} >
                                    <div className={styles.featureItem}>

                                        <img src={lightningImg} alt="" className={styles.featureItemIcon} />

                                        <div className={styles.featureItemTitle}>
                                            闪电般的生成
                                        </div>

                                        <div className={styles.featureItemContent}>
                                            优化流程，确保快速生成PPT而不会影响质量
                                        </div>


                                        <div className={styles.featureItemLink}>
                                            <a href="#" onClick={toCreate}>
                                                立刻生成 →
                                            </a>

                                        </div>

                                    </div>

                                </Col>
                                <Col span={6}>
                                    <div className={styles.featureItem}>

                                        <img src={templateImg} alt="" className={styles.featureItemIcon} />

                                        <div className={styles.featureItemTitle}>
                                            强大的模版库
                                        </div>

                                        <div className={styles.featureItemContent}>
                                            提供丰富的风格模版，从论文到商业演示
                                        </div>


                                        <div className={styles.featureItemLink}>
                                            <a href="#" onClick={toCreate}>
                                                立刻生成 →
                                            </a>

                                        </div>

                                    </div>
                                </Col>

                            </Row>

                        </div>
                    </div>


                </div>
            </section>

            <section className='pt-16 pb-8 px-36 relative'>
                <div className='w-full flex justify-center '>

                    <div className='max-w-[1264px] w-full relative z-10'>
                        <div className={cn(styles.featureSectionTitle, 'text-black dark:text-white',)}>
                            亮点优势
                        </div>

                        <div className='flex items-center justify-center gap-20'>

                            <div className='flex-none w-[422px]'>
                                <div className='text-[46px] leading-[57px] font-medium'>
                                    自定义模板
                                </div>
                                <div className='text-base font-bold mt-12 text-textcolor-400'>
                                    提供强大的自编辑功能，用户通过拖拉拽等操作实现自定义
                                    模版，还可以发布到模版广场供其他用户使用，获得费用。
                                </div>
                            </div>

                            <div className='flex-none w-[516px]'>
                                <img src={customImg} alt="product" className='w-full h-full object-contain' />
                            </div>

                        </div>
                        <div className='flex items-center justify-center gap-20'>
                            <div className='flex-none w-[516px]'>
                                <img src={doubleModeImg} alt="product" className='w-full h-full object-contain' />
                            </div>
                            <div className='flex-none w-[422px]'>
                                <div className='text-[46px] leading-[57px] font-medium'>
                                    双模式生成
                                </div>
                                <div className='text-base font-bold mt-12 text-textcolor-400'>
                                    分成经典模式和创意模式，用户可以选择合适的模式进行PPT创意。

                                </div>

                                <Button type="primary" onClick={toCreate} className='rounded-full px-9 mt-10'>
                                    立刻体验
                                </Button>
                            </div>



                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default HomeIndex;
