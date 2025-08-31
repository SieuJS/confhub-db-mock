// Script to update ConferenceFeedbacks descriptions to be more meaningful based on the star rating
// Usage: node update-feedback-descriptions.js


import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// --- PHRASE LIBRARY ---
const PHRASES = {
  positive: {
    papers: [
      "The technical program was exceptionally strong.", "Groundbreaking research was presented throughout.",
      "The quality of accepted papers was consistently high.", "I found the sessions incredibly insightful.",
      "A fantastic lineup of papers, especially in my sub-field."
    ],
    keynotes: [
      "The keynote speakers were world-class and truly inspiring.", "A thought-provoking and memorable keynote lineup.",
      "The opening keynote set a fantastic tone for the entire event.", "The industry keynote provided a much-needed real-world perspective."
    ],
    networking: [
      "Exceptional networking opportunities with leading researchers.", "The social events were vibrant and well-attended.",
      "I made several valuable connections for future collaborations.", "The poster sessions were buzzing with energy and great discussions.",
      "The conference app made it easy to connect with other attendees."
    ],
    organization: [
      "Impeccably organized from start to finish.", "The organizing committee did a phenomenal job.",
      "A beautiful and well-equipped venue.", "Registration was a breeze and the staff were very helpful.",
      "Seamless transitions between sessions and clear communication."
    ],
    location: [
      "The host city was a wonderful choice, with plenty to see and do.", "Great location with easy access to transport and restaurants.",
      "A very scenic and enjoyable location for a conference."
    ]
  },
  negative: {
    papers: [
      "The technical depth of the papers was disappointing this year.", "Felt like many presentations were incremental at best.",
      "The program was too broad, lacking focus.", "Too many parallel tracks made it impossible to see everything of interest.",
      "Some presentations were rushed and poorly prepared."
    ],
    cost: [
      "The registration fee was unjustifiably high for the value provided.", "Poor value for money, considering the additional costs.",
      "The official conference hotel was extremely overpriced.", "The cost is becoming a significant barrier for students and academics from smaller institutions."
    ],
    organization: [
      "The organization felt chaotic and last-minute.", "Poor communication from the organizers before and during the event.",
      "The venue was too small for the number of attendees, leading to overcrowding.", "The Wi-Fi was unreliable, which is unacceptable for a tech conference.",
      "The catering was subpar and options were very limited."
    ],
    networking: [
      "Networking felt cliquey and difficult for newcomers.", "The social events were poorly planned and sparsely attended.",
      "The poster session was disorganized and cramped.", "Very few structured opportunities to connect with senior figures in the field."
    ],
    location: [
      "The location was inconvenient and difficult to get to.", "A boring host city with very few amenities nearby.",
      "The weather at the location was a major downside."
    ]
  },
  neutral: {
    observation: [
      "The conference seemed smaller than in previous years.", "There was a noticeable shift in focus towards industry applications.",
      "The hybrid format had both pros and cons.", "This year's theme was very specific.",
      "The attendance was predominantly from academia."
    ],
    conditional: [
      "It was a good conference, although...", "While I enjoyed the keynotes, ...",
      "Overall a positive experience, but...", "The research was strong; however, ..."
    ]
  }
};

// --- PERSONAS ---
const PERSONAS = {
  phd_student: {
    pos_focus: ["networking", "papers"],
    neg_focus: ["cost", "networking"],
    neu_focus: ["observation"]
  },
  early_career_researcher: {
    pos_focus: ["papers", "networking"],
    neg_focus: ["organization", "cost"],
    neu_focus: ["observation"]
  },
  senior_professor: {
    pos_focus: ["papers", "keynotes"],
    neg_focus: ["papers", "organization"],
    neu_focus: ["observation"]
  },
  industry_expert: {
    pos_focus: ["networking", "keynotes"],
    neg_focus: ["organization", "papers"],
    neu_focus: ["observation"]
  },
  sponsor_exhibitor: {
    pos_focus: ["networking", "organization"],
    neg_focus: ["organization", "location"],
    neu_focus: ["observation"]
  }
};

function getRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomPersona() {
  const keys = Object.keys(PERSONAS);
  return keys[Math.floor(Math.random() * keys.length)];
}

function generateDiverseReview(rating, personaKey) {
  const persona = PERSONAS[personaKey];
  let reviewParts = [];
  if (rating === 5) {
    const numParts = Math.floor(Math.random() * 3) + 2; // 2-4
    let aspects = getRandomAspects(Object.keys(PHRASES.positive), numParts);
    if (!aspects.some(a => persona.pos_focus.includes(a))) {
      aspects[0] = getRandom(persona.pos_focus);
    }
    for (const aspect of aspects) {
      reviewParts.push(getRandom(PHRASES.positive[aspect]));
    }
  } else if (rating === 4) {
    const structureChoice = getRandom(['simple_positive', 'positive_with_gripe']);
    if (structureChoice === 'simple_positive') {
      const numParts = Math.floor(Math.random() * 2) + 1; // 1-2
      let aspects = getRandomAspects(Object.keys(PHRASES.positive), numParts);
      for (const aspect of aspects) {
        reviewParts.push(getRandom(PHRASES.positive[aspect]));
      }
    } else {
      reviewParts.push(getRandom(PHRASES.neutral.conditional));
      let posAspects = getRandomAspects(Object.keys(PHRASES.positive), 2);
      reviewParts.push(getRandom(PHRASES.positive[posAspects[0]]));
      reviewParts.push(getRandom(PHRASES.positive[posAspects[1]]));
      let negAspect = getRandom(persona.neg_focus);
      reviewParts.push(getRandom(PHRASES.negative[negAspect]));
      shuffle(reviewParts, 1); // shuffle after the first
    }
  } else if (rating === 3) {
    const structureChoice = getRandom(['pro_con', 'observation']);
    if (structureChoice === 'pro_con') {
      let posAspect = getRandom(persona.pos_focus);
      let negAspect = getRandom(persona.neg_focus);
      reviewParts.push(getRandom(PHRASES.positive[posAspect]));
      reviewParts.push(getRandom(PHRASES.negative[negAspect]));
      shuffle(reviewParts);
    } else {
      const numParts = Math.floor(Math.random() * 2) + 1; // 1-2
      let aspects = getRandomAspects(PHRASES.neutral.observation, numParts);
      reviewParts = reviewParts.concat(aspects);
    }
  } else if (rating === 2) {
    const structureChoice = getRandom(['simple_negative', 'negative_with_positive']);
    if (structureChoice === 'simple_negative') {
      const numParts = Math.floor(Math.random() * 2) + 1; // 1-2
      let aspects = getRandomAspects(Object.keys(PHRASES.negative), numParts);
      for (const aspect of aspects) {
        reviewParts.push(getRandom(PHRASES.negative[aspect]));
      }
    } else {
      reviewParts.push(getRandom(PHRASES.neutral.conditional));
      let negAspects = getRandomAspects(Object.keys(PHRASES.negative), 2);
      reviewParts.push(getRandom(PHRASES.negative[negAspects[0]]));
      reviewParts.push(getRandom(PHRASES.negative[negAspects[1]]));
      let posAspect = getRandom(persona.pos_focus);
      reviewParts.push(getRandom(PHRASES.positive[posAspect]));
      shuffle(reviewParts, 1);
    }
  } else if (rating === 1) {
    const numParts = Math.floor(Math.random() * 3) + 2; // 2-4
    let aspects = getRandomAspects(Object.keys(PHRASES.negative), numParts);
    if (!aspects.some(a => persona.neg_focus.includes(a))) {
      aspects[0] = getRandom(persona.neg_focus);
    }
    for (const aspect of aspects) {
      reviewParts.push(getRandom(PHRASES.negative[aspect]));
    }
  }
  return reviewParts.join(' ').replace(/\.\.\./g, '.').replace(/\.\./g, '.');
}

function getRandomAspects(aspects, n) {
  const shuffled = aspects.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, n);
}

function shuffle(arr, start = 0) {
  for (let i = arr.length - 1; i > start; i--) {
    const j = Math.floor(Math.random() * (i - start + 1)) + start;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

async function updateFeedbackDescriptions() {
  const feedbacks = await prisma.conferenceFeedbacks.findMany();
  let updated = 0;
  for (const feedback of feedbacks) {
    const personaKey = getRandomPersona();
    const newDescription = generateDiverseReview(feedback.star, personaKey);
    if (feedback.description !== newDescription) {
      await prisma.conferenceFeedbacks.update({
        where: { id: feedback.id },
        data: { description: newDescription }
      });
      updated++;
    }
  }
  console.log(`Updated ${updated} feedback descriptions with diverse, persona-based reviews.`);
  await prisma.$disconnect();
}

updateFeedbackDescriptions().catch(e => {
  console.error('Error updating feedback descriptions:', e.message);
  prisma.$disconnect();
});
