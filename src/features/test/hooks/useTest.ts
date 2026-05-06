import { useQuery } from "@tanstack/react-query"

import { testApi } from "../api/testApi"

export const useTest = () =>
  useQuery({
    queryKey: ["test"],
    queryFn: testApi.getTest,
  })
