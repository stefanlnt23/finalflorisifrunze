import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://florisifrunze:d7ppjxjGTe5u13tG@cluster0.3ibgvtn.mongodb.net/garden_services_db';

async function testConnection() {
  console.log('Testing MongoDB connection...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connection successful! MongoDB is properly configured.');
    console.log(`Connected to database: ${mongoose.connection.db.databaseName}`);
    
    // Check if we can perform a simple operation
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Available collections: ${collections.map(c => c.name).join(', ')}`);
    
    return true;
  } catch (error) {
    console.error('❌ Connection failed!');
    console.error(`Error: ${error.message}`);
    return false;
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Connection closed.');
    }
  }
}

// Run the test
testConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
