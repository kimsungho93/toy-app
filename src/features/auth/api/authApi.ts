// Mock implementation — localStorage로 백엔드 시뮬레이션.
// 백엔드 도입 시 이 파일만 교체. (실제 환경: refresh token은 HttpOnly cookie)
import type { AuthResponse, LoginRequest, SignupRequest } from "../model/types"

const USERS_KEY = "mock-auth-users-v1"
const REFRESH_KEY = "mock-refresh-token-v1"

interface StoredUser {
  id: string
  email: string
  name: string
  password: string // plaintext — mock only
}

interface StoredRefreshToken {
  token: string
  userId: string
  family: string
}

const loadUsers = (): StoredUser[] => {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]")
  } catch {
    return []
  }
}

const saveUsers = (users: StoredUser[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

const delay = () => new Promise<void>((r) => setTimeout(r, 400))

export const authApi = {
  login: async (req: LoginRequest): Promise<AuthResponse> => {
    await delay()
    const user = loadUsers().find((u) => u.email === req.email && u.password === req.password)
    if (!user) throw new Error("이메일 또는 비밀번호가 올바르지 않습니다")

    localStorage.setItem(
      REFRESH_KEY,
      JSON.stringify({ token: uid(), userId: user.id, family: uid() } satisfies StoredRefreshToken),
    )
    return { accessToken: uid(), user: { id: user.id, email: user.email, name: user.name } }
  },

  signup: async (req: SignupRequest): Promise<AuthResponse> => {
    await delay()
    const users = loadUsers()
    if (users.some((u) => u.email === req.email)) throw new Error("이미 사용 중인 이메일입니다")

    const newUser: StoredUser = { id: uid(), email: req.email, name: req.name, password: req.password }
    saveUsers([...users, newUser])

    localStorage.setItem(
      REFRESH_KEY,
      JSON.stringify({ token: uid(), userId: newUser.id, family: uid() } satisfies StoredRefreshToken),
    )
    return { accessToken: uid(), user: { id: newUser.id, email: newUser.email, name: newUser.name } }
  },

  logout: async (): Promise<void> => {
    await delay()
    localStorage.removeItem(REFRESH_KEY)
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    await delay()
    const raw = localStorage.getItem(REFRESH_KEY)
    if (!raw) throw new Error("Refresh token not found")

    const current: StoredRefreshToken = JSON.parse(raw)
    // Rotation: 기존 토큰 교체
    localStorage.setItem(
      REFRESH_KEY,
      JSON.stringify({ token: uid(), userId: current.userId, family: current.family } satisfies StoredRefreshToken),
    )
    return { accessToken: uid() }
  },
}
