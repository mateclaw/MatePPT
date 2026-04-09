import { twMerge } from 'tailwind-merge'
import cln from 'classnames'

const classNames = (...cls: cln.ArgumentArray) => {
  return twMerge(cln(cls))
}

export const cn = classNames

export default classNames
