// Shared Prisma client. Import this instead of creating new clients.
// Uses the transaction-mode pooler (DATABASE_URL) through the pg driver adapter.
require('dotenv').config({ quiet: true });

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

module.exports = prisma;
