import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const url1 = await prisma.url.create({
    data: {
      url: 'https://example1.com',
      status: 'DONE',
      htmlVersion: 'HTML5',
      title: 'Example Domain1',
      h1Count: 1,
      h2Count: 4,
      h3Count: 5,
      h4Count: 6,
      h5Count: 1,
      h6Count: 0,
      internalLinks: 3,
      externalLinks: 7,
      brokenLinksCount: 0,
      hasLoginForm: false,
    },
  });

  const url2 = await prisma.url.create({
    data: {
      url: 'https://example2.com',
      status: 'DONE',
      htmlVersion: 'HTML5',
      title: 'Example Domain2',
      h1Count: 1,
      h2Count: 2,
      h3Count: 6,
      h4Count: 1,
      h5Count: 4,
      h6Count: 3,
      internalLinks: 2,
      externalLinks: 10,
      brokenLinksCount: 0,
      hasLoginForm: false,
    },
  });

  const url3 = await prisma.url.create({
    data: {
      url: 'https://www.wikipedia.org',
      status: 'QUEUED',
    },
  });

  const url4 = await prisma.url.create({
    data: {
      url: 'https://www.mozilla.org',
      status: 'QUEUED',
    },
  });

  console.log('Database seed complete. Added: ', { url1, url2, url3, url4 });
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
