import { post } from "@/lib/apiClient"
import { AuthTokenResponse, LoginPayload, SignupPayload, SignupResponse } from "@/types/auth"

export function signupUser(payload: SignupPayload) {
  return post<SignupResponse, SignupPayload>("/auth/signup", payload)
}

export function loginUser(payload: LoginPayload) {
  return post<AuthTokenResponse, LoginPayload>("/auth/login", payload)
}
