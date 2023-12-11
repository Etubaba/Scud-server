import { JwtPayload } from './../../../common/types/jwtPayload.type';
import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { RegisterDto } from '../dto/register.dto';
import { PasswordHash } from '../password.hash';
import configuration from '../../../../configs';
import { LoginDto } from '../dto/login.dto';
import { OtpService } from 'src/modules/notifications/services/otp.service';
import { OtpType, Provider, User } from '@prisma/client';
import { VerificationService } from './verification.service';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { MediaService } from 'src/modules/media/media.service';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly jwtService: JwtService,
        private readonly passwordHash: PasswordHash,
        @Inject(forwardRef(() => UsersService))
        private readonly usersService: UsersService,
        private readonly otpService: OtpService,
        private readonly verificationService: VerificationService,
        private readonly configService: ConfigService,
    ) {}

    async isAccountInformationComplete(sub: number) {
        const user = await this.usersService.findOne(sub);
        return !(user && user.first_name && user.last_name && user.gender);
    }

    async generateNewToken(
        userId: number,
        email: string,
        type: 'access' | 'refresh',
    ): Promise<string> {
        const token = await this.jwtService.signAsync(
            {
                email,
                sub: userId,
            },
            {
                secret: <string>configuration().jwt[type].secret,
                expiresIn: configuration().jwt[type].signInOptions.expiresIn,
            },
        );
        return token;
    }

    async validateUser(email: string, passwordText: string): Promise<object> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            throw new BadRequestException(`User ${email} not found`);
        }
        const passwordVerification = await this.passwordHash.verify(
            user.password,
            passwordText,
        );
        if (!passwordVerification) {
            return null;
        }
        // return the user's data except password
        const { password, ...result } = user;
        return result;
    }

    async register(registerDto: RegisterDto): Promise<object> {
        const exist = await this.usersService.findByPhone(registerDto.phone);
        if (exist) {
            if (
                registerDto.role &&
                !(await this.usersService.hasRole(exist.id, registerDto.role))
            ) {
                if (registerDto.email) {
                    const emailInUse = await this.usersService.findByEmail(
                        registerDto.email,
                    );
                    if (emailInUse && emailInUse.id !== exist.id) {
                        throw new BadRequestException('Credentials in use');
                    }
                }
                const updatedUser = await this.usersService.update(exist.id, {
                    roles: [registerDto.role],
                } as UpdateUserDto);
                const [accessToken, refreshToken] = await Promise.all([
                    this.generateNewToken(
                        updatedUser.id,
                        updatedUser.email,
                        'access',
                    ),
                    this.generateNewToken(
                        updatedUser.id,
                        updatedUser.email,
                        'refresh',
                    ),
                ]);
                return { user: updatedUser, accessToken, refreshToken };
            }
            throw new BadRequestException('Credentials in use');
        }
        const { user, message } = await this.usersService.create(registerDto);
        if (!user) {
            throw new BadRequestException('Registration failed');
        }
        const [accessToken, refreshToken] = await Promise.all([
            this.generateNewToken(user.id, user.email, 'access'),
            this.generateNewToken(user.id, user.email, 'refresh'),
        ]);

        return { user, accessToken, refreshToken, message };
    }

    async login(loginDto: LoginDto): Promise<object> {
        let user: any;
        const provider = String(
            loginDto?.provider || user.provider,
        ).toLowerCase();
        const isProductionEnvironment =
            this.configService.get('app.environment') === 'production';

        if (loginDto.provider && loginDto.provider == Provider.phone) {
            if (!loginDto.phone) {
                throw new HttpException(
                    'Phone number is required',
                    HttpStatus.BAD_REQUEST,
                );
            }
            user = await this.usersService.findByPhone(loginDto.phone);
        } else if (loginDto.provider && loginDto.provider == Provider.email) {
            if (!loginDto.email) {
                throw new HttpException(
                    'Email is required',
                    HttpStatus.BAD_REQUEST,
                );
            }
            user = await this.usersService.findByEmail(loginDto.email);
        } else {
            throw new HttpException(
                'You need to select a valid provider and provider information to proceed',
                HttpStatus.BAD_REQUEST,
            );
        }

        if (!user) {
            throw new ForbiddenException('Invalid credentials');
        }

        if (
            loginDto.roles &&
            !(user.roles as string[]).some((role) =>
                loginDto.roles.includes(role),
            )
        ) {
            throw new ForbiddenException('Invalid credentials');
        }

        if (!loginDto.otp) {
            const { sent, token, message } =
                await this.verificationService.sendOtp(
                    user.id,
                    OtpType.login,
                    loginDto.provider,
                );

            if (!sent) {
                throw new HttpException(message, HttpStatus.BAD_REQUEST);
            }

            let responseMessage: string;

            if (isProductionEnvironment) {
                responseMessage = `OTP has been sent to your ${provider}. Please re-login and submit the code to complete your login request`;
            } else {
                responseMessage = `Login request has been submitted. Please use code:${token} to complete your login request`;
            }
            throw new HttpException(responseMessage, HttpStatus.CREATED);
        }

        await this.otpService.verify(user.id, loginDto.otp, OtpType.login);
        await this.usersService.updateFields(user.id, {
            last_login: new Date(),
        });

        const [accessToken, refreshToken] = await Promise.all([
            this.generateNewToken(user.id, user.email, 'access'),
            this.generateNewToken(user.id, user.email, 'refresh'),
        ]);

        return { user, accessToken, refreshToken };
    }

    async profile(id: number): Promise<object> {
        const user = await this.usersService.findOne(id);
        return user;
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        try {
            const { sub } = this.jwtService.verify<JwtPayload>(
                refreshTokenDto.refreshToken,
                { secret: configuration().jwt.refresh.secret },
            );

            const user: User = await this.usersService.findOne(sub);
            await this.usersService.updateFields(user.id, {
                last_login: new Date(),
            });

            const [accessToken, refreshToken] = await Promise.all([
                this.generateNewToken(user.id, user.email, 'access'),
                this.generateNewToken(user.id, user.email, 'refresh'),
            ]);

            return { user, accessToken, refreshToken };
        } catch (e) {
            throw new UnauthorizedException('token expired');
        }
    }

    async isProviderVerified(id: number): Promise<boolean> {
        const user = await this.usersService.findOne(id);
        return user.provider === Provider.email
            ? user.email_verified
            : user.provider === Provider.phone
            ? user.phone_verified
            : false;
    }
}
