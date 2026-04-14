import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      const { email, password } = body;
      
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.authService.signIn(email, password);
      
      if (!result.session) {
        throw new BadRequestException(
          'Login failed. Please verify your email address or check your credentials.'
        );
      }

      return {
        token: result.session.access_token,
        user: result.user,
      };
    } catch (error) {
      if (error.message?.includes('Invalid login credentials')) {
        throw new BadRequestException('Invalid email or password');
      }
      if (error.message?.includes('Email not confirmed')) {
        throw new BadRequestException('Please verify your email before logging in');
      }
      throw error;
    }
  }

  @Post('signup')
  async signup(@Body() body: { email: string; password: string }) {
    try {
      const { email, password } = body;
      
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const result = await this.authService.signUp(email, password);
      return {
        token: result.session?.access_token || null,
        user: result.user,
        message: 'User created successfully. Please check your email to confirm your account.',
      };
    } catch (error) {
      if (error.message?.includes('already registered')) {
        throw new BadRequestException('This email is already registered');
      }
      throw error;
    }
  }
}