import { IUserRepository } from '@/repositories/userRepository';
import { PasswordHash } from '@/utils/passwordHash';
import { TokenManager, ITokenPayload } from '@/utils/tokenManager';
import { ERROR_CODES } from '@/constants/errorCodes';
import { IRegisterRequest, ILoginRequest } from '@/dto/requestDTO/authDTO';

export interface IAuthService {
  register(userData: IRegisterRequest): Promise<{ user: any; token: string }>;
  login(credentials: ILoginRequest): Promise<{ user: any; token: string }>;
  refreshToken(token: string): Promise<{ token: string }>;
  validateToken(token: string): Promise<ITokenPayload>;
}

export class AuthService implements IAuthService {
  constructor(private userRepository: IUserRepository) {}

  async register(userData: IRegisterRequest): Promise<{ user: any; token: string }> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error(ERROR_CODES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await PasswordHash.hash(userData.password);
    
    const user = await this.userRepository.create({
      ...userData,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: 'user'
    });

    const tokenPayload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = TokenManager.generateToken(tokenPayload);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      createdAt: user.createdAt
    };

    return { user: userResponse, token };
  }

  async login(credentials: ILoginRequest): Promise<{ user: any; token: string }> {
    const user = await this.userRepository.findByEmail(credentials.email.toLowerCase());
    if (!user) {
      throw new Error(ERROR_CODES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await PasswordHash.compare(credentials.password, user.password);
    if (!isPasswordValid) {
      throw new Error(ERROR_CODES.INVALID_CREDENTIALS);
    }

    const tokenPayload: ITokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    };

    const token = TokenManager.generateToken(tokenPayload);

    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses,
      createdAt: user.createdAt
    };

    return { user: userResponse, token };
  }

  async refreshToken(token: string): Promise<{ token: string }> {
    const payload = TokenManager.verifyToken(token);
    const newToken = TokenManager.generateToken(payload);
    return { token: newToken };
  }

  async validateToken(token: string): Promise<ITokenPayload> {
    return TokenManager.verifyToken(token);
  }
}
