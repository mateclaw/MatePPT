import { FC, memo, useMemo } from "react";
import { Avatar, Flex, Button, Dropdown, Space, MenuProps, Tooltip } from "antd";
import ToggleButton from "@/components/base/button/toggle-button";
import { Icon } from "umi";
import { DownOutlined } from "@ant-design/icons";
import { cn } from "@/lib/utils";

// 定义按钮配置项的类型
export interface ButtonConfig {
    key?: string;
    label?: string;
    icon?: React.ReactNode;
    tooltip?: string;
    show?: boolean;
    isActive?: boolean;
    onClick?: () => void;
    submitKey?: string;
}

// 定义分类选项的类型
export interface CategoryOption {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
}

interface PrefixNodeProps {
    className?: string;
    // 分类相关
    categoryList?: CategoryOption[];
    currentCategory?: string | number;
    setCurrentCategory?: (value: string | number) => void;

    // 按钮配置
    buttons?: ButtonConfig[];

    // 旧的兼容属性
    onItemClick?: (key: string) => void;
    isThink?: boolean;
    isSearch?: number;
    showThink?: boolean | ButtonConfig;
    showSearch?: boolean | ButtonConfig;
    deepSearchType?: string;
}

const prefixNode: FC<PrefixNodeProps> = (props) => {
    const {
        className,
        categoryList = [],
        currentCategory,
        setCurrentCategory,
        buttons,
        // 兼容旧属性
        onItemClick,
        isThink,
        isSearch,
        showThink,
        showSearch,
        deepSearchType
    } = props;

    // 构建默认按钮配置（兼容旧版本）
    const defaultButtons: ButtonConfig[] = useMemo(() => {
        if (buttons) return buttons;

        const result: ButtonConfig[] = [];

        // 添加分类按钮（如果存在分类列表）
        if (categoryList && categoryList.length > 0) {
            result.push({
                key: 'category',
                label: '分类',
                show: true,
                isActive: false
            });
        }

        // 添加深度思考按钮
        if (showThink) {
            const thhinkConfig = {
                key: 'think',
                label: '深度思考',
                icon: <Icon icon="local:icon-react-native" />,
                show: true,
                isActive: isThink,
                onClick: () => onItemClick?.('think')
            }
            if(typeof showThink === 'object'){
                Object.assign(thhinkConfig, showThink)
            }
            result.push(thhinkConfig);
        }

        // 添加联网搜索按钮
        if (showSearch && deepSearchType !== 'boolean') {
            result.push({
                key: 'search',
                label: '联网搜索',
                icon: <Icon width="14" height="14" icon="local:icon-internet" />,
                show: true,
                isActive: isSearch === 1,
                onClick: () => onItemClick?.('search')
            });
        }

        // 添加深度研究按钮
        if (showSearch) {

            const searchConfig = {
                key: 'deepSearch',
                label: '深入研究',
                icon: <Icon width="14" height="14" icon="ri:search-2-line" />,
                tooltip: deepSearchType === 'boolean' ? 'MateAI帮你拆解任务，分步骤执行，耗时较长' : '',
                show: true,
                isActive: isSearch === 2,
                onClick: () => onItemClick?.(searchConfig.key)
            }

            if (typeof showSearch === 'object') {
                Object.assign(searchConfig, showSearch)
            }
            result.push(searchConfig);
        }

        return result;
    }, [buttons, categoryList, showThink, isThink, showSearch, deepSearchType, isSearch, onItemClick]);

    // 构建分类菜单项
    const catItems: MenuProps['items'] = useMemo(() => {
        return categoryList.map(item => ({
            label: (
                <span className="flex items-center gap-2">
                    {item.icon && <span>{item.icon}</span>}
                    <span>{item.label}</span>
                </span>
            ),
            key: String(item.value),
        }));
    }, [categoryList]);

    // 获取当前选中的分类项
    const currentCategoryItem = useMemo(() => {
        if (currentCategory !== undefined) {
            return categoryList.find(item => String(item.value) === String(currentCategory));
        }
        return categoryList.length > 0 ? categoryList[0] : undefined;
    }, [currentCategory, categoryList]);

    // 分类下拉菜单配置
    const menuProps: MenuProps = {
        items: catItems,
        selectable: true,
        selectedKeys: currentCategory !== undefined ? [String(currentCategory)] : [],
        onClick: ({ key }) => {
            setCurrentCategory?.(key);
        },
    };

    // 渲染单个按钮
    const renderButton = (button: ButtonConfig) => {
        // 特殊处理分类按钮
        if (button.key === 'category' && categoryList.length > 0) {
            return (
                <Dropdown key="category" menu={menuProps}>
                    <Button className="mate-toggle-button active w-[120px]">
                        分类:
                        {currentCategoryItem && currentCategoryItem.label && (
                            <span className="block-ellipsis" title={currentCategoryItem.label}>
                                {currentCategoryItem.label}
                            </span>
                        )}
                        <DownOutlined />
                    </Button>
                </Dropdown>
            );
        }

        // 渲染普通切换按钮
        const buttonElement = (
            <ToggleButton
                key={button.key}
                isActive={button.isActive}
                onClick={button.onClick}
                tooltip={button.tooltip}
            >
                {button.icon && <span>{button.icon}</span>}
                <span className="mate-toggle-button-text">{button.label}</span>
            </ToggleButton>
        );

        // // 如果有提示信息，包装在 Tooltip 中
        // if (button.tooltip) {
        //   return (
        //     <Tooltip key={button.key} title={button.tooltip}>
        //       {buttonElement}
        //     </Tooltip>
        //   );
        // }

        return buttonElement;
    };

    return (
        <Flex gap={8} className={cn('', className)}>
            {defaultButtons
                .filter(button => button.show !== false)
                .map(renderButton)}
        </Flex>
    );
};

export default memo(prefixNode);