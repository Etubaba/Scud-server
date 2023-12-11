import * as _ from 'lodash';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const role = await prisma.role.findFirst({
        where: {
            name: 'rider',
        },
    });
    await _.times(1, async () => {
        const phone = faker.phone.number('+234##########');
        console.log(phone);

        await prisma.user.create({
            data: {
                phone,
                email: faker.internet.email(),
                max_pickup_distance: faker.datatype.number({ max: 6, min: 2 }),
                email_verified: true,
                phone_verified: true,
                first_name: faker.name.firstName(),
                last_name: faker.name.lastName(),
                credibility_score: faker.datatype.number({ max: 100, min: 60 }),
                roles: {
                    createMany: {
                        data: {
                            role_id: role.id,
                        },
                    },
                },
            },
        });
    });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
