import { PartialType } from '@nestjs/mapped-types';
import { CreateNightFareDto } from './create-night-fare.dto';

export class UpdateNightFareDto extends PartialType(CreateNightFareDto) {}
