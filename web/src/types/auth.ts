export interface SignupPayload {
  email: string
  password: string
  name?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface SignupResponse {
  message: string
}

export interface AuthTokenResponse {
  access_token: string
  user?: UserProfile
}

export interface UserProfile {
  id?: string | number
  email: string
  name?: string
}
