import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User as UserEntity } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

export const UserParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/** Alias for cleaner controller usage */
export const User = UserParam;
