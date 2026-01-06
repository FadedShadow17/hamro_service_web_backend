import mongoose from 'mongoose';
import { connectMongoDB } from '../infrastructure/db/mongodb';
import { env } from '../config/env';
import { ServiceCategory } from '../infrastructure/db/mongoose/models/service-category.model';
import { Service } from '../infrastructure/db/mongoose/models/service.model';
import { User } from '../infrastructure/db/mongoose/models/user.model';
import { ProviderProfile } from '../infrastructure/db/mongoose/models/provider-profile.model';
import { ProviderService } from '../infrastructure/db/mongoose/models/provider-service.model';
import { Availability } from '../infrastructure/db/mongoose/models/availability.model';
import { hashPassword } from '../infrastructure/auth/password';
import { USER_ROLES, CITY } from '../shared/constants';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await connectMongoDB();

    console.log('Clearing existing data...');
    await ServiceCategory.deleteMany({});
    await Service.deleteMany({});
    await ProviderService.deleteMany({});
    await Availability.deleteMany({});
    await ProviderProfile.deleteMany({});
    // Don't delete users to preserve existing accounts

    console.log('Seeding Service Categories...');
    const plumbingCategory = await ServiceCategory.create({
      name: 'Plumbing',
      description: 'Professional plumbing services for your home',
      icon: '🔧',
      active: true,
    });

    const electricalCategory = await ServiceCategory.create({
      name: 'Electrical',
      description: 'Expert electrical services and repairs',
      icon: '⚡',
      active: true,
    });

    const cleaningCategory = await ServiceCategory.create({
      name: 'Cleaning',
      description: 'Thorough cleaning services for your space',
      icon: '🧹',
      active: true,
    });

    const carpentryCategory = await ServiceCategory.create({
      name: 'Carpentry',
      description: 'Skilled carpentry and woodworking services',
      icon: '🪚',
      active: true,
    });

    console.log('Seeding Services...');
    const services = await Service.insertMany([
      {
        categoryId: plumbingCategory._id,
        name: 'Pipe Repair',
        description: 'Fix leaking pipes and plumbing issues',
        image: '/images/services/pipe-repair.jpg',
        active: true,
      },
      {
        categoryId: plumbingCategory._id,
        name: 'Drain Cleaning',
        description: 'Unclog and clean blocked drains',
        image: '/images/services/drain-cleaning.jpg',
        active: true,
      },
      {
        categoryId: electricalCategory._id,
        name: 'Wiring Installation',
        description: 'Professional electrical wiring installation',
        image: '/images/services/wiring.jpg',
        active: true,
      },
      {
        categoryId: electricalCategory._id,
        name: 'Outlet Repair',
        description: 'Fix and replace electrical outlets',
        image: '/images/services/outlet-repair.jpg',
        active: true,
      },
      {
        categoryId: cleaningCategory._id,
        name: 'House Cleaning',
        description: 'Complete house cleaning service',
        image: '/images/services/house-cleaning.jpg',
        active: true,
      },
      {
        categoryId: cleaningCategory._id,
        name: 'Office Cleaning',
        description: 'Professional office cleaning service',
        image: '/images/services/office-cleaning.jpg',
        active: true,
      },
      {
        categoryId: carpentryCategory._id,
        name: 'Furniture Repair',
        description: 'Repair and restore furniture',
        image: '/images/services/furniture-repair.jpg',
        active: true,
      },
      {
        categoryId: carpentryCategory._id,
        name: 'Cabinet Installation',
        description: 'Install custom cabinets and shelves',
        image: '/images/services/cabinet-installation.jpg',
        active: true,
      },
    ]);

    console.log('Creating Provider User...');
    const providerPassword = await hashPassword('provider123');
    const providerUser = await User.create({
      name: 'John Provider',
      email: 'provider@example.com',
      passwordHash: providerPassword,
      role: USER_ROLES.PROVIDER,
    });

    console.log('Creating Provider Profile...');
    const providerProfile = await ProviderProfile.create({
      userId: providerUser._id,
      city: CITY,
      area: 'Thamel',
      phone: '+977-9841234567',
      bio: 'Experienced service provider with 10+ years in the industry. Specializing in plumbing and electrical services.',
      active: true,
    });

    console.log('Creating Provider Services...');
    await ProviderService.insertMany([
      {
        providerId: providerProfile._id,
        serviceId: services[0]._id, // Pipe Repair
        price: 1500,
        active: true,
      },
      {
        providerId: providerProfile._id,
        serviceId: services[1]._id, // Drain Cleaning
        price: 1200,
        active: true,
      },
      {
        providerId: providerProfile._id,
        serviceId: services[2]._id, // Wiring Installation
        price: 3000,
        active: true,
      },
      {
        providerId: providerProfile._id,
        serviceId: services[3]._id, // Outlet Repair
        price: 800,
        active: true,
      },
    ]);

    console.log('Creating Provider Availability...');
    // Monday to Friday: 9 AM to 5 PM
    for (let day = 1; day <= 5; day++) {
      await Availability.create({
        providerId: providerProfile._id,
        dayOfWeek: day,
        timeSlots: [
          { start: '09:00', end: '12:00' },
          { start: '13:00', end: '17:00' },
        ],
      });
    }

    // Saturday: 9 AM to 1 PM
    await Availability.create({
      providerId: providerProfile._id,
      dayOfWeek: 6,
      timeSlots: [
        { start: '09:00', end: '13:00' },
      ],
    });

    console.log('✅ Seed data created successfully!');
    console.log('\nProvider Account:');
    console.log('Email: provider@example.com');
    console.log('Password: provider123');
    console.log('\nYou can now create a user account through the registration endpoint.');
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

seed();

