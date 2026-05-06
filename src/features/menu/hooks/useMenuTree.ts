import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { getMenu, saveMenu } from "../api/menuApi"
import type { MenuNode } from "../model/menuTypes"

export const menuKeys = {
  all: ["menu"] as const,
  tree: () => [...menuKeys.all, "tree"] as const,
}

export const useMenuQuery = () =>
  useQuery({
    queryKey: menuKeys.tree(),
    queryFn: getMenu,
  })

export const useSaveMenuMutation = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: saveMenu,
    onMutate: async (newTree: MenuNode[]) => {
      await qc.cancelQueries({ queryKey: menuKeys.tree() })
      const previous = qc.getQueryData<MenuNode[]>(menuKeys.tree())
      qc.setQueryData(menuKeys.tree(), newTree)
      return { previous }
    },
    onError: (_err, _newTree, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(menuKeys.tree(), ctx.previous)
      }
    },
  })
}
