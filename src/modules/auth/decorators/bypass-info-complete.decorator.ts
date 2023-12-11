import { SetMetadata } from '@nestjs/common';

export const INFOCOMPLETE = 'isInfoComplete';
export const BypassInfoComplete = () => SetMetadata(INFOCOMPLETE, true);
