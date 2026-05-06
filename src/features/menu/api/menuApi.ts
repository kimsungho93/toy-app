import type { MenuNode } from "../model/menuTypes"

const STORAGE_KEY = "menu-tree-v1"

export const getMenu = async (): Promise<MenuNode[]> => {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const saveMenu = async (tree: MenuNode[]): Promise<MenuNode[]> => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tree))
  return tree
}
