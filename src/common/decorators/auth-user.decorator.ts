import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User, PrismaClient } from '@prisma/client';

export const AuthUser = createParamDecorator(
    async (data, ctx: ExecutionContext): Promise<User> => {
        const request = ctx.switchToHttp().getRequest();
        const { sub, ..._ }: { sub: number; _: any } = request.user;
        const prisma = new PrismaClient();
        const user = await prisma.user.findUnique({
            where: {
                id: sub,
            },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                gender: true,
                address: true,
                email_verified: true,
                phone_verified: true,
                created_at: true,
                updated_at: true,
                provider: true,
                referral_code: true,
                last_login: true,
                max_pickup_distance: true,
                paystack_recipient_code: true,
                account_balance: true,
                credibility_score: true,
                state_id: true,
                is_active: true,
                location: true,
                location_id: true,
                vehicle_type: true,
                vehicle_type_id: true,
                state: {
                    select: {
                        name: true,
                    },
                },
                picture: true,
                roles: {
                    select: {
                        role: true,
                    },
                },
            },
        });

        await prisma.$disconnect();

        return user;
    },
);
