import React, { useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import type { ContextmenuItem, Axis } from './types'
import './contextmenu.scss'

interface ContextmenuProps {
  axis: Axis
  el: HTMLElement
  menus: ContextmenuItem[]
  removeContextmenu: () => void
}

/**
 * 右键菜单组件
 */
export const Contextmenu: React.FC<ContextmenuProps> = ({
  axis,
  el,
  menus,
  removeContextmenu,
}) => {
  // 计算菜单位置
  const style = useMemo(() => {
    const MENU_WIDTH = 180
    const MENU_HEIGHT = 30
    const DIVIDER_HEIGHT = 11
    const PADDING = 5

    const { x, y } = axis
    const menuCount = menus.filter((menu) => !menu.divider && !menu.hide).length
    const dividerCount = menus.filter((menu) => menu.divider).length

    const menuWidth = MENU_WIDTH
    const menuHeight = menuCount * MENU_HEIGHT + dividerCount * DIVIDER_HEIGHT + PADDING * 2

    const screenWidth = document.body.clientWidth
    const screenHeight = document.body.clientHeight

    return {
      left: screenWidth <= x + menuWidth ? x - menuWidth : x,
      top: screenHeight <= y + menuHeight ? y - menuHeight : y,
    }
  }, [axis, menus])

  // 处理菜单项点击
  const handleClickMenuItem = useCallback(
    (item: ContextmenuItem) => {
      if (item.disable) return
      if (item.children && !item.handler) return
      if (item.handler) item.handler(el)
      removeContextmenu()
    },
    [el, removeContextmenu]
  )

  const content = (
    <>
      <div
        className="contextmenu-mask"
        onContextMenu={(e) => {
          e.preventDefault()
          removeContextmenu()
        }}
        onMouseDown={(e) => {
          e.stopPropagation()
          removeContextmenu()
        }}
        onClick={(e) => {
          e.stopPropagation()
        }}
      />

      <div
        className="contextmenu"
        style={{
          left: `${style.left}px`,
          top: `${style.top}px`,
        }}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuContent menus={menus} handleClickMenuItem={handleClickMenuItem} />
      </div>
    </>
  )

  return createPortal(content, document.body)
}

interface MenuContentProps {
  menus: ContextmenuItem[]
  handleClickMenuItem: (item: ContextmenuItem) => void
}

/**
 * 菜单内容组件（支持递归子菜单）
 */
const MenuContent: React.FC<MenuContentProps> = ({ menus, handleClickMenuItem }) => {
  return (
    <ul className="menu-content">
      {menus.map((menu, index) => {
        if (menu.hide) return null

        if (menu.divider) {
          return (
            <li key={menu.text || `divider-${index}`} className="menu-item divider">
              <div />
            </li>
          )
        }

        return (
          <li
            key={menu.text || index}
            className={`menu-item ${menu.disable ? 'disable' : ''}`}
            onClick={(e) => {
              e.stopPropagation()
              handleClickMenuItem(menu)
            }}
          >
            <div
              className={`menu-item-content ${menu.children ? 'has-children' : ''} ${
                menu.handler && menu.children ? 'has-handler' : ''
              }`}
            >
              <span className="text">{menu.text}</span>
              {menu.subText && !menu.children && (
                <span className="sub-text">{menu.subText}</span>
              )}

              {menu.children && menu.children.length > 0 && (
                <div className="sub-menu">
                  <MenuContent
                    menus={menu.children}
                    handleClickMenuItem={handleClickMenuItem}
                  />
                </div>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default Contextmenu
