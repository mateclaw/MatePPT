/**
 * 字体配置
 */

// export const FONTS = [
//   { label: '默认字体', value: '' },
//   { label: '思源黑体', value: 'SourceHanSans' },
//   { label: '思源宋体', value: 'SourceHanSerif' },
//   { label: '方正黑体', value: 'FangZhengHeiTi' },
//   { label: '方正楷体', value: 'FangZhengKaiTi' },
//   { label: '方正宋体', value: 'FangZhengShuSong' },
//   { label: '方正仿宋', value: 'FangZhengFangSong' },
//   { label: '阿里巴巴普惠体', value: 'AlibabaPuHuiTi' },
//   { label: '朱雀仿宋', value: 'ZhuqueFangSong' },
//   { label: '霞鹜文楷', value: 'LXGWWenKai' },
//   { label: '文鼎PL楷体', value: 'WenDingPLKaiTi' },
//   { label: '得意黑', value: 'DeYiHei' },
//   { label: 'MiSans', value: 'MiSans' },
//   { label: '仓耳小丸子', value: 'CangerXiaowanzi' },
//   { label: '优设标题黑', value: 'YousheTitleBlack' },
//   { label: '峰广明锐体', value: 'FengguangMingrui' },
//   { label: '摄图摩登小方体', value: 'ShetuModernSquare' },
//   { label: '站酷快乐体', value: 'ZcoolHappy' },
//   { label: '字制区喜脉体', value: 'ZizhiQuXiMai' },
//   { label: '素材集市康康体', value: 'SucaiJishiKangkang' },
//   { label: '素材集市酷方体', value: 'SucaiJishiCoolSquare' },
//   { label: '途牛类圆体', value: 'TuniuRounded' },
//   { label: '锐字真言体', value: 'RuiziZhenyan' },
// ]
export type FontFaceSource = {
  family: string;
  weight: number;
  file: string;
  localNames: string[];
  familyName: string;
  familyNameWithWeight: string;
  label: string;
  labelWeight: string;
};

const FAMILY_LABELS: Record<string, string> = {
  DengXian: '等线',
  MicrosoftYaHei: '微软雅黑',
  'Microsoft YaHei': '微软雅黑',
  SimSun: '宋体',
  NSimSun: '新宋体',
  SimHei: '黑体',
  KaiTi: '楷体',
  FangSong: '仿宋',
  YouYuan: '幼圆',
  PingFangSC: '苹方 SC',
  SourceHanSansSC: '思源黑体 SC',
  SourceHanSerifSC: '思源宋体 SC',
  Arial: 'Arial',
  TimesNewRoman: 'Times New Roman',
  Calibri: 'Calibri',
  Cambria: 'Cambria',
  Verdana: 'Verdana',
  Tahoma: 'Tahoma',
  TrebuchetMS: 'Trebuchet MS',
  Georgia: 'Georgia',
  CourierNew: 'Courier New',
  SegoeUI: 'Segoe UI',
  SourceHanSans: '思源黑体',
  SourceHanSerif: '思源宋体',
  FangZhengHeiTi: '方正黑体',
  FangZhengKaiTi: '方正楷体',
  FangZhengShuSong: '方正宋体',
  FangZhengFangSong: '方正仿宋',
  AlibabaPuHuiTi: '阿里巴巴普惠体',
  ZhuqueFangSong: '朱雀仿宋',
  LXGWWenKai: '霞鹜文楷',
  WenDingPLKaiTi: '文鼎PL楷体',
  DeYiHei: '得意黑',
  MiSans: 'MiSans',
  CangerXiaowanzi: '仓耳小丸子',
  YousheTitleBlack: '优设标题黑',
  FengguangMingrui: '峰广明锐体',
  ShetuModernSquare: '摄图摩登小方体',
  ZcoolHappy: '站酷快乐体',
  ZizhiQuXiMai: '字制区喜脉体',
  SucaiJishiKangkang: '素材集市康康体',
  SucaiJishiCoolSquare: '素材集市酷方体',
  TuniuRounded: '途牛类圆体',
  RuiziZhenyan: '锐字真言体',
};

const LOCAL_FONT_NAMES: Record<string, string[]> = {
  DengXian: ['DengXian', '等线'],
  'Microsoft YaHei': ['Microsoft YaHei', '微软雅黑', 'MicrosoftYaHei'],
  SimSun: ['SimSun', '宋体'],
  NSimSun: ['NSimSun', '新宋体'],
  SimHei: ['SimHei', '黑体'],
  KaiTi: ['KaiTi', '楷体'],
  FangSong: ['FangSong', '仿宋'],
  YouYuan: ['YouYuan', '幼圆'],
  PingFangSC: ['PingFang SC', '苹方 SC', 'PingFangSC'],
  SourceHanSansSC: ['Source Han Sans SC', '思源黑体 SC', 'SourceHanSansSC'],
  SourceHanSerifSC: ['Source Han Serif SC', '思源宋体 SC', 'SourceHanSerifSC'],
  Arial: ['Arial'],
  TimesNewRoman: ['Times New Roman', 'TimesNewRoman'],
  Calibri: ['Calibri'],
  Cambria: ['Cambria'],
  Verdana: ['Verdana'],
  Tahoma: ['Tahoma'],
  TrebuchetMS: ['Trebuchet MS', 'TrebuchetMS'],
  Georgia: ['Georgia'],
  CourierNew: ['Courier New', 'CourierNew'],
  SegoeUI: ['Segoe UI', 'SegoeUI'],
  SourceHanSans: ['SourceHanSans', '思源黑体'],
  SourceHanSerif: ['SourceHanSerif', '思源宋体'],
  FangZhengHeiTi: ['FangZhengHeiTi', '方正黑体'],
  FangZhengKaiTi: ['FangZhengKaiTi', '方正楷体'],
  FangZhengShuSong: ['FangZhengShuSong', '方正宋体'],
  FangZhengFangSong: ['FangZhengFangSong', '方正仿宋'],
  AlibabaPuHuiTi: ['AlibabaPuHuiTi', '阿里巴巴普惠体'],
  ZhuqueFangSong: ['ZhuqueFangSong', 'ZhuQueFangSong', '朱雀仿宋'],
  LXGWWenKai: ['LXGWWenKai', '霞鹜文楷'],
  WenDingPLKaiTi: ['WenDingPLKaiTi', '文鼎PL楷体'],
  DeYiHei: ['DeYiHei', '得意黑'],
  MiSans: ['MiSans'],
  CangerXiaowanzi: ['CangerXiaowanzi', '仓耳小丸子'],
  YousheTitleBlack: ['YousheTitleBlack', '优设标题黑'],
  FengguangMingrui: ['FengguangMingrui', '峰广明锐体'],
  ShetuModernSquare: ['ShetuModernSquare', '摄图摩登小方体'],
  ZcoolHappy: ['ZcoolHappy', '站酷快乐体'],
  ZizhiQuXiMai: ['ZizhiQuXiMai', '字制区喜脉体'],
  SucaiJishiKangkang: ['SucaiJishiKangkang', '素材集市康康体'],
  SucaiJishiCoolSquare: ['SucaiJishiCoolSquare', '素材集市酷方体'],
  TuniuRounded: ['TuniuRounded', '途牛类圆体'],
  RuiziZhenyan: ['RuiziZhenyan', '锐字真言体'],
};

const WEIGHT_LABELS: Record<number, string> = {
  300: '细体',
  400: '常规',
  500: '中等',
  600: '半粗',
  700: '粗体',
};

const makeFontFace = (
  family: string,
  weight: number,
  file: string,
  localNames: string[] | undefined = undefined,
): FontFaceSource => {
  const label = FAMILY_LABELS[family] || family;
  const weightLabel = WEIGHT_LABELS[weight];
  return {
    family,
    weight,
    file,
    localNames: localNames ?? LOCAL_FONT_NAMES[family] ?? [family],
    familyName: family,
    familyNameWithWeight: `${family}_${weight}`,
    label,
    labelWeight: weightLabel ? `${label} ${weightLabel}` : label,
  };
};

export const FONT_SERVER_PATH = 'https://mateai.oss-cn-beijing.aliyuncs.com/aippt/front-fonts';

export const FONT_FACE_SOURCES: FontFaceSource[] = [
  makeFontFace('DengXian', 300, 'DengXian_Light'),
  makeFontFace('DengXian', 400, 'DengXian_Regular'),
  makeFontFace('DengXian', 700, 'DengXian_Bold'),
  makeFontFace('Microsoft YaHei', 300, 'MicrosoftYaHei_Light'),
  makeFontFace('Microsoft YaHei', 400, 'MicrosoftYaHei_Regular'),
  makeFontFace('Microsoft YaHei', 700, 'MicrosoftYaHei_Bold'),
  makeFontFace('SimSun', 400, 'SimSun_Regular'),
  makeFontFace('SimSun', 700, 'SimSun_Bold'),
  makeFontFace('NSimSun', 400, 'NSimSun_Regular'),
  makeFontFace('SimHei', 400, 'SimHei_Regular'),
  makeFontFace('SimHei', 700, 'SimHei_Bold'),
  makeFontFace('KaiTi', 400, 'KaiTi_Regular'),
  makeFontFace('FangSong', 400, 'FangSong_Regular'),
  makeFontFace('YouYuan', 400, 'YouYuan_Regular'),
  makeFontFace('PingFangSC', 300, 'PingFangSC_Light'),
  makeFontFace('PingFangSC', 400, 'PingFangSC_Regular'),
  makeFontFace('PingFangSC', 500, 'PingFangSC_Medium'),
  makeFontFace('PingFangSC', 600, 'PingFangSC_Semibold'),
  makeFontFace('SourceHanSansSC', 400, 'SourceHanSansSC_Regular'),
  makeFontFace('SourceHanSansSC', 500, 'SourceHanSansSC_Medium'),
  makeFontFace('SourceHanSansSC', 700, 'SourceHanSansSC_Bold'),
  makeFontFace('SourceHanSerifSC', 400, 'SourceHanSerifSC_Regular'),
  makeFontFace('SourceHanSerifSC', 500, 'SourceHanSerifSC_Medium'),
  makeFontFace('SourceHanSerifSC', 700, 'SourceHanSerifSC_Bold'),
  makeFontFace('Arial', 400, 'Arial_Regular'),
  makeFontFace('Arial', 700, 'Arial_Bold'),
  makeFontFace('TimesNewRoman', 400, 'TimesNewRoman_Regular'),
  makeFontFace('TimesNewRoman', 700, 'TimesNewRoman_Bold'),
  makeFontFace('Calibri', 400, 'Calibri_Regular'),
  makeFontFace('Calibri', 700, 'Calibri_Bold'),
  makeFontFace('Cambria', 400, 'Cambria_Regular'),
  makeFontFace('Cambria', 700, 'Cambria_Bold'),
  makeFontFace('Verdana', 400, 'Verdana_Regular'),
  makeFontFace('Verdana', 700, 'Verdana_Bold'),
  makeFontFace('Tahoma', 400, 'Tahoma_Regular'),
  makeFontFace('Tahoma', 700, 'Tahoma_Bold'),
  makeFontFace('TrebuchetMS', 400, 'TrebuchetMS_Regular'),
  makeFontFace('TrebuchetMS', 700, 'TrebuchetMS_Bold'),
  makeFontFace('Georgia', 400, 'Georgia_Regular'),
  makeFontFace('Georgia', 700, 'Georgia_Bold'),
  makeFontFace('CourierNew', 400, 'CourierNew_Regular'),
  makeFontFace('CourierNew', 700, 'CourierNew_Bold'),
  makeFontFace('SegoeUI', 400, 'SegoeUI_Regular'),
  makeFontFace('SegoeUI', 700, 'SegoeUI_Bold'),
  makeFontFace('SourceHanSans', 400, 'SourceHanSans'),
  makeFontFace('SourceHanSerif', 400, 'SourceHanSerif'),
  makeFontFace('FangZhengHeiTi', 400, 'FangZhengHeiTi'),
  makeFontFace('FangZhengKaiTi', 400, 'FangZhengKaiTi'),
  makeFontFace('FangZhengShuSong', 400, 'FangZhengShuSong'),
  makeFontFace('FangZhengFangSong', 400, 'FangZhengFangSong'),
  makeFontFace('AlibabaPuHuiTi', 400, 'AlibabaPuHuiTi'),
  makeFontFace('ZhuqueFangSong', 400, 'ZhuQueFangSong'),
  makeFontFace('LXGWWenKai', 400, 'LXGWWenKai'),
  makeFontFace('WenDingPLKaiTi', 400, 'WenDingPLKaiTi'),
  makeFontFace('DeYiHei', 400, 'DeYiHei'),
  makeFontFace('MiSans', 400, 'MiSans'),
  makeFontFace('CangerXiaowanzi', 400, 'CangerXiaowanzi'),
  makeFontFace('YousheTitleBlack', 400, 'YousheTitleBlack'),
  makeFontFace('FengguangMingrui', 400, 'FengguangMingrui'),
  makeFontFace('ShetuModernSquare', 400, 'ShetuModernSquare'),
  makeFontFace('ZcoolHappy', 400, 'ZcoolHappy'),
  makeFontFace('ZizhiQuXiMai', 400, 'ZizhiQuXiMai'),
  makeFontFace('SucaiJishiKangkang', 400, 'SucaiJishiKangkang'),
  makeFontFace('SucaiJishiCoolSquare', 400, 'SucaiJishiCoolSquare'),
  makeFontFace('TuniuRounded', 400, 'TuniuRounded'),
  makeFontFace('RuiziZhenyan', 400, 'RuiziZhenyan'),
];

const UNIQUE_FONTS = Array.from(
  new Map(FONT_FACE_SOURCES.map((item) => [item.familyName, item.label])).entries(),
).map(([value, label]) => ({ label, value }));

export const FONTS = [
  { label: '默认字体', value: '' },
  ...UNIQUE_FONTS,
] as const;

const buildFontAliasMap = () => {
  const map: Record<string, string> = {};
  const addAlias = (key: string, value: string) => {
    if (!key) return;
    const trimmed = key.trim();
    if (!trimmed) return;
    const noSpace = trimmed.replace(/\s+/g, '');
    map[trimmed] = value;
    map[trimmed.toLowerCase()] = value;
    map[noSpace] = value;
    map[noSpace.toLowerCase()] = value;
  };

  FONTS.forEach((item) => {
    addAlias(item.label, item.value);
    addAlias(item.value, item.value);
  });

  Object.entries(LOCAL_FONT_NAMES).forEach(([family, locals]) => {
    locals.forEach((name) => addAlias(name, family));
  });

  return map;
};

const FONT_ALIAS_MAP = buildFontAliasMap();

export const normalizeFontFamily = (value?: string) => {
  if (!value) return '';
  const first = value.split(',')[0]?.trim() || '';
  const cleaned = first.replace(/['"]/g, '');
  return FONT_ALIAS_MAP[cleaned]
    || FONT_ALIAS_MAP[cleaned.toLowerCase()]
    || FONT_ALIAS_MAP[cleaned.replace(/\s+/g, '')]
    || FONT_ALIAS_MAP[cleaned.replace(/\s+/g, '').toLowerCase()]
    || cleaned;
};
export const FONT_SIZE_OPTIONS = [
  12, 14, 16, 18, 20, 22, 24, 28, 32,
  36, 40, 44, 48, 54, 60, 66, 72, 76,
  80, 88, 96, 104, 112, 120,
]

export const PRESET_STYLES = [
  {
    label: '大标题',
    style: {
      fontSize: '26px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '66px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: '小标题',
    style: {
      fontSize: '22px',
      fontWeight: 700,
    },
    cmd: [
      { command: 'clear' },
      { command: 'bold' },
      { command: 'fontsize', value: '40px' },
      { command: 'align', value: 'center' },
    ],
  },
  {
    label: '正文',
    style: {
      fontSize: '20px',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '20px' },
    ],
  },
  {
    label: '正文[小]',
    style: {
      fontSize: '18px',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '18px' },
    ],
  },
  {
    label: '注释 1',
    style: {
      fontSize: '16px',
      fontStyle: 'italic',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '16px' },
      { command: 'em' },
    ],
  },
  {
    label: '注释 2',
    style: {
      fontSize: '16px',
      textDecoration: 'underline',
    },
    cmd: [
      { command: 'clear' },
      { command: 'fontsize', value: '16px' },
      { command: 'underline' },
    ],
  },
]

export const ADD_TEXT_PRESETS = [
  {
    key: 'title',
    label: '标题',
    presetLabel: '大标题',
    content: '<p>标题</p>',
    widthRatio: 0.72,
    height: 86,
    topRatio: 0.18,
  },
  {
    key: 'subtitle',
    label: '副标题',
    presetLabel: '小标题',
    content: '<p>副标题</p>',
    widthRatio: 0.64,
    height: 68,
    topRatio: 0.3,
  },
  {
    key: 'body',
    label: '正文',
    presetLabel: '正文[小]',
    content: '<p>正文内容</p>',
    widthRatio: 0.7,
    height: 180,
    topRatio: 0.28,
  },
] as const

export type AddTextPresetKey = typeof ADD_TEXT_PRESETS[number]['key']
