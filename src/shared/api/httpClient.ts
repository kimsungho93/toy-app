import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios"

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // refresh token cookie 자동 전송
  timeout: 10_000,
})

// Auth DI — AuthProvider가 앱 초기화 시 주입
type TokenGetter = () => string | null
type RefreshFn = () => Promise<string>
type ClearAuthFn = () => void

let getToken: TokenGetter = () => null
let refreshFn: RefreshFn | null = null
let clearAuthFn: ClearAuthFn = () => {}
let refreshPromise: Promise<string> | null = null

export const configureAuth = (opts: {
  getToken: TokenGetter
  refresh: RefreshFn
  clearAuth: ClearAuthFn
}) => {
  getToken = opts.getToken
  refreshFn = opts.refresh
  clearAuthFn = opts.clearAuth
}

httpClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    if (error.response?.status === 401 && !config._retry && refreshFn) {
      config._retry = true
      try {
        if (!refreshPromise) {
          refreshPromise = refreshFn().finally(() => {
            refreshPromise = null
          })
        }
        const newToken = await refreshPromise
        config.headers.Authorization = `Bearer ${newToken}`
        return httpClient(config)
      } catch {
        clearAuthFn()
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)
