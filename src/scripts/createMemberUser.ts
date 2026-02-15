// scripts/createMemberUser.ts
// Run this script to create member users: npx ts-node scripts/createMemberUser.ts

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Decimal } from '@prisma/client/runtime/client';

async function createMemberUser(
  email: string,
  password: string,
  memberComputerId: string,
  name?: string
) {
  try {
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if member exists
    const member = await prisma.member_Information.findUnique({
      where: { MemComputerID: new Decimal(memberComputerId) },
    });

    if (!member) {
      throw new Error(`Member with ID ${memberComputerId} not found`);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new Error(`User with email ${email} already exists`);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || member.MemName || 'Member',
        role: 'MEMBER',
      },
    });

    // Link email to member
    const existingEmail = await prisma.member_Emailid.findFirst({
      where: { MEM_MemComputerID: new Decimal(memberComputerId) },
    });

    if (!existingEmail) {
      await prisma.member_Emailid.create({
        data: {
          MEM_MemComputerID: new Decimal(memberComputerId),
          MEM_MemWehvariaNo: member.MemWehvariaNo || new Decimal(0),
          MEM_Emailid: email,
        },
      });
    }

    console.log('✓ Member user created successfully!');
    console.log(`Email: ${email}`);
    console.log(`Member ID: ${memberComputerId}`);
    console.log(`Name: ${user.name}`);

    return user;
  } catch (error) {
    console.error('Error creating member user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Example usage:
// Uncomment and modify these lines to create users
/*
createMemberUser(
  'member@example.com',
  'password123',
  '12345', // MemComputerID
  'John Doe'
);
*/

// For bulk creation from existing members:
async function createUsersForAllMembers() {
  try {
    const members = await prisma.member_Information.findMany({
      where: {
        Mem_DeActive: false,
        emails: {
          some: {
            MEM_Emailid: {
              not: null,
            },
          },
        },
      },
      include: {
        emails: true,
      },
    });

    console.log(`Found ${members.length} members with emails`);

    for (const member of members) {
      const email = member.emails[0]?.MEM_Emailid?.trim();
      if (!email) continue;

      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          console.log(`Skipping ${email} - already exists`);
          continue;
        }

        // Default password: membership number or 'changeme123'
        const defaultPassword = member.MemMembershipNo?.trim() || 'changeme123';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            name: member.MemName || 'Member',
            role: 'MEMBER',
          },
        });

        console.log(`✓ Created user for ${member.MemName} (${email})`);
      } catch (error) {
        console.error(`Error creating user for ${member.MemName}:`, error);
      }
    }

    console.log('Bulk user creation completed!');
  } catch (error) {
    console.error('Error in bulk creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export functions
export { createMemberUser, createUsersForAllMembers };

// Run if called directly
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args[0] === 'bulk') {
    createUsersForAllMembers();
  } else if (args.length >= 3) {
    const [email, password, memberId, name] = args;
    createMemberUser(email, password, memberId, name);
  } else {
    console.log('Usage:');
    console.log('  Single user: npx ts-node scripts/createMemberUser.ts <email> <password> <memberComputerId> [name]');
    console.log('  Bulk create: npx ts-node scripts/createMemberUser.ts bulk');
  }
}