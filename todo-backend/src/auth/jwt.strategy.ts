import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { createPublicKey } from 'crypto';
import { AuthService } from './auth.service';

type JwtPayload = {
  sub?: string;
  email?: string;
  role?: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly supabaseUrl: string;
  private readonly jwksCache = new Map<string, string>();

  constructor(private readonly authService: AuthService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL must be provided');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      passReqToCallback: true,
      secretOrKeyProvider: async (_request, rawJwtToken, done) => {
        try {
          const kid = this.extractKid(rawJwtToken);
          const publicKey = await this.getPublicKey(kid);
          done(null, publicKey);
        } catch (error) {
          done(error as Error);
        }
      },
      algorithms: ['ES256', 'RS256', 'HS256'],
    });

    this.supabaseUrl = supabaseUrl;
  }

  private extractKid(rawJwtToken: string): string {
    const [headerPart] = rawJwtToken.split('.');
    if (!headerPart) {
      throw new UnauthorizedException('Invalid token header');
    }

    const headerJson = Buffer.from(headerPart, 'base64url').toString('utf8');
    const header = JSON.parse(headerJson) as { kid?: string };
    if (!header.kid) {
      throw new UnauthorizedException('Missing token key id');
    }

    return header.kid;
  }

  private async getPublicKey(kid: string): Promise<string> {
    const cached = this.jwksCache.get(kid);
    if (cached) {
      return cached;
    }

    const response = await fetch(
      `${this.supabaseUrl}/auth/v1/.well-known/jwks.json`,
    );
    if (!response.ok) {
      throw new UnauthorizedException('Unable to fetch JWKS');
    }

    const data = (await response.json()) as {
      keys?: Array<Record<string, unknown> & { kid?: string }>;
    };
    const jwk = data.keys?.find((key) => key.kid === kid);
    if (!jwk) {
      throw new UnauthorizedException('Signing key not found');
    }

    const keyObject = createPublicKey({ key: jwk as any, format: 'jwk' });
    const pem = keyObject.export({ type: 'spki', format: 'pem' }).toString();
    this.jwksCache.set(kid, pem);
    return pem;
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);

    if (!token) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const user = await this.authService.validateAccessToken(token);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return {
      id: user.id ?? payload.sub,
      email: user.email ?? payload.email,
      role: payload.role,
    };
  }
}
