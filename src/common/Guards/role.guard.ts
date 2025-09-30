import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from '@prisma/client';
import { Request } from 'express';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();

    const reqRole = this.reflector.get<string>('role', context.getHandler());
    const user: User = req.user as User;

    if (!reqRole) {
      return true;
    }

    if (!user || !user.role) {
      throw new ForbiddenException('У пользователя нет роли');
    }

    const hasRole = reqRole.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException('Недостаточно прав');
    }
    return true;
  }
}
