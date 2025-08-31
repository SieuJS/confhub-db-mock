// Update isVerified to true for all users in UserVerification
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import { faker } from '@faker-js/faker';

export async function verifyAllUsers() {
	const users = await prisma.users.findMany({ select: { id: true } });
	let updated = 0, created = 0;
	for (const user of users) {
		const verification = await prisma.userVerification.findFirst({ where: { userId: user.id } });
		if (verification) {
			if (!verification.isVerified) {
				await prisma.userVerification.update({ where: { id: verification.id }, data: { isVerified: true } });
				updated++;
			}
		} else {
			await prisma.userVerification.create({
				data: {
					userId: user.id,
					verificationCode: '',
					verificationCodeExpires: new Date(Date.now() + 1000 * 60 * 60 * 24), // 1 day from now
					isValid: true,
					isVerified: true,
                    id : faker.string.uuid(),
                    updatedAt: faker.date.recent({ days: 30 }),
                    createdAt: faker.date.past({ years: 1 }),
				}
			});
			created++;
		}
	}
	console.log(`Updated ${updated} verifications, created ${created} verifications.`);
	await prisma.$disconnect();
}

verifyAllUsers().catch(e => {
	console.error(e);
	process.exit(1);
});
