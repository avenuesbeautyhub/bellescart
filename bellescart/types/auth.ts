export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface OtpData {
  email: string;
  otp: string;
}

export interface ResendOtpData {
  email: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponseData {
  token: string;
  refreshToken: string;
  user: UserProfile;
}

export interface AdminLoginResponseData {
  token: string;
  refreshToken: string;
  admin: UserProfile;
}
export interface AdminLoginResponse extends AdminLoginResponseData {
  data: AdminLoginResponseData;
  success: boolean;
  message: string;
}

export interface LoginResponse extends ApiResponse {
  data: LoginResponseData;
  success: boolean;
  message: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
}
