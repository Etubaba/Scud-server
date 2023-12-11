import { PartialType } from '@nestjs/mapped-types';
import { CreateTermsOfServicesDto } from './create-terms-of-services.dto';

export class UpdateTermsOfServicesDto extends PartialType(
    CreateTermsOfServicesDto,
) {}
