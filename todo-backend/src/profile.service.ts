import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

type AuthUser = {
  id: string;
  email?: string;
};

type UpdateProfilePayload = {
  fullName?: string;
  avatarUrl?: string;
  address?: string;
  phone?: string;
  companyName?: string;
  companyAddress?: string;
};

@Injectable()
export class ProfileService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertCanAccessTargetUser(authUserId: string, targetUserId: string) {
    if (authUserId !== targetUserId) {
      throw new ForbiddenException(
        'You can only modify your own profile information',
      );
    }
  }

  private async ensureUser(authUser: AuthUser) {
    return this.prismaService.prisma.user.upsert({
      where: { id: authUser.id },
      update: { email: authUser.email ?? '' },
      create: {
        id: authUser.id,
        email: authUser.email ?? `${authUser.id}@unknown.local`,
      },
    });
  }

  async getMyProfile(authUser: AuthUser) {
    await this.ensureUser(authUser);

    const user = await this.prismaService.prisma.user.findUniqueOrThrow({
      where: { id: authUser.id },
      include: {
        profile: true,
        company: true,
      },
    });

    return {
      userId: user.id,
      email: user.email,
      profile: {
        fullName: user.profile?.fullName ?? '',
        avatarUrl: user.profile?.avatarUrl ?? '',
        address: user.profile?.address ?? '',
        phone: user.profile?.phone ?? '',
      },
      company: user.company
        ? {
            id: user.company.id,
            name: user.company.name,
            address: user.company.address ?? '',
          }
        : null,
    };
  }

  async updateMyProfile(authUser: AuthUser, payload: UpdateProfilePayload) {
    await this.ensureUser(authUser);

    const user = await this.prismaService.prisma.user.findUniqueOrThrow({
      where: { id: authUser.id },
      select: { id: true, companyId: true },
    });

    await this.prismaService.prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        fullName: payload.fullName,
        avatarUrl: payload.avatarUrl,
        address: payload.address,
        phone: payload.phone,
      },
      create: {
        userId: user.id,
        fullName: payload.fullName,
        avatarUrl: payload.avatarUrl,
        address: payload.address,
        phone: payload.phone,
      },
    });

    if (payload.companyName) {
      if (user.companyId) {
        await this.prismaService.prisma.company.update({
          where: { id: user.companyId },
          data: {
            name: payload.companyName,
            address: payload.companyAddress,
          },
        });
      } else {
        const company = await this.prismaService.prisma.company.create({
          data: {
            name: payload.companyName,
            address: payload.companyAddress,
            ownerId: user.id,
            users: {
              connect: { id: user.id },
            },
          },
        });

        await this.prismaService.prisma.user.update({
          where: { id: user.id },
          data: { companyId: company.id },
        });
      }
    }

    return this.getMyProfile(authUser);
  }

  async updateProfileByUserId(
    authUser: AuthUser,
    targetUserId: string,
    payload: UpdateProfilePayload,
  ) {
    this.assertCanAccessTargetUser(authUser.id, targetUserId);
    return this.updateMyProfile(authUser, payload);
  }

  async getCompanyMembers(authUser: AuthUser) {
    await this.ensureUser(authUser);
    const me = await this.prismaService.prisma.user.findUniqueOrThrow({
      where: { id: authUser.id },
      select: { companyId: true },
    });

    if (!me.companyId) {
      return [];
    }

    const members = await this.prismaService.prisma.user.findMany({
      where: { companyId: me.companyId },
      include: { profile: true },
      orderBy: { createdAt: 'asc' },
    });

    return members.map((member) => ({
      id: member.id,
      email: member.email,
      fullName: member.profile?.fullName ?? '',
      avatarUrl: member.profile?.avatarUrl ?? '',
    }));
  }
}
