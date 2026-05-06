import clsx from "clsx"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { KeyboardEvent } from "react"

import type { MenuNode } from "../model/menuTypes"

import "./MenuNodeRow.scss"

interface MenuNodeRowProps {
  node: MenuNode
  depth: number
  isFocused: boolean
  isEditing: boolean
  editValue: string
  isExpanded: boolean
  hasChildren: boolean
  onSelect: () => void
  onEditChange: (value: string) => void
  onEditCommit: () => void
  onEditCommitAndAddSibling: () => void
  onEditCancel: () => void
  onToggleExpand: () => void
}

const MenuNodeRow = ({
  node,
  depth,
  isFocused,
  isEditing,
  editValue,
  isExpanded,
  hasChildren,
  onSelect,
  onEditChange,
  onEditCommit,
  onEditCommitAndAddSibling,
  onEditCancel,
  onToggleExpand,
}: MenuNodeRowProps) => {
  const handleEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (e.shiftKey) onEditCommit()
      else onEditCommitAndAddSibling()
    } else if (e.key === "Escape") {
      e.preventDefault()
      onEditCancel()
    }
  }

  return (
    <li
      role="treeitem"
      aria-selected={isFocused}
      aria-expanded={hasChildren ? isExpanded : undefined}
      className={clsx("menu-node-row", isFocused && !isEditing && "focused", isEditing && "editing")}
      style={{ paddingLeft: `${depth * 20 + 4}px` }}
      onClick={onSelect}
    >
      <button
        type="button"
        tabIndex={-1}
        onClick={(e) => {
          e.stopPropagation()
          if (hasChildren) onToggleExpand()
        }}
        aria-label={hasChildren ? (isExpanded ? "접기" : "펼치기") : undefined}
        className={clsx("toggle", !hasChildren && "invisible")}
      >
        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
      </button>

      {isEditing ? (
        <input
          autoFocus
          value={editValue}
          onChange={(e) => onEditChange(e.target.value)}
          onBlur={onEditCommit}
          onKeyDown={handleEditKey}
          onClick={(e) => e.stopPropagation()}
          placeholder="메뉴 이름"
          className="editInput"
        />
      ) : (
        <span className="label">
          {node.label || <span className="placeholder">(이름 없음)</span>}
        </span>
      )}
    </li>
  )
}

export default MenuNodeRow
