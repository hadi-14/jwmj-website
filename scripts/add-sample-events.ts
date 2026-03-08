import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleEvents() {
  try {
    // Check if Eid Milan event already exists
    const existing = await prisma.event.findFirst({
      where: { title: 'Eid Milan 2026' }
    });

    if (!existing) {
      await prisma.event.create({
        data: {
          title: 'Eid Milan 2026',
          desc: 'Join us for the annual Eid Milan celebration. A time for community gathering, prayers, and festivities marking the end of Ramadan.',
          date: new Date('2026-04-01'), // Approximate date for Eid 2026
          category: 'Religious',
          img: '/Events/eid-milan.jpg', // Assuming image exists
          fb: 'https://facebook.com/events/eid-milan-2026'
        }
      });
      console.log('Added Eid Milan 2026 event');
    } else {
      console.log('Eid Milan event already exists');
    }

    // Add another sample event
    const existing2 = await prisma.event.findFirst({
      where: { title: 'Community Iftar' }
    });

    if (!existing2) {
      await prisma.event.create({
        data: {
          title: 'Community Iftar',
          desc: 'Monthly community iftar gathering for members to break fast together and strengthen community bonds.',
          date: new Date('2026-03-15'),
          category: 'Community',
          img: '/Events/iftar.jpg',
          fb: null
        }
      });
      console.log('Added Community Iftar event');
    }

  } catch (error) {
    console.error('Error adding events:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleEvents();