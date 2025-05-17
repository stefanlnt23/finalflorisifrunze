
import { connectToMongoDB, Subscription, mapSubscriptionToSchema } from '../server/mongodb';
import { log } from '../server/vite';

async function createSampleSubscriptions() {
  try {
    log('Connecting to MongoDB...', 'create-subscriptions');
    const connection = await connectToMongoDB();
    const db = connection.db;

    log('Checking existing subscriptions...', 'create-subscriptions');
    const existingCount = await db.collection('subscriptions').countDocuments();
    
    if (existingCount > 0) {
      log(`Found ${existingCount} existing subscriptions. Skipping sample data creation.`, 'create-subscriptions');
      return;
    }

    log('No subscriptions found. Creating sample data...', 'create-subscriptions');
    
    const sampleSubscriptions = [
      {
        name: 'Abonament Basic',
        description: 'Pentru grădini mici și spații cu necesități simple',
        color: '#4CAF50',
        price: '199 RON / lună',
        features: [
          { name: 'Tunderea gazonului', value: 'De 2 ori pe lună' },
          { name: 'Îngrijirea plantelor', value: 'De bază' },
          { name: 'Curățenie grădină', value: 'Da' },
          { name: 'Fertilizare', value: 'Trimestrială' },
          { name: 'Consultanță', value: 'Email' }
        ],
        isPopular: false,
        displayOrder: 1,
        imageUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8Z2FyZGVufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
      },
      {
        name: 'Abonament Standard',
        description: 'Pentru grădini medii cu nevoi moderate de întreținere',
        color: '#2196F3',
        price: '349 RON / lună',
        features: [
          { name: 'Tunderea gazonului', value: 'Săptămânal' },
          { name: 'Îngrijirea plantelor', value: 'Completă' },
          { name: 'Curățenie grădină', value: 'Da' },
          { name: 'Fertilizare', value: 'Lunară' },
          { name: 'Consultanță', value: 'Telefon & Email' },
          { name: 'Tratament preventiv', value: 'Da' }
        ],
        isPopular: true,
        displayOrder: 2,
        imageUrl: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Nnx8Z2FyZGVufGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60'
      },
      {
        name: 'Abonament Premium',
        description: 'Pentru grădini extinse și peisagistică profesională',
        color: '#FF9800',
        price: '599 RON / lună',
        features: [
          { name: 'Tunderea gazonului', value: 'Săptămânal' },
          { name: 'Îngrijirea plantelor', value: 'Premium' },
          { name: 'Curățenie grădină', value: 'Da' },
          { name: 'Fertilizare', value: 'Săptămânală' },
          { name: 'Consultanță', value: '24/7' },
          { name: 'Tratament preventiv', value: 'Da' },
          { name: 'Design peisagistic', value: 'Inclus' },
          { name: 'Vizite urgente', value: 'Prioritar' }
        ],
        isPopular: false,
        displayOrder: 3,
        imageUrl: 'https://images.unsplash.com/photo-1578901773885-54988aa5b472?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTR8fGdhcmRlbnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60'
      }
    ];

    const result = await db.collection('subscriptions').insertMany(sampleSubscriptions);
    
    log(`Successfully created ${result.insertedCount} sample subscriptions`, 'create-subscriptions');
    
    // Display the created subscriptions
    const createdSubscriptions = await db.collection('subscriptions').find().toArray();
    createdSubscriptions.forEach(sub => {
      log(`Created: ${sub.name} (${sub._id})`, 'create-subscriptions');
    });
    
  } catch (error) {
    log(`Error creating sample subscriptions: ${error}`, 'create-subscriptions');
  } finally {
    process.exit(0);
  }
}

createSampleSubscriptions();
