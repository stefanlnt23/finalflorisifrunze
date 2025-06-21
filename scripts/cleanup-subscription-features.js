import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function cleanupSubscriptionFeatures() {
  let client;
  
  try {
    // Connect to MongoDB
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('subscriptions');
    
    console.log('Starting subscription features cleanup...');
    
    // Get all subscriptions
    const subscriptions = await collection.find({}).toArray();
    console.log(`Found ${subscriptions.length} subscriptions to process`);
    
    let updatedCount = 0;
    
    for (const sub of subscriptions) {
      let needsUpdate = false;
      let cleanedFeatures = [];
      
      if (sub.features && Array.isArray(sub.features)) {
        cleanedFeatures = sub.features.map(feature => {
          if (typeof feature === 'object' && feature.name) {
            // Clean the feature name if it contains ": Included"
            let cleanName = feature.name;
            if (cleanName.includes(': Included')) {
              cleanName = cleanName.split(': Included')[0].trim();
              needsUpdate = true;
              console.log(`  Cleaning name: "${feature.name}" -> "${cleanName}"`);
            }
            
            // Always standardize value to Romanian "Inclus"
            if (feature.value !== 'Inclus') {
              needsUpdate = true;
              console.log(`  Standardizing value: "${feature.value}" -> "Inclus"`);
            }
            
            return {
              name: cleanName,
              value: 'Inclus'  // Always use Romanian
            };
          } else if (typeof feature === 'string') {
            // Clean string features too
            if (feature.includes(': Included')) {
              const cleanName = feature.split(': Included')[0].trim();
              needsUpdate = true;
              console.log(`  Cleaning: "${feature}" -> "${cleanName}"`);
              return { name: cleanName, value: 'Inclus' };
            }
            return { name: feature, value: 'Inclus' };
          }
          return feature;
        });
      }
      
      if (needsUpdate) {
        await collection.updateOne(
          { _id: sub._id },
          { 
            $set: { 
              features: cleanedFeatures,
              updatedAt: new Date()
            }
          }
        );
        console.log(`Updated subscription: ${sub.name}`);
        updatedCount++;
      }
    }
    
    console.log(`\nCleanup completed! Updated ${updatedCount} subscriptions.`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the cleanup
cleanupSubscriptionFeatures();