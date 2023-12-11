import { RefreshTokenDto } from './../dto/refresh-token.dto';
import {
    Controller,
    Post,
    Get,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    Patch,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Guest } from '../decorators/public.decorator';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { BypassVerification } from '../decorators/bypass-verification.decorator';
import { UsersService } from 'src/modules/users/users.service';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileInterceptorConfig } from 'src/common/interceptors/file.interceptor.config';
import { IMAGE_MIME_TYPE } from 'src/common/types/mime.types';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService,
    ) {}

    @Guest()
    @BypassVerification()
    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto): Promise<any> {
        return await this.authService.register(registerDto);
    }

    @Guest()
    @BypassVerification()
    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() loginDto: LoginDto): Promise<any> {
        return await this.authService.login(loginDto);
    }

    @Get('profile')
    @HttpCode(HttpStatus.OK)
    async profile(@Req() request): Promise<any> {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return await this.authService.profile(sub);
    }

    @BypassVerification()
    @Patch('profile')
    @HttpCode(HttpStatus.CREATED)
    async updateInfo(
        @Req() request,
        @Body() updateProfileDto: UpdateProfileDto,
    ): Promise<any> {
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        return await this.usersService.update(+sub, updateProfileDto);
    }

    @Guest()
    @BypassVerification()
    @Post('refresh')
    @HttpCode(HttpStatus.CREATED)
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return await this.authService.refreshToken(refreshTokenDto);
    }
    @BypassVerification()
    @Patch('picture')
    @HttpCode(HttpStatus.CREATED)
    @UseInterceptors(
        FileInterceptor(
            'image',
            new FileInterceptorConfig(
                IMAGE_MIME_TYPE,
                './uploads/profile-pictures',
            ).createMulterOptions(),
        ),
    )
    async updatePicture(
        @Req() req: any,
        @UploadedFile() image: Express.Multer.File,
    ) {
        const { sub } = req.user;
        if (!image) {
            throw new BadRequestException('No file uploaded');
        }
        return await this.usersService.uploadPhoto(sub, image);
    }
}
