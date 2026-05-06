import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router"

import { authApi } from "../api/authApi"
import { useAuthContext } from "../model/authContext"
import type { LoginRequest, SignupRequest } from "../model/types"

export const useAuth = () => {
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthContext()
  const navigate = useNavigate()

  const loginMutation = useMutation({
    mutationFn: (req: LoginRequest) => authApi.login(req),
    onSuccess: ({ accessToken, user }) => {
      setAuth(user, accessToken)
      navigate("/")
    },
  })

  const signupMutation = useMutation({
    mutationFn: (req: SignupRequest) => authApi.signup(req),
    onSuccess: ({ accessToken, user }) => {
      setAuth(user, accessToken)
      navigate("/")
    },
  })

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth()
      navigate("/login")
    },
  })

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    signup: signupMutation.mutateAsync,
    logout: () => logoutMutation.mutate(),
    loginPending: loginMutation.isPending,
    signupPending: signupMutation.isPending,
    loginError: loginMutation.error,
    signupError: signupMutation.error,
  }
}
