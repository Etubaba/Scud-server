import { SetMetadata } from '@nestjs/common';

export const VERIFIED = 'isVerification';
export const BypassVerification = () => SetMetadata(VERIFIED, true);
