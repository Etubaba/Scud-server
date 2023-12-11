import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class RaiseSupportIssueDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsString()
    @IsNotEmpty()
    content: string;
}
