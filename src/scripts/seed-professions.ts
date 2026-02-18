import { connectMongoDB, disconnectMongoDB } from '../database/mongodb';
import { Profession } from '../models/profession.model';

const professions = [
  {
    name: 'Plumber',
    description: 'Professional plumbing services including repairs, installations, and maintenance',
    active: true,
  },
  {
    name: 'Electrician',
    description: 'Electrical services including wiring, repairs, and installations',
    active: true,
  },
  {
    name: 'Cleaner',
    description: 'Cleaning services for homes and offices',
    active: true,
  },
  {
    name: 'Carpenter',
    description: 'Carpentry services including furniture making and repairs',
    active: true,
  },
  {
    name: 'Painter',
    description: 'Painting services for interior and exterior walls',
    active: true,
  },
];

async function seedProfessions() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();
    console.log('Connected to MongoDB');

    console.log('Seeding professions...');
    
    for (const professionData of professions) {
      const existingProfession = await Profession.findOne({ name: professionData.name });
      
      if (existingProfession) {
        console.log(`Profession "${professionData.name}" already exists, skipping...`);
      } else {
        const profession = new Profession(professionData);
        await profession.save();
        console.log(`✓ Created profession: ${professionData.name}`);
      }
    }

    console.log('\nProfession seeding completed successfully!');
    
    const allProfessions = await Profession.find({ active: true });
    console.log(`Total active professions: ${allProfessions.length}`);
    
  } catch (error) {
    console.error('Error seeding professions:', error);
    process.exit(1);
  } finally {
    await disconnectMongoDB();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seedProfessions();
