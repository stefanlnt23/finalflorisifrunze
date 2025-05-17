
// Debug script to compare public and admin subscription endpoints
const fetch = require('node-fetch');

async function checkSubscriptions() {
  console.log("=== Debugging Subscription APIs ===");
  
  try {
    // Test public endpoint
    console.log("\n1. Testing public subscriptions endpoint:");
    const publicResp = await fetch('http://localhost:5000/api/subscriptions');
    const publicData = await publicResp.json();
    
    console.log(`Status: ${publicResp.status} ${publicResp.statusText}`);
    console.log(`Public endpoint found ${publicData.subscriptions ? publicData.subscriptions.length : 0} subscriptions`);
    
    if (publicData.subscriptions && publicData.subscriptions.length > 0) {
      console.log("First subscription from public API:", JSON.stringify(publicData.subscriptions[0], null, 2));
    }
    
    // Test admin endpoint
    console.log("\n2. Testing admin subscriptions endpoint:");
    const adminResp = await fetch('http://localhost:5000/api/admin/subscriptions');
    const adminData = await adminResp.json();
    
    console.log(`Status: ${adminResp.status} ${adminResp.statusText}`);
    
    // Check different possible formats for admin response
    let adminSubscriptions = [];
    if (Array.isArray(adminData)) {
      adminSubscriptions = adminData;
      console.log("Admin API returned direct array");
    } else if (adminData.subscriptions && Array.isArray(adminData.subscriptions)) {
      adminSubscriptions = adminData.subscriptions;
      console.log("Admin API returned object with subscriptions property");
    } else {
      console.log("Admin API returned unexpected format:", JSON.stringify(adminData, null, 2));
    }
    
    console.log(`Admin endpoint found ${adminSubscriptions.length} subscriptions`);
    
    if (adminSubscriptions.length > 0) {
      console.log("First subscription from admin API:", JSON.stringify(adminSubscriptions[0], null, 2));
    }
    
    // Compare data structures
    console.log("\n3. Comparing data structures:");
    
    const publicSub = publicData.subscriptions && publicData.subscriptions.length > 0 ? publicData.subscriptions[0] : null;
    const adminSub = adminSubscriptions.length > 0 ? adminSubscriptions[0] : null;
    
    if (publicSub && adminSub) {
      console.log("Public keys:", Object.keys(publicSub).sort().join(', '));
      console.log("Admin keys:", Object.keys(adminSub).sort().join(', '));
      
      // Compare features format
      if (publicSub.features && adminSub.features) {
        console.log("\nFeatures format comparison:");
        console.log("Public features type:", Array.isArray(publicSub.features) ? "Array" : typeof publicSub.features);
        console.log("Admin features type:", Array.isArray(adminSub.features) ? "Array" : typeof adminSub.features);
        
        if (Array.isArray(publicSub.features) && publicSub.features.length > 0) {
          console.log("Public first feature:", JSON.stringify(publicSub.features[0]));
        }
        
        if (Array.isArray(adminSub.features) && adminSub.features.length > 0) {
          console.log("Admin first feature:", JSON.stringify(adminSub.features[0]));
        }
      }
    } else {
      console.log("Can't compare - at least one API returned no data");
    }
    
  } catch (error) {
    console.error("Error during API testing:", error);
  }
}

checkSubscriptions();
