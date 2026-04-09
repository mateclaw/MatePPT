/**
 * 生成唯一 ID（与 jsonppt IdGenerator 格式一致）
 *
 * jsonppt 格式：UUID 前 10 个字符（固定 10 位十六进制）
 * 示例：'3f3a59cee3', 'bc125de974'
 *
 * @param prefix - 可选前缀（用于区分不同类型的 ID）
 * @returns 10 个字符的唯一 ID
 */
export function generateId(prefix: string = ''): string {
  // 使用 crypto.randomUUID() 或降级到 Math.random()
  const uuid = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })

  // 取前 10 个字符（去除连字符）
  const id = uuid.replace(/-/g, '').substring(0, 10)

  return prefix ? `${prefix}-${id}` : id
}
