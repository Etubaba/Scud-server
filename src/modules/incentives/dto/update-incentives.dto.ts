import { PartialType } from '@nestjs/mapped-types';
import { CreateIncentivesDto } from './create-incentives.dto';

export class UpdateIncentivesDto extends PartialType(CreateIncentivesDto) {}
