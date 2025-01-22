import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../models/User';
import { CryptoService } from './CryptoService';
import { AuthenticationError } from '../../exceptions/auth.exceptions';
import { Logger } from '../../utils/logger';

@Injectable()
export class EnhancedAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly cryptoService: CryptoService
  ) {}

  async validateUser(email: string, password: string): Promise<User> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    const isValid = await this.cryptoService.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      // 失敗した認証試行を記録
      await this.recordFailedAttempt(user);
      throw new AuthenticationError('Invalid credentials');
    }

    // アカウントロックのチェック
    if (await this.isAccountLocked(user)) {
      throw new AuthenticationError('Account is locked');
    }

    return user;
  }

  async generateTokens(user: User) {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user)
    ]);

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
      sessionId: await this.cryptoService.generateSessionId()
    };

    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      audience: process.env.JWT_AUDIENCE,
      issuer: process.env.JWT_ISSUER
    });
  }

  private async generateRefreshToken(user: User): Promise<string> {
    const payload = {
      sub: user.id,
      type: 'refresh',
      sessionId: await this.cryptoService.generateSessionId()
    };

    return this.jwtService.sign(payload, {
      expiresIn: '7d'
    });
  }
} 