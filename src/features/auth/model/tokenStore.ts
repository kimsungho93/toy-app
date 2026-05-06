// Module-level singleton — readable outside React (e.g., httpClient interceptors)
let token: string | null = null

export const tokenStore = {
  get: (): string | null => token,
  set: (t: string | null) => {
    token = t
  },
}
