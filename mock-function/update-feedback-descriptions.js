// Script to update ConferenceFeedbacks descriptions to be more meaningful based on the star rating
// Usage: node update-feedback-descriptions.js


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const feedbackPool = {
  1: [
    'Very disappointed. The conference did not meet my expectations.',
    'Poor organization and lack of useful content.',
    'I would not recommend this conference to others.',
    'The sessions were not relevant and the speakers were unprepared.',
    'A waste of time, unfortunately.'
  ],
  2: [
    'Some sessions were helpful, but overall it needs improvement.',
    'There were several issues with the schedule and logistics.',
    'Not the best experience, but I learned a little.',
    'The content was lacking depth and variety.',
    'Could have been better organized.'
  ],
  3: [
    'An average conference, nothing special.',
    'It was okay, some good talks and some not so good.',
    'Decent experience, but room for improvement.',
    'Met my expectations, but did not exceed them.',
    'A typical conference experience.'
  ],
  4: [
    'Good conference with useful sessions and networking.',
    'I enjoyed most of the talks and met interesting people.',
    'Well organized and informative.',
    'Valuable experience, would attend again.',
    'Most sessions were engaging and helpful.'
  ],
  5: [
    'Excellent conference! Highly recommended.',
    'Outstanding speakers and great organization.',
    'One of the best conferences I have attended.',
    'Amazing experience, learned a lot and made great connections.',
    'Everything was perfect, from start to finish.'
  ]
};

function getRandomFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function generateUserComment(star) {
  const pool = feedbackPool[star];
  if (pool && pool.length > 0) {
    return getRandomFromPool(pool);
  }
  return 'No feedback provided.';
}

async function updateFeedbackDescriptions() {
  const feedbacks = await prisma.conferenceFeedbacks.findMany();
  let updated = 0;
  for (const feedback of feedbacks) {
    const newDescription = generateUserComment(feedback.star);
    if (feedback.description !== newDescription) {
      await prisma.conferenceFeedbacks.update({
        where: { id: feedback.id },
        data: { description: newDescription }
      });
      updated++;
    }
  }
  console.log(`Updated ${updated} feedback descriptions with realistic user comments.`);
  await prisma.$disconnect();
}

updateFeedbackDescriptions().catch(e => {
  console.error('Error updating feedback descriptions:', e.message);
  prisma.$disconnect();
});
