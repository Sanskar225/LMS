import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User';

const SEED_USERS = [
  { name: 'Super Admin',          email: 'admin@lms.com',    password: 'Admin@123',    role: 'admin'        as const },
  { name: 'Sales Executive',      email: 'sales@lms.com',    password: 'Sales@123',    role: 'sales'        as const },
  { name: 'Sanction Officer',     email: 'sanction@lms.com', password: 'Sanction@123', role: 'sanction'     as const },
  { name: 'Disbursement Officer', email: 'disburse@lms.com', password: 'Disburse@123', role: 'disbursement' as const },
  { name: 'Collection Agent',     email: 'collect@lms.com',  password: 'Collect@123',  role: 'collection'   as const },
  { name: 'Test Borrower',        email: 'borrower@lms.com', password: 'Borrower@123', role: 'borrower'     as const },
];

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_db';
  await mongoose.connect(uri);
  console.log('\n✅ Connected to MongoDB\n🌱 Seeding users...\n');

  for (const u of SEED_USERS) {
    const exists = await User.findOne({ email: u.email });
    if (exists) {
      console.log(`  ⚠  Already exists [${u.role.padEnd(12)}] ${u.email}`);
    } else {
      await User.create(u);
      console.log(`  ✅ Created       [${u.role.padEnd(12)}] ${u.email}`);
    }
  }

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    LOGIN CREDENTIALS                         ║
╠══════════════════════════════════════════════════════════════╣
║  Role          │ Email                  │ Password           ║
╠══════════════════════════════════════════════════════════════╣
║  admin         │ admin@lms.com          │ Admin@123          ║
║  sales         │ sales@lms.com          │ Sales@123          ║
║  sanction      │ sanction@lms.com       │ Sanction@123       ║
║  disbursement  │ disburse@lms.com       │ Disburse@123       ║
║  collection    │ collect@lms.com        │ Collect@123        ║
║  borrower      │ borrower@lms.com       │ Borrower@123       ║
╚══════════════════════════════════════════════════════════════╝
`);

  await mongoose.disconnect();
  console.log('✅ Seed complete!');
}

seed().catch((err) => { console.error('Seed error:', err); process.exit(1); });
