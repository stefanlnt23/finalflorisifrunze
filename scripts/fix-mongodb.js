
const { MongoClient } = require('mongodb');

// MongoDB connection string - using localhost since we connect within the Replit environment
const DATABASE_URL = 'mongodb://127.0.0.1:27017/garden_services_db';

async function fixMongoDB() {
  let client;
  
  try {
    console.log('Connecting to MongoDB at localhost:27017...');
    client = new MongoClient(DATABASE_URL);
    await client.connect();
    console.log('Connected to MongoDB successfully!');
    
    const db = client.db();
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Check for subscriptions collection
    const hasSubscriptions = collections.some(c => c.name === 'subscriptions');
    if (!hasSubscriptions) {
      console.log('Creating subscriptions collection...');
      await db.createCollection('subscriptions');
      console.log('Subscriptions collection created');
    }
    
    // Check if we have any subscriptions
    const subscriptionsCount = await db.collection('subscriptions').countDocuments();
    console.log(`Found ${subscriptionsCount} subscriptions in database`);
    
    // Add sample subscriptions if none exist
    if (subscriptionsCount === 0) {
      console.log('Adding sample subscriptions...');
      
      const sampleSubscriptions = [
        {
          name: "Basic Plan",
          description: "For small gardens with simple needs",
          color: "#4CAF50",
          features: [
            { name: "Lawn Mowing", value: "Twice monthly" },
            { name: "Plant Care", value: "Basic" },
            { name: "Garden Cleanup", value: "Yes" },
            { name: "Fertilization", value: "Quarterly" },
            { name: "Consultation", value: "Email" }
          ],
          price: "$99/month",
          isPopular: false,
          displayOrder: 1,
          imageUrl: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=500&q=60"
        },
        {
          name: "Premium Plan",
          description: "Comprehensive care for medium to large gardens",
          color: "#2196F3",
          features: [
            { name: "Lawn Mowing", value: "Weekly" },
            { name: "Plant Care", value: "Comprehensive" },
            { name: "Garden Cleanup", value: "Twice monthly" },
            { name: "Fertilization", value: "Monthly" },
            { name: "Pest Control", value: "Included" },
            { name: "Seasonal Planting", value: "Included" },
            { name: "Consultation", value: "Phone & Email" }
          ],
          price: "$199/month",
          isPopular: true,
          displayOrder: 2,
          imageUrl: "https://images.unsplash.com/photo-1599685315640-4a9c6c747068?auto=format&fit=crop&w=500&q=60"
        },
        {
          name: "Professional Plan",
          description: "Complete landscape management for estates",
          color: "#673AB7",
          features: [
            { name: "Lawn Mowing", value: "Weekly" },
            { name: "Plant Care", value: "Professional" },
            { name: "Garden Cleanup", value: "Weekly" },
            { name: "Fertilization", value: "Customized Schedule" },
            { name: "Pest Control", value: "Comprehensive" },
            { name: "Seasonal Planting", value: "Premium Selection" },
            { name: "Irrigation Management", value: "Included" },
            { name: "Landscape Design", value: "Annual Refresh" },
            { name: "Consultation", value: "Dedicated Manager" }
          ],
          price: "$399/month",
          isPopular: false,
          displayOrder: 3,
          imageUrl: "https://images.unsplash.com/photo-1580600301354-0ce8faef576c?auto=format&fit=crop&w=500&q=60"
        }
      ];
      
      const result = await db.collection('subscriptions').insertMany(sampleSubscriptions);
      console.log(`Inserted ${result.insertedCount} sample subscriptions`);
    }
    
    // Display first subscription
    const firstSubscription = await db.collection('subscriptions').findOne();
    if (firstSubscription) {
      console.log('Sample subscription:', JSON.stringify(firstSubscription, null, 2));
    }
    
    console.log('MongoDB check and fix completed successfully');
    
  } catch (error) {
    console.error('Error connecting to or working with MongoDB:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
}

fixMongoDB();
