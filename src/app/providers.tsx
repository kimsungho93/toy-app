import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { ReactNode } from "react"

import { AuthProvider } from "@/features/auth"
import { queryClient } from "@/shared/api/queryClient"

export const Providers = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>{children}</AuthProvider>
    <ReactQueryDevtools />
  </QueryClientProvider>
)
