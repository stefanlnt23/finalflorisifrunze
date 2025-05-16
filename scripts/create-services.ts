import axios from 'axios';

const gardeningServices = [
  {
    name: "Lawn Mowing & Maintenance",
    description: "Professional lawn mowing service including edge trimming, grass clipping removal, and lawn pattern design. We use state-of-the-art equipment to ensure your lawn looks pristine and healthy all year round. Our experienced team follows best practices for grass height and cutting patterns to promote healthy growth.",
    shortDesc: "Regular lawn mowing and maintenance service",
    price: "30",
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=800",
    featured: true
  },
  {
    name: "Garden Design & Landscaping",
    description: "Transform your outdoor space with our comprehensive garden design and landscaping service. We create beautiful, functional gardens tailored to your style and needs. Services include layout planning, plant selection, hardscaping, and installation of features like patios, paths, and water features.",
    shortDesc: "Custom garden design and landscaping solutions",
    price: "500",
    imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800",
    featured: true
  },
  {
    name: "Tree Surgery & Pruning",
    description: "Expert tree care services including pruning, crown reduction, tree removal, and stump grinding. Our certified arborists ensure the health and safety of your trees while maintaining their natural beauty. We follow all safety regulations and provide professional advice on tree maintenance.",
    shortDesc: "Professional tree care and maintenance",
    price: "150",
    imageUrl: "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800",
    featured: false
  },
  {
    name: "Hedge Trimming",
    description: "Keep your hedges neat and tidy with our professional trimming service. We shape and maintain all types of hedges, ensuring clean lines and healthy growth. Regular maintenance helps prevent overgrowth and maintains the privacy and beauty of your garden.",
    shortDesc: "Professional hedge cutting and shaping",
    price: "45",
    imageUrl: "https://images.unsplash.com/photo-1599629954294-21beb74271e9?w=800",
    featured: false
  },
  {
    name: "Planting & Bed Maintenance",
    description: "Comprehensive flower bed and border maintenance including planting, weeding, mulching, and seasonal care. We select and plant appropriate species for your garden conditions and maintain them throughout the growing season to ensure beautiful, healthy displays.",
    shortDesc: "Flower bed planting and maintenance",
    price: "40",
    imageUrl: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800",
    featured: true
  },
  {
    name: "Irrigation System Installation",
    description: "Professional installation and maintenance of automatic irrigation systems. We design efficient watering solutions that save water while keeping your garden healthy. Includes smart controllers, drip irrigation, and sprinkler systems tailored to your garden's needs.",
    shortDesc: "Automatic watering system installation",
    price: "300",
    imageUrl: "https://images.unsplash.com/photo-1594897030264-ab7d87efc473?w=800",
    featured: false
  },
  {
    name: "Pest & Disease Control",
    description: "Environmentally friendly pest and disease management for your garden. We identify and treat common garden pests and diseases using integrated pest management techniques. Our treatments are safe for children, pets, and beneficial insects.",
    shortDesc: "Eco-friendly garden pest control",
    price: "60",
    imageUrl: "https://images.unsplash.com/photo-1596644462600-5c088fa9c20f?w=800",
    featured: false
  },
  {
    name: "Artificial Grass Installation",
    description: "High-quality artificial grass installation for a maintenance-free lawn. We prepare the ground, install proper drainage, and lay premium artificial turf for a natural look that stays green all year. Perfect for high-traffic areas or low-maintenance gardens.",
    shortDesc: "Professional artificial turf installation",
    price: "35",
    imageUrl: "https://images.unsplash.com/photo-1553710120-a5c8bc5c4f45?w=800",
    featured: false
  },
  {
    name: "Garden Clearance",
    description: "Thorough garden clearance and waste removal service. We clear overgrown gardens, remove green waste, and prepare spaces for new projects. Includes removal of unwanted plants, debris, and general garden waste with proper disposal.",
    shortDesc: "Complete garden clearing service",
    price: "200",
    imageUrl: "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=800",
    featured: false
  },
  {
    name: "Seasonal Garden Maintenance",
    description: "Year-round garden maintenance package including all seasonal tasks. Spring cleanup, summer maintenance, fall preparation, and winter protection. Keep your garden looking its best throughout the changing seasons with our comprehensive care program.",
    shortDesc: "Complete year-round garden care",
    price: "100",
    imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800",
    featured: true
  }
];

async function createServices() {
  console.log('Creating gardening services...');
  
  for (const service of gardeningServices) {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/services', service);
      console.log(`Created service: ${service.name}`);
    } catch (error) {
      console.error(`Error creating service ${service.name}:`, error.response?.data || error.message);
    }
  }
  
  console.log('Finished creating services!');
}

createServices();
