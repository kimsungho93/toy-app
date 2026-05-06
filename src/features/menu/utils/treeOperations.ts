import type { MenuNode } from "../model/menuTypes"

export interface ParentInfo {
  parent: MenuNode | null
  siblings: MenuNode[]
  index: number
}

export const createNode = (label: string): MenuNode => ({
  id: crypto.randomUUID(),
  label,
  children: [],
})

export const findNode = (
  tree: MenuNode[],
  id: string,
): MenuNode | null => {
  for (const node of tree) {
    if (node.id === id) return node
    const found = findNode(node.children, id)
    if (found) return found
  }
  return null
}

export const findParent = (
  tree: MenuNode[],
  childId: string,
): ParentInfo | null => {
  const walk = (
    nodes: MenuNode[],
    parent: MenuNode | null,
  ): ParentInfo | null => {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === childId) return { parent, siblings: nodes, index: i }
      const found = walk(nodes[i].children, nodes[i])
      if (found) return found
    }
    return null
  }
  return walk(tree, null)
}

export const isDescendant = (
  tree: MenuNode[],
  ancestorId: string,
  candidateId: string,
): boolean => {
  const ancestor = findNode(tree, ancestorId)
  if (!ancestor) return false
  return Boolean(findNode(ancestor.children, candidateId))
}

export const insertChild = (
  tree: MenuNode[],
  parentId: string | null,
  node: MenuNode,
): MenuNode[] => {
  if (parentId === null) return [...tree, node]
  return tree.map((n) =>
    n.id === parentId
      ? { ...n, children: [...n.children, node] }
      : { ...n, children: insertChild(n.children, parentId, node) },
  )
}

export const removeNode = (tree: MenuNode[], id: string): MenuNode[] =>
  tree
    .filter((n) => n.id !== id)
    .map((n) => ({ ...n, children: removeNode(n.children, id) }))

export const renameNode = (
  tree: MenuNode[],
  id: string,
  label: string,
): MenuNode[] =>
  tree.map((n) =>
    n.id === id
      ? { ...n, label }
      : { ...n, children: renameNode(n.children, id, label) },
  )

const insertAt = (
  tree: MenuNode[],
  parentId: string | null,
  node: MenuNode,
  index: number,
): MenuNode[] => {
  if (parentId === null) {
    const next = [...tree]
    next.splice(index, 0, node)
    return next
  }
  return tree.map((n) => {
    if (n.id === parentId) {
      const nextChildren = [...n.children]
      nextChildren.splice(index, 0, node)
      return { ...n, children: nextChildren }
    }
    return { ...n, children: insertAt(n.children, parentId, node, index) }
  })
}

/**
 * Move a node to a new parent at a specific index.
 * Returns the original tree if the move would create a cycle.
 * `index` is interpreted in the tree *after* the node has been removed.
 */
export const moveNode = (
  tree: MenuNode[],
  nodeId: string,
  newParentId: string | null,
  index: number,
): MenuNode[] => {
  if (newParentId !== null && nodeId === newParentId) return tree
  if (newParentId !== null && isDescendant(tree, nodeId, newParentId))
    return tree

  const node = findNode(tree, nodeId)
  if (!node) return tree

  const without = removeNode(tree, nodeId)
  return insertAt(without, newParentId, node, index)
}

/**
 * Insert a new sibling immediately after the given node.
 * Returns [newTree, newNodeId]. If node not found, returns the original tree.
 */
export const insertSiblingAfter = (
  tree: MenuNode[],
  siblingId: string,
  newNode: MenuNode,
): { tree: MenuNode[]; insertedId: string } => {
  const ctx = findParent(tree, siblingId)
  if (!ctx) return { tree, insertedId: siblingId }
  const parentId = ctx.parent?.id ?? null
  return {
    tree: insertAt(tree, parentId, newNode, ctx.index + 1),
    insertedId: newNode.id,
  }
}

/**
 * Make the node a child of its previous sibling. No-op if there is no previous sibling.
 */
export const indentNode = (tree: MenuNode[], id: string): MenuNode[] => {
  const ctx = findParent(tree, id)
  if (!ctx) return tree
  if (ctx.index === 0) return tree
  const prev = ctx.siblings[ctx.index - 1]
  return moveNode(tree, id, prev.id, prev.children.length)
}

/**
 * Move the node up one level, placing it as the next sibling of its parent.
 * No-op if the node is already at the root level.
 */
export const outdentNode = (tree: MenuNode[], id: string): MenuNode[] => {
  const ctx = findParent(tree, id)
  if (!ctx || ctx.parent === null) return tree
  const grandCtx = findParent(tree, ctx.parent.id)
  const grandparentId = grandCtx?.parent?.id ?? null
  const insertIndex = grandCtx ? grandCtx.index + 1 : ctx.index
  return moveNode(tree, id, grandparentId, insertIndex)
}

/**
 * Swap the node with its previous sibling. No-op if it is the first child.
 */
export const moveSiblingUp = (tree: MenuNode[], id: string): MenuNode[] => {
  const ctx = findParent(tree, id)
  if (!ctx || ctx.index === 0) return tree
  const parentId = ctx.parent?.id ?? null
  return moveNode(tree, id, parentId, ctx.index - 1)
}

/**
 * Swap the node with its next sibling. No-op if it is the last child.
 * Note: index in moveNode is post-removal, so to move from i to i+1 we pass i+1
 * (after removal, the next sibling is at i, and we want to land after it → index i+1).
 */
export const moveSiblingDown = (tree: MenuNode[], id: string): MenuNode[] => {
  const ctx = findParent(tree, id)
  if (!ctx || ctx.index >= ctx.siblings.length - 1) return tree
  const parentId = ctx.parent?.id ?? null
  return moveNode(tree, id, parentId, ctx.index + 1)
}

/**
 * Flatten the tree into a list of {node, depth} for visible (expanded) nodes only,
 * in the order they appear top-to-bottom.
 */
export const flattenVisible = (
  tree: MenuNode[],
  expanded: ReadonlySet<string>,
  depth = 0,
): Array<{ node: MenuNode; depth: number }> => {
  const result: Array<{ node: MenuNode; depth: number }> = []
  for (const node of tree) {
    result.push({ node, depth })
    if (node.children.length > 0 && expanded.has(node.id)) {
      result.push(...flattenVisible(node.children, expanded, depth + 1))
    }
  }
  return result
}
