import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await prisma.user.upsert({
        where: {
            email: faker.internet.email(),
        },
        update: {},
        create: {
            first_name: faker.name.firstName(),
            last_name: faker.name.firstName(),
            email: faker.internet.email(),
            phone: faker.phone.number(),
        },
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
