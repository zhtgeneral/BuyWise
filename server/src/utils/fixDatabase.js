import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://buywise_admin:****@buywise.qcwpmpn.mongodb.net/BuyWise?retryWrites=true&w=majority&appName=BuyWise');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // Check if profiles collection exists and has old indexes
    const collections = await db.listCollections().toArray();
    const profileCollection = collections.find(col => col.name === 'profiles');
    
    if (profileCollection) {
      console.log('Found profiles collection');
      
      // Get current indexes
      const indexes = await db.collection('profiles').indexes();
      console.log('Current indexes:', indexes);
      
      // Check if there's an email index that shouldn't be there
      const emailIndex = indexes.find(index => index.key && index.key.email);
      if (emailIndex) {
        console.log('Found email index, removing it...');
        await db.collection('profiles').dropIndex('email_1');
        console.log('Email index removed');
      }
      
      // Check if userId index exists
      const userIdIndex = indexes.find(index => index.key && index.key.userId);
      if (!userIdIndex) {
        console.log('Creating userId index...');
        await db.collection('profiles').createIndex({ userId: 1 }, { unique: true });
        console.log('UserId index created');
      }
    } else {
      console.log('No profiles collection found');
    }

    // Check users collection
    const userCollection = collections.find(col => col.name === 'users');
    if (userCollection) {
      console.log('Found users collection');
      const userIndexes = await db.collection('users').indexes();
      console.log('User indexes:', userIndexes);
    }

    console.log('Database check complete');
  } catch (error) {
    console.error('Error fixing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the fix
fixDatabase(); 