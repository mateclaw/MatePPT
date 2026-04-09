import dayjs from 'dayjs';

import relativeTime from 'dayjs/plugin/relativeTime';
// 扩展 dayjs 的相对时间插件
dayjs.extend(relativeTime);

/**
 * 格式化时间：
 * - 如果距离现在 ≤ 1 天，显示相对时间（例如：3小时前）
 * - 如果超过 1 天，显示日期（例如：2023/10/01）
 */
export const formatRelativeTime = (time: string | Date) => {
  const now = dayjs();
  const target = dayjs(time);
  const diffHours = now.diff(target, 'hour');

  // 超过 24 小时则显示日期，否则显示相对时间
  return diffHours >= 24 
    ? target.format('YYYY/MM/DD')  // 例如：2023/10/01
    : target.fromNow();            // 例如：3小时前
};

export function formatDate(date: any) {
  if (!date) {
    return '';
  }
  return dayjs(date).format('DD/MM/YYYY HH:mm:ss');
}

export function formatTime(date: any) {
  if (!date) {
    return '';
  }
  return dayjs(date).format('HH:mm:ss');
}

export function today() {
  return formatDate(dayjs());
}

export function lastDay() {
  return formatDate(dayjs().subtract(1, 'days'));
}

export function lastWeek() {
  return formatDate(dayjs().subtract(1, 'weeks'));
}
