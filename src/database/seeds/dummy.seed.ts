import * as _ from 'lodash';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    await _.times(500, async () => {
        await prisma.faq.create({
            data: {
                answer: faker.lorem.paragraph(),
                question: faker.lorem.sentences(),
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
