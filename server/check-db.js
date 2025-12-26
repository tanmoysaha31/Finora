import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config();

const uri = process.env.MONGO_URI;
console.log('Connecting to:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password

mongoose.connect(uri)
  .then(async () => {
    console.log('Connected!');
    console.log('Database Name:', mongoose.connection.db.databaseName);
    
    const users = await User.find({});
    console.log(`Found ${users.length} users:`);
    users.forEach(u => {
      console.log(`- ${u.fullname} (${u.email}) [ID: ${u._id}]`);
    });

    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err);
    process.exit(1);
  });
