import React, { useMemo, useState } from 'react';
import { Button, Popover } from 'antd';
import {
  FontSizeOutlined,
  LineChartOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { Icon } from 'umi';
import type { ShapePoolItem } from '@/ppt/configs/shapes';
import type { LinePoolItem } from '@/ppt/configs/lines';
import type { ChartType } from '@/ppt/core';
import ShapePool from '@/ppt/classic/Editor/CanvasTool/ShapePool';
import LinePool from '@/ppt/classic/Editor/CanvasTool/LinePool';
import ChartPool from '@/ppt/classic/Editor/CanvasTool/ChartPool';
import TableGenerator from '@/ppt/classic/Editor/CanvasTool/TableGenerator';
import { ADD_TEXT_PRESETS, PRESET_STYLES, type AddTextPresetKey } from '@/ppt/configs';
import type { MathFormulaResult } from '@/ppt/classic/Editor/MathFormulaEditorModal';
import MathFormulaEditorModal from '@/ppt/classic/Editor/MathFormulaEditorModal';


export interface ClassicModeToolbarProps {
  onAddText?: (preset: AddTextPresetKey) => void;
  onOpenImageModal?: () => void;
  onAddShape?: (shape: ShapePoolItem) => void;
  onAddLine?: (line: LinePoolItem) => void;
  onAddChart?: (type: ChartType) => void;
  onAddTable?: (row: number, col: number) => void;
  onAddMath?: (data: MathFormulaResult) => void;
  onOpenVideoModal?: () => void;
  onOpenAudioModal?: () => void;
}

/**
 * 经典模式顶部工具栏中间区域
 * 提供添加各种元素的功能
 */
export const ClassicModeToolbar: React.FC<ClassicModeToolbarProps> = ({
  onAddText,
  onOpenImageModal,
  onAddShape,
  onAddLine,
  onAddChart,
  onAddTable,
  onAddMath,
  onOpenVideoModal,
  onOpenAudioModal,
}) => {
  const [shapePoolVisible, setShapePoolVisible] = useState(false);
  const [linePoolVisible, setLinePoolVisible] = useState(false);
  const [chartPoolVisible, setChartPoolVisible] = useState(false);
  const [tablePoolVisible, setTablePoolVisible] = useState(false);
  const [latexEditorVisible, setLatexEditorVisible] = useState(false);
  const [textPresetVisible, setTextPresetVisible] = useState(false);
  const textPresets = useMemo(() => {
    return ADD_TEXT_PRESETS.map((preset) => {
      const style = PRESET_STYLES.find((item) => item.label === preset.presetLabel)?.style;
      const rawSize = style?.fontSize;
      const size = typeof rawSize === 'string' ? rawSize : '14px';
      const rawWeight = style?.fontWeight;
      const weight = typeof rawWeight === 'number' ? rawWeight : 500;
      return { key: preset.key, label: preset.label, size, weight };
    });
  }, []);


  const handleCreateLatex = (result: MathFormulaResult) => {
    onAddMath?.(result);
    setLatexEditorVisible(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* 添加文字 */}
      {onAddText && (
        <Popover
          trigger="click"
          open={textPresetVisible}
          onOpenChange={setTextPresetVisible}
          content={
            <div className="flex  gap-2 ">
              {textPresets.map((preset) => (
                <div
                  key={preset.key}
                  // variant='dashed'
                  // color='default'
                  className="w-full text-center rounded-none !py-1 cursor-pointer !px-4 border-dashed border  flex items-center justify-center  truncate"
                  onClick={() => {
                    onAddText(preset.key);
                    setTextPresetVisible(false);
                  }}
                >
                  <span style={{ fontSize: preset.size, fontWeight: preset.weight }}>{preset.label}</span>
                </div>
              ))}
            </div>
          }
        >
          <Button
            type="text"
            className='flex-col h-12 gap-1 text-sm group/top-button'
          >
            <FontSizeOutlined className='group-hover/top-button:hidden' />
            <DownOutlined className='hidden group-hover/top-button:block' />
            文字
          </Button>
        </Popover>
      )}

      {/* 添加图片 */}
      {onOpenImageModal && (
        <Button
          type="text"
          className='flex-col h-12 gap-1 text-sm group/top-button'
          onClick={onOpenImageModal}
        >
          <Icon icon='ri:image-line' width='16' height='16' className='group-hover/top-button:hidden' />
          <DownOutlined className='hidden group-hover/top-button:block' />
          图片
        </Button>
      )}

      {/* 添加形状 */}
      {onAddShape && (
        <Popover
          content={
            <ShapePool
              onSelect={(shape) => {
                onAddShape(shape);
                setShapePoolVisible(false);
              }}
            />
          }
          trigger="click"
          open={shapePoolVisible}
          onOpenChange={setShapePoolVisible}
        >
          <Button
            type="text"
            className='flex-col h-12 gap-1 text-sm group/top-button'
          >
            <Icon icon='ri:shape-line' width='16' height='16' className='group-hover/top-button:hidden' />
            <DownOutlined className='hidden group-hover/top-button:block' />
            形状
          </Button>
        </Popover>
      )}

      {/* 添加线条 */}
      {onAddLine && (
        <Popover
          content={
            <LinePool
              onSelect={(line) => {
                onAddLine(line);
                setLinePoolVisible(false);
              }}
            />
          }
          trigger="click"
          open={linePoolVisible}
          onOpenChange={setLinePoolVisible}
        >
          <Button
            type="text"
            className='flex-col h-12 gap-1 text-sm group/top-button'
          >
            <Icon icon='ri:link' width='16' height='16' className='group-hover/top-button:hidden' />
            <DownOutlined className='hidden group-hover/top-button:block' />
            线条
          </Button>
        </Popover>
      )}

      {/* 添加图表 */}
      {onAddChart && (
        <Popover
          content={
            <ChartPool
              onSelect={(chart) => {
                onAddChart(chart);
                setChartPoolVisible(false);
              }}
            />
          }
          trigger="click"
          open={chartPoolVisible}
          onOpenChange={setChartPoolVisible}
        >
          <Button
            type="text"
            className='flex-col h-12 gap-1 text-sm group/top-button'
          >
            <LineChartOutlined className='group-hover/top-button:hidden' />
            <DownOutlined className='hidden group-hover/top-button:block' />
            图表
          </Button>
        </Popover>
      )}

      {/* 添加表格 */}
      {onAddTable && (
        <Popover
          content={
            <TableGenerator
              onClose={() => setTablePoolVisible(false)}
              onInsert={({ row, col }) => {
                onAddTable(row, col);
                setTablePoolVisible(false);
              }}
            />
          }
          trigger="click"
          open={tablePoolVisible}
          onOpenChange={setTablePoolVisible}
        >
          <Button
            type="text"
            className='flex-col h-12 gap-1 text-sm group/top-button'
          >
            <Icon icon='ri:table-line' width='16' height='16' className='group-hover/top-button:hidden' />
            <DownOutlined className='hidden group-hover/top-button:block' />
            表格
          </Button>
        </Popover>
      )}

      {/* 添加公式 */}
      {onAddMath && (
        <Button
          type="text"
          className='flex-col h-12 gap-1 text-sm group/top-button'
          onClick={() => setLatexEditorVisible(true)}
        >
          <Icon icon='ri:function-line' width='16' height='16' className='group-hover/top-button:hidden' />
          <DownOutlined className='hidden group-hover/top-button:block' />
          公式
        </Button>
      )}

      {/* 添加视频 */}
      {onOpenVideoModal && (
        <Button
          type="text"
          className='flex-col h-12 gap-1 text-sm group/top-button'
          onClick={onOpenVideoModal}
        >
          <Icon icon='ri:video-line' width='16' height='16' className='group-hover/top-button:hidden' />
          <DownOutlined className='hidden group-hover/top-button:block' />
          视频
        </Button>
      )}

      {/* 添加音频 */}
      {onOpenAudioModal && (
        <Button
          type="text"
          className='flex-col h-12 gap-1 text-sm group/top-button'
          onClick={onOpenAudioModal}
        >
          <Icon icon='ri:music-2-line' width='16' height='16' className='group-hover/top-button:hidden' />
          <DownOutlined className='hidden group-hover/top-button:block' />
          音频
        </Button>
      )}

      <MathFormulaEditorModal
        open={latexEditorVisible}
        initialLatex=""
        onCancel={() => setLatexEditorVisible(false)}
        onConfirm={handleCreateLatex}
      />
    </div>
  );
};
