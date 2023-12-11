import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountDto } from './create_discount.dto';

export class UpdateDiscountDto extends PartialType(CreateDiscountDto) {}
