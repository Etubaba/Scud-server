import { PartialType } from '@nestjs/mapped-types';
import { CreateDriverPromoDto } from './create-driver-promo.dto';

export class UpdateDriverPromoDto extends PartialType(CreateDriverPromoDto) {}
