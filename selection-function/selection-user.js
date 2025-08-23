import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main () {
    const user = await prisma.users.findMany({});
    console.log(user)
}

main();