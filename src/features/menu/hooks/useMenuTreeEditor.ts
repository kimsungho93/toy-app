import { useEffect, useMemo, useState } from "react"
import type { KeyboardEvent, RefObject } from "react"

import type { MenuNode } from "../model/menuTypes"
import {
  createNode,
  findNode,
  findParent,
  flattenVisible,
  indentNode,
  insertChild,
  moveSiblingDown,
  moveSiblingUp,
  outdentNode,
  removeNode,
  renameNode,
} from "../utils/treeOperations"

import { useMenuQuery, useSaveMenuMutation } from "./useMenuTree"

export const useMenuTreeEditor = (
  containerRef: RefObject<HTMLDivElement | null>,
) => {
  const { data: tree, isLoading } = useMenuQuery()
  const save = useSaveMenuMutation()

  const [focusedId, setFocusedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState("")
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const current = useMemo(() => tree ?? [], [tree])
  const visible = useMemo(
    () => flattenVisible(current, expanded),
    [current, expanded],
  )

  // 포커스가 stale(삭제됨)이거나 미설정이면 첫 visible 노드로 폴백.
  const focusId = useMemo(() => {
    if (focusedId && findNode(current, focusedId)) return focusedId
    return visible[0]?.node.id ?? null
  }, [focusedId, current, visible])

  // 키보드 입력이 즉시 동작하도록 마운트 시 컨테이너에 포커스.
  useEffect(() => {
    containerRef.current?.focus()
  }, [containerRef])

  const commit = (newTree: MenuNode[]) => {
    save.mutate(newTree)
  }

  const focusContainer = () => {
    containerRef.current?.focus()
  }

  const startEdit = (id: string) => {
    const node = findNode(current, id)
    if (!node) return
    setEditingId(id)
    setEditValue(node.label)
  }

  const commitEdit = () => {
    if (!editingId) return
    const trimmed = editValue.trim()

    if (!trimmed) {
      // 빈 라벨 → 노드 삭제 (`+` 추가 후 입력 안 한 빈 노드 정리 포함)
      const visIdx = visible.findIndex((v) => v.node.id === editingId)
      const nextFocus =
        visible[visIdx - 1]?.node.id ?? visible[visIdx + 1]?.node.id ?? null
      commit(removeNode(current, editingId))
      setEditingId(null)
      setEditValue("")
      setFocusedId(nextFocus)
      focusContainer()
      return
    }

    commit(renameNode(current, editingId, trimmed))
    setEditingId(null)
    setEditValue("")
    focusContainer()
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValue("")
    focusContainer()
  }

  const toggleExpand = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ─── 키보드 헬퍼 (포커스 이동 전용) ──────────────────────────────

  const focusPrevVisible = () => {
    if (!focusId) return
    const idx = visible.findIndex((v) => v.node.id === focusId)
    if (idx > 0) setFocusedId(visible[idx - 1].node.id)
  }

  const focusNextVisible = () => {
    if (!focusId) return
    const idx = visible.findIndex((v) => v.node.id === focusId)
    if (idx >= 0 && idx < visible.length - 1) {
      setFocusedId(visible[idx + 1].node.id)
    }
  }

  const focusParent = () => {
    if (!focusId) return
    const ctx = findParent(current, focusId)
    if (ctx?.parent) setFocusedId(ctx.parent.id)
  }

  /** ← 키: 펼친 부모 노드면 접기, 아니면 부모로 포커스 이동. */
  const handleLeftKey = () => {
    if (!focusId) return
    const node = findNode(current, focusId)
    if (node && node.children.length > 0 && expanded.has(focusId)) {
      setExpanded((s) => {
        const next = new Set(s)
        next.delete(focusId)
        return next
      })
    } else {
      focusParent()
    }
  }

  /** → 키: 접힌 부모 노드면 펼치기, 아니면 첫 자식으로 포커스 이동. */
  const handleRightKey = () => {
    if (!focusId) return
    const node = findNode(current, focusId)
    if (!node || node.children.length === 0) return
    if (!expanded.has(focusId)) {
      setExpanded((s) => new Set(s).add(focusId))
    } else {
      setFocusedId(node.children[0].id)
    }
  }

  // ─── 구조 변경 액션 (툴바 버튼) ──────────────────────────────────

  const moveNodeUp = () => {
    if (!focusId) return
    commit(moveSiblingUp(current, focusId))
  }

  const moveNodeDown = () => {
    if (!focusId) return
    commit(moveSiblingDown(current, focusId))
  }

  const doOutdent = () => {
    if (!focusId) return
    commit(outdentNode(current, focusId))
  }

  const doIndent = () => {
    if (!focusId) return
    // 들여쓰기 후 새 부모를 자동 펼침 (이동이 시야에 남도록)
    const ctx = findParent(current, focusId)
    if (ctx && ctx.index > 0) {
      const newParent = ctx.siblings[ctx.index - 1]
      setExpanded((s) => new Set(s).add(newParent.id))
    }
    commit(indentNode(current, focusId))
  }

  const addChildOfFocused = () => {
    if (!focusId) return
    const newNode = createNode("")
    setExpanded((s) => new Set(s).add(focusId))
    commit(insertChild(current, focusId, newNode))
    setFocusedId(newNode.id)
    setEditingId(newNode.id)
    setEditValue("")
  }

  const deleteFocused = () => {
    if (!focusId) return
    const node = findNode(current, focusId)
    if (!node) return
    if (node.children.length > 0) {
      if (!window.confirm(`"${node.label}"와 하위 메뉴를 모두 삭제할까요?`))
        return
    }
    const visIdx = visible.findIndex((v) => v.node.id === focusId)
    const nextFocus =
      visible[visIdx + 1]?.node.id ?? visible[visIdx - 1]?.node.id ?? null
    commit(removeNode(current, focusId))
    setFocusedId(nextFocus)
  }

  // ─── 컨테이너 keydown 디스패처 ──────────────────────────────────

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (editingId) return
    if (!focusId) return

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault()
        focusPrevVisible()
        break
      case "ArrowDown":
        e.preventDefault()
        focusNextVisible()
        break
      case "ArrowLeft":
        e.preventDefault()
        handleLeftKey()
        break
      case "ArrowRight":
        e.preventDefault()
        handleRightKey()
        break
      case "Enter":
      case "F2":
        e.preventDefault()
        startEdit(focusId)
        break
      case " ": {
        const node = findNode(current, focusId)
        if (node && node.children.length > 0) {
          e.preventDefault()
          toggleExpand(focusId)
        }
        break
      }
    }
  }

  const selectRow = (id: string) => {
    setFocusedId(id)
    focusContainer()
  }

  return {
    // 쿼리 상태
    isLoading,
    hasNodes: current.length > 0,

    // 트리 상태
    visible,
    focusId,
    editingId,
    editValue,
    isExpanded: (id: string) => expanded.has(id),

    // 컨테이너 keydown 디스패처 (ref는 컴포넌트가 소유)
    onContainerKeyDown: handleKeyDown,

    // 툴바 액션 (클릭 후 컨테이너로 포커스 복귀)
    toolbar: {
      onUp: () => {
        moveNodeUp()
        focusContainer()
      },
      onDown: () => {
        moveNodeDown()
        focusContainer()
      },
      onLeft: () => {
        doOutdent()
        focusContainer()
      },
      onRight: () => {
        doIndent()
        focusContainer()
      },
      onAdd: addChildOfFocused,
      onDelete: () => {
        deleteFocused()
        focusContainer()
      },
    },

    // 행(row) 콜백
    selectRow,
    onEditChange: setEditValue,
    onEditCommit: commitEdit,
    onEditCancel: cancelEdit,
    onToggleExpand: toggleExpand,
  }
}
