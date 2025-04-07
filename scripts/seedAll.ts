import { execSync } from 'child_process';
import * as path from 'path';

console.log('🌱 Starting complete database seeding process...');

try {
  // Run each seed script in sequence
  console.log('\n📊 Step 1/3: Seeding admin user and academic services...');
  execSync('npx ts-node ./scripts/seedDatabase.ts', { stdio: 'inherit' });
  
  console.log('\n👥 Step 2/3: Seeding experts and clients...');
  execSync('npx ts-node ./scripts/seedExpertsClients.ts', { stdio: 'inherit' });
  
  console.log('\n📝 Step 3/3: Seeding service requests and assignments...');
  execSync('npx ts-node ./scripts/seedServiceRequests.ts', { stdio: 'inherit' });
  
  console.log('\n✅ All seeding operations completed successfully!');
  console.log('\n📱 Your database is now populated with sample data and ready for testing the app.');
  console.log('\n📝 Available accounts:');
  console.log('   🔑 Admin: academiclessons.info@gmail.com / Admin@1234');
  console.log('   🔑 Expert: john.expert@example.com / Expert123!');
  console.log('   🔑 Client: emma.client@example.com / Client123!');
} catch (error) {
  console.error('\n❌ Error during seeding process:', error);
  process.exit(1);
} 