import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parse } from 'json2csv';

const prisma = new PrismaClient();

async function exportUsersToCSV() {
  const allUsers = await prisma.users.findMany();
  const fields = [
    'id', 'email', 'password', 'firstName', 'lastName', 'dob', 'avatar', 'aboutMe', 'background', 'isBanned', 'createdAt', 'updatedAt', 'trustCredit'
  ];
  const opts = { fields };
  const csv = parse(allUsers, opts);
  fs.writeFileSync('users_export.csv', csv);
  console.log('Exported all users to users_export.csv');
  await prisma.$disconnect();
}

exportUsersToCSV();
