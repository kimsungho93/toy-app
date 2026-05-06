import clsx from "clsx"
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react"
import { useRef } from "react"

import { useMenuTreeEditor } from "../hooks/useMenuTreeEditor"

import MenuNodeRow from "./MenuNodeRow"
import "./MenuTreeEditor.scss"

const MenuTreeEditor = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const editor = useMenuTreeEditor(containerRef)

  if (editor.isLoading) {
    return <p className="menu-tree-editor loading">불러오는 중…</p>
  }

  return (
    <div className="menu-tree-editor">
      <ArrowControls disabled={!editor.focusId} {...editor.toolbar} />
      <div
        ref={containerRef}
        tabIndex={0}
        onKeyDown={editor.onContainerKeyDown}
        className="tree"
      >
        {!editor.hasNodes ? (
          <p className="empty">메뉴가 없습니다.</p>
        ) : (
          <ul role="tree" className="treeList">
            {editor.visible.map(({ node, depth }) => (
              <MenuNodeRow
                key={node.id}
                node={node}
                depth={depth}
                isFocused={node.id === editor.focusId}
                isEditing={node.id === editor.editingId}
                editValue={editor.editValue}
                isExpanded={editor.isExpanded(node.id)}
                hasChildren={node.children.length > 0}
                onSelect={() => editor.selectRow(node.id)}
                onEditChange={editor.onEditChange}
                onEditCommit={editor.onEditCommit}
                onEditCommitAndAddSibling={editor.onEditCommit}
                onEditCancel={editor.onEditCancel}
                onToggleExpand={() => editor.onToggleExpand(node.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

interface ArrowControlsProps {
  disabled: boolean
  onUp: () => void
  onDown: () => void
  onLeft: () => void
  onRight: () => void
  onAdd: () => void
  onDelete: () => void
}

const ArrowControls = ({
  disabled,
  onUp,
  onDown,
  onLeft,
  onRight,
  onAdd,
  onDelete,
}: ArrowControlsProps) => (
  <div className="toolbar">
    <div className="dpad">
      <span aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={onUp}
        title="형제 위로 이동"
        aria-label="형제 위로 이동"
        className="toolButton"
      >
        <ChevronUp size={16} />
      </button>
      <span aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={onLeft}
        title="내어쓰기"
        aria-label="내어쓰기"
        className="toolButton"
      >
        <ChevronLeft size={16} />
      </button>
      <span aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={onRight}
        title="들여쓰기"
        aria-label="들여쓰기"
        className="toolButton"
      >
        <ChevronRight size={16} />
      </button>
      <span aria-hidden />
      <button
        type="button"
        disabled={disabled}
        onClick={onDown}
        title="형제 아래로 이동"
        aria-label="형제 아래로 이동"
        className="toolButton"
      >
        <ChevronDown size={16} />
      </button>
      <span aria-hidden />
    </div>
    <span className="divider" />
    <button
      type="button"
      disabled={disabled}
      onClick={onAdd}
      title="자식 추가"
      aria-label="자식 추가"
      className="toolButton"
    >
      <Plus size={16} />
    </button>
    <button
      type="button"
      disabled={disabled}
      onClick={onDelete}
      title="삭제"
      aria-label="삭제"
      className={clsx("toolButton", "toolButtonDanger")}
    >
      <Trash2 size={16} />
    </button>
  </div>
)

export default MenuTreeEditor
