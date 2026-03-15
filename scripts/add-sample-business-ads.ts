import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleBusinessAd() {
  try {
    // Get the first member from the database
    const member = await prisma.member_Information.findFirst({
      take: 1
    });

    if (!member) {
      console.log('No members found in database');
      return;
    }

    console.log('Found member:', member.MemName, 'ID:', member.MemComputerID);

    // Check if there's already a business ad request for this member
    const existing = await prisma.business_Ad_Request.findFirst({
      where: { memberId: member.MemComputerID }
    });

    if (existing) {
      console.log('Business ad request already exists for this member');
      return;
    }

    // Create a sample business ad request
    const request = await prisma.business_Ad_Request.create({
      data: {
        memberId: member.MemComputerID,
        businessName: 'Sample Business',
        category: 'Retail',
        phone: '123-456-7890',
        email: 'business@example.com',
        website: 'https://example.com',
        address: '123 Main St, City, State',
        established: '2020',
        owner: member.MemName || 'Owner Name',
        specialOffers: '10% discount for members',
        services: JSON.stringify(['Consulting', 'Sales']),
        description: 'A sample business description',
        detailedDescription: 'Detailed description of the business services and offerings.',
        logo: "/logo-placeholder.png",
        requestedStartDate: new Date('2024-01-01'),
        requestedEndDate: new Date('2024-12-31'),
        status: 'pending'
      }
    });

    console.log('Created sample business ad request with ID:', request.id);

    // Also create an approved one for testing
    const approvedRequest = await prisma.business_Ad_Request.create({
      data: {
        memberId: member.MemComputerID,
        businessName: 'Approved Sample Business',
        category: 'Services',
        phone: '987-654-3210',
        email: 'approved@example.com',
        website: 'https://approved-example.com',
        address: '456 Business Ave, City, State',
        established: '2019',
        owner: member.MemName || 'Owner Name',
        specialOffers: 'Free consultation',
        services: JSON.stringify(['Consulting', 'Support']),
        description: 'An approved sample business',
        detailedDescription: 'This is an approved business ad request for testing purposes.',
        logo: null,
        requestedStartDate: new Date('2024-01-01'),
        requestedEndDate: new Date('2024-12-31'),
        status: 'approved'
      }
    });

    console.log('Created approved business ad request with ID:', approvedRequest.id);

    // Create approval record for the approved request
    await prisma.business_Ad_Approval.create({
      data: {
        requestId: approvedRequest.id,
        approvedBy: 'Admin',
        approvedStartDate: new Date('2024-01-15'),
        approvedEndDate: new Date('2024-06-15'),
        adminNotes: 'Approved for testing'
      }
    });

    console.log('Created approval record');

  } catch (error) {
    console.error('Error adding sample business ad:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleBusinessAd();