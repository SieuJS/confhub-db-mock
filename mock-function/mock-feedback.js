// Generate mock ConferenceFeedbacks data: each user creates 10 feedbacks for random conferences
import { faker } from '@faker-js/faker';

// Use Prisma client to fetch users and conferences
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getUserAndConferenceIds() {
	const users = await prisma.users.findMany({ select: { id: true } });
	const conferences = await prisma.conferences.findMany({ select: { id: true } });
	return {
		userIds: users.map(u => u.id),
		conferenceIds: conferences.map(c => c.id)
	};
}

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
	return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}


async function generateMockFeedbacks() {
	const { userIds, conferenceIds } = await getUserAndConferenceIds();
	const feedbacks = [];
	userIds.forEach(userId => {
		for (let i = 0; i < 10; i++) {
			const conferenceId = conferenceIds[randomInt(0, conferenceIds.length - 1)];
			feedbacks.push({
				id: faker.string.uuid(),
				conferenceId,
				creatorId: userId,
				description: `Feedback from user ${userId} #${i + 1}`,
				star: randomInt(1, 5),
				createdAt : faker.date.past({ years: 1 }),
				updatedAt : faker.date.recent({ days: 30 })
			});
		}
	});
	return feedbacks;
}

// Example usage: write to file
// Insert generated feedbacks into the database
generateMockFeedbacks().then(async mockFeedbacks => {
	let created = 0;
	for (const feedback of mockFeedbacks) {
		try {
			await prisma.conferenceFeedbacks.create({ data: feedback });
			created++;
		} catch (e) {
			console.error('Error creating feedback:', e.message);
		}
	}
	console.log(`Inserted ${created} mock feedbacks into the database.`);
	await prisma.$disconnect();
});
