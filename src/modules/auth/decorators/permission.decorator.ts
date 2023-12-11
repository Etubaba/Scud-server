import { SetMetadata } from '@nestjs/common';

export const PERMISSION = 'permissions';
export const Permissions = (...permissions: string[]) =>
    SetMetadata(PERMISSION, permissions);
