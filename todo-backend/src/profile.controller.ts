import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { ProfileService } from './profile.service';

type AuthenticatedRequest = Request & {
  user: {
    id: string;
    email?: string;
  };
};

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  async getMyProfile(@Req() req: AuthenticatedRequest) {
    return this.profileService.getMyProfile(req.user);
  }

  @Get('company-members')
  async getCompanyMembers(@Req() req: AuthenticatedRequest) {
    return this.profileService.getCompanyMembers(req.user);
  }

  @Put('me')
  async updateMyProfile(
    @Req() req: AuthenticatedRequest,
    @Body()
    body: {
      fullName?: string;
      avatarUrl?: string;
      address?: string;
      phone?: string;
      companyName?: string;
      companyAddress?: string;
    },
  ) {
    return this.profileService.updateMyProfile(req.user, body);
  }

  @Put(':userId')
  async updateProfileByUserId(
    @Req() req: AuthenticatedRequest,
    @Param('userId') userId: string,
    @Body()
    body: {
      fullName?: string;
      avatarUrl?: string;
      address?: string;
      phone?: string;
      companyName?: string;
      companyAddress?: string;
    },
  ) {
    return this.profileService.updateProfileByUserId(req.user, userId, body);
  }
}
