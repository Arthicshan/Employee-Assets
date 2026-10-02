import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('AssetFlow@2026Secure!', 10);
  await prisma.user.updateMany({
    data: { passwordHash: hash },
  });
  console.log('Successfully updated all users to AssetFlow@2026Secure!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
