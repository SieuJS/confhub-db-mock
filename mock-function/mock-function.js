

import { faker } from '@faker-js/faker';

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { create } from 'domain';

const prisma = new PrismaClient();

// Hash a password using sha256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}


// Generate a single mock user object for Prisma
function generateMockUser() {
    const password = '123456789';
    return {
        id : faker.string.uuid(),
        email: faker.internet.email(),
        password: hashPassword(password),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        trustCredit: faker.number.int({ min: 0, max: 100 }),
        dob: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
        avatar: faker.image.avatar(),
        aboutMe: faker.lorem.sentence(),
        background: faker.lorem.paragraph(),
        isBanned: false,
        updatedAt: new Date(),
        createdAt: new Date(),
        // createdAt and updatedAt will be set by Prisma defaults
    };
}

// Mock function to create multiple users
async function createMockUsers(count = 1000) {
    const users = Array.from({ length: count }, generateMockUser);
    for (const user of users) {
        await prisma.users.create({ data: user });
    }
    console.log(`${count} mock users created`);
}

async function main() {
    await createMockUsers();
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

