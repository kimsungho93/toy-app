import { httpClient } from "@/shared/api/httpClient"

export const testApi = {
  getTest: async (): Promise<string> => {
    const { data } = await httpClient.get<string>("/test")
    return data
  },
}
