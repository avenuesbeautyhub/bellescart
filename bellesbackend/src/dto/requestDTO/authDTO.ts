export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IUpdateProfileRequest {
  name?: string;
  phone?: string;
}

export interface IAddAddressRequest {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country?: string;
  isDefault?: boolean;
}

export interface IUpdateAddressRequest {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}
