import mongoose from 'mongoose';
import { connectMongoDB, disconnectMongoDB } from '../infrastructure/db/mongodb';
import { env } from '../config/env';
import { Service } from '../infrastructure/db/mongoose/models/service.model';

const services = [
  {
    name: 'Plumbing',
    slug: 'plumbing',
    description: 'Expert plumbers for repairs, installations, and maintenance',
    basePrice: 600,
    icon: 'plumbing',
    isActive: true,
  },
  {
    name: 'Electrical',
    slug: 'electrical',
    description: 'Licensed electricians for all your electrical needs',
    basePrice: 500,
    icon: 'electrical',
    isActive: true,
  },
  {
    name: 'Cleaning',
    slug: 'cleaning',
    description: 'Professional cleaning services for your home',
    basePrice: 1500,
    icon: 'cleaning',
    isActive: true,
  },
  {
    name: 'Carpentry',
    slug: 'carpentry',
    description: 'Skilled carpenters for custom furniture and repairs',
    basePrice: 800,
    icon: 'carpentry',
    isActive: true,
  },
  {
    name: 'Painting',
    slug: 'painting',
    description: 'Interior and exterior painting services',
    basePrice: 2000,
    icon: 'painting',
    isActive: true,
  },
  {
    name: 'HVAC',
    slug: 'hvac',
    description: 'Heating, ventilation, and air conditioning services',
    basePrice: 2500,
    icon: 'hvac',
    isActive: true,
  },
  {
    name: 'Appliance Repair',
    slug: 'appliance-repair',
    description: 'Expert repair for all home appliances',
    basePrice: 700,
    icon: 'appliance',
    isActive: true,
  },
  {
    name: 'Gardening & Landscaping',
    slug: 'gardening-landscaping',
    description: 'Transform your outdoor space',
    basePrice: 1200,
    icon: 'gardening',
    isActive: true,
  },
  {
    name: 'Pest Control',
    slug: 'pest-control',
    description: 'Safe and effective pest control solutions',
    basePrice: 1800,
    icon: 'pest',
    isActive: true,
  },
  {
    name: 'Water Tank Cleaning',
    slug: 'water-tank-cleaning',
    description: 'Complete underground and rooftop tank cleaning',
    basePrice: 1600,
    icon: 'water',
    isActive: true,
  },
];

async function seedServices() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();

    console.log('Seeding services...');
    let successCount = 0;
    let updateCount = 0;

    for (const serviceData of services) {
      const result = await Service.findOneAndUpdate(
        { slug: serviceData.slug },
        {
          $set: {
            name: serviceData.name,
            description: serviceData.description,
            icon: serviceData.icon,
            basePrice: serviceData.basePrice,
            isActive: serviceData.isActive,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );

      if (result.isNew) {
        successCount++;
        console.log(`✓ Created: ${serviceData.name} (${serviceData.slug})`);
      } else {
        updateCount++;
        console.log(`↻ Updated: ${serviceData.name} (${serviceData.slug})`);
      }
    }

    console.log('\n✅ Seeding completed!');
    console.log(`   Created: ${successCount} services`);
    console.log(`   Updated: ${updateCount} services`);
    console.log(`   Total: ${services.length} services`);

    // Verify all services are in database
    const totalServices = await Service.countDocuments({ isActive: true });
    console.log(`\n📊 Active services in database: ${totalServices}`);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    process.exit(1);
  } finally {
    await disconnectMongoDB();
    process.exit(0);
  }
}

// Run the seed function
seedServices();

