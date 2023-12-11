import { PartialType } from '@nestjs/mapped-types';
import { CreatePeakFareDto } from './create-peak-fare.dto';

export class UpdatePeakFareDto extends PartialType(CreatePeakFareDto) {}
