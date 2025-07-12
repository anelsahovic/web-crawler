import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getUrls() {
  return await prisma.url.findMany();
}
