// prisma.js
import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();
const prisma = new PrismaClient({
    log: ['error'],
    // log: ['query', 'info', 'warn', 'error'],
})

  export default prisma;
