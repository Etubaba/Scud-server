import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCancelReasonDto } from './create-cancel-reason.dto';

export class UpdateCancelReasonDto extends PartialType(CreateCancelReasonDto) {}
