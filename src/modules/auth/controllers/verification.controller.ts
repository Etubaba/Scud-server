import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    Param,
    Query,
} from '@nestjs/common';
import { VerifyOtpDto } from './../dto/verify-otp.dto';
import { VerificationService } from '../services/verification.service';
import { BypassVerification } from '../decorators/bypass-verification.decorator';
import { OtpType } from '@prisma/client';

@Controller('auth')
export class VerificationController {
    constructor(private readonly verificationService: VerificationService) {}

    @Get('send-otp')
    @BypassVerification()
    @HttpCode(HttpStatus.OK)
    async sendOtp(@Req() request, @Query('otp_type') otpType?: OtpType) {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return await this.verificationService.sendOtp(sub, otpType);
    }

    @Post('verify')
    @BypassVerification()
    @HttpCode(HttpStatus.OK)
    async verifyOtp(@Req() request, @Body() verifyOtpDto: VerifyOtpDto) {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return await this.verificationService.verifyOtp(sub, verifyOtpDto);
    }
}
