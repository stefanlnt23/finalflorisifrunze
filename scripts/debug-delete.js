import { MongoClient, ObjectId } from 'mongodb';

async function debugDelete() {
  console.log("=== Debugging MongoDB Delete Operation ===");
  
  try {
    const uri = process.env.DATABASE_URL || 'mongodb://localhost:27017/greengardenservices';
    console.log("Connecting to MongoDB...");
    
    const client = new MongoClient(uri);
    await client.connect();
    
    const db = client.db();
    const collection = db.collection('subscriptions');
    
    // Test the problematic ID
    const testId = '6856d5a1709b1ca9d7fa3d57';
    console.log(`\nTesting subscription ID: ${testId}`);
    
    // Convert to ObjectId
    let objectId;
    try {
      objectId = new ObjectId(testId);
      console.log(`Converted to ObjectId: ${objectId}`);
      console.log(`ObjectId type: ${typeof objectId}`);
    } catch (error) {
      console.error("Failed to convert to ObjectId:", error);
      return;
    }
    
    // Check if subscription exists with this ID
    console.log("\n1. Checking if subscription exists...");
    const subscription = await collection.findOne({ _id: objectId });
    console.log("Subscription found:", subscription ? 'YES' : 'NO');
    
    if (subscription) {
      console.log("Subscription details:", {
        _id: subscription._id,
        name: subscription.name,
        description: subscription.description
      });
    }
    
    // Check all subscriptions to see what IDs exist
    console.log("\n2. Listing all subscription IDs in database...");
    const allSubscriptions = await collection.find({}, { projection: { _id: 1, name: 1 } }).toArray();
    console.log(`Found ${allSubscriptions.length} subscriptions:`);
    
    allSubscriptions.forEach((sub, index) => {
      console.log(`  ${index + 1}. ID: ${sub._id} (${sub._id.toString()}) - Name: ${sub.name}`);
    });
    
    // Test the delete operation
    if (subscription) {
      console.log("\n3. Testing delete operation...");
      const deleteResult = await collection.deleteOne({ _id: objectId });
      console.log("Delete result:", {
        acknowledged: deleteResult.acknowledged,
        deletedCount: deleteResult.deletedCount
      });
      
      if (deleteResult.deletedCount > 0) {
        console.log("✅ Delete successful!");
        
        // Verify deletion
        const stillExists = await collection.findOne({ _id: objectId });
        console.log("Still exists after delete:", stillExists ? 'YES' : 'NO');
      } else {
        console.log("❌ Delete failed - no documents deleted");
      }
    }
    
    await client.close();
    
  } catch (error) {
    console.error("Error:", error);
  }
}

debugDelete().catch(console.error);