import axios from 'axios';

const blogPosts = [
  {
    title: "10 Essential Spring Gardening Tips",
    content: `Spring is the perfect time to get your garden ready for the growing season. Here are our top tips for a successful spring garden:

1. Clean Up Winter Debris
Start by removing dead leaves, branches, and other debris that accumulated over winter. This prevents disease and pest problems while giving new growth space to thrive.

2. Test and Amend Your Soil
Healthy soil is the foundation of a great garden. Test your soil's pH and nutrient levels, then add organic matter like compost to improve soil structure and fertility.

3. Prune at the Right Time
Early spring is ideal for pruning many plants before new growth begins. Remove dead, damaged, or crossing branches to promote healthy growth and good air circulation.

4. Plan Your Planting Schedule
Research your local frost dates and create a planting calendar. Some plants can go in early spring, while others need to wait until after the last frost.

5. Start Seeds Indoors
Get a head start on the growing season by starting seeds indoors. This is especially important for slow-growing plants or those that need a longer growing season.

6. Prepare Your Tools
Clean, sharpen, and oil your gardening tools. Well-maintained tools make gardening easier and more enjoyable while reducing the risk of spreading plant diseases.

7. Install or Repair Garden Structures
Check and repair fences, trellises, and raised beds. This is also a good time to install new garden features before plants start growing.

8. Plan for Pest Control
Implement preventive measures like companion planting and physical barriers before pest problems arise. Consider introducing beneficial insects to your garden.

9. Set Up Irrigation Systems
Install or check your irrigation system. Proper watering is crucial for plant health, and automated systems help ensure consistent moisture levels.

10. Create a Maintenance Schedule
Develop a regular maintenance routine including watering, weeding, and fertilizing. This helps you stay on top of garden tasks throughout the growing season.

Remember, successful gardening is about planning ahead and maintaining consistency. These spring preparations will set your garden up for a productive and beautiful growing season.`,
    excerpt: "Get your garden ready for the growing season with these essential spring gardening tips. From soil preparation to tool maintenance, we cover everything you need to know.",
    imageUrl: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=800"
  },
  {
    title: "Creating a Water-Efficient Garden Design",
    content: `Water conservation is increasingly important in garden design. Here's how to create a beautiful, water-efficient garden:

Understanding Water-Efficient Design
Water-efficient gardening, also known as xeriscaping, focuses on creating beautiful landscapes that require minimal irrigation. This approach not only conserves water but also reduces maintenance needs and costs.

Key Design Principles:

1. Proper Plant Selection
- Choose drought-tolerant plants native to your region
- Group plants with similar water needs together
- Consider mature plant size to minimize pruning needs

2. Soil Improvement
- Add organic matter to improve water retention
- Use mulch to reduce evaporation
- Consider soil type when selecting plants

3. Efficient Irrigation
- Install drip irrigation systems
- Use smart controllers and rain sensors
- Water deeply but infrequently

4. Hardscaping Elements
- Incorporate permeable paving
- Use rocks and gravel strategically
- Create functional outdoor living spaces

5. Lawn Alternatives
- Replace traditional lawns with low-water alternatives
- Create defined garden beds
- Use groundcovers in place of grass

Maintenance Tips:
- Regular soil testing
- Proper mulching techniques
- Seasonal pruning
- Irrigation system maintenance

Benefits of Water-Efficient Gardens:
- Lower water bills
- Reduced maintenance time
- Environmental sustainability
- Year-round visual interest
- Wildlife habitat creation

By implementing these design principles, you can create a stunning garden that thrives with minimal water use while supporting local ecosystems.`,
    excerpt: "Learn how to design and maintain a beautiful garden that conserves water. Discover key principles of water-efficient landscaping and practical tips for implementation.",
    imageUrl: "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800"
  },
  {
    title: "The Benefits of Professional Tree Care",
    content: `Regular professional tree care is essential for maintaining healthy, safe, and beautiful trees in your landscape.

Why Professional Tree Care Matters:

1. Tree Health Assessment
Professional arborists can:
- Identify early signs of disease
- Spot pest infestations
- Evaluate structural integrity
- Recommend appropriate treatments

2. Proper Pruning Techniques
Expert pruning:
- Promotes healthy growth
- Reduces risk of branch failure
- Improves tree appearance
- Maintains safe clearance

3. Disease Management
Professional treatment:
- Early disease detection
- Proper diagnosis
- Targeted treatment plans
- Preventive care strategies

4. Storm Damage Prevention
Regular maintenance:
- Identifies weak branches
- Reduces wind resistance
- Prevents property damage
- Maintains tree stability

5. Property Value Enhancement
Well-maintained trees:
- Increase property value
- Improve curb appeal
- Provide shade and energy savings
- Create wildlife habitat

6. Safety Considerations
Professional assessment:
- Evaluates risk factors
- Identifies hazardous conditions
- Recommends appropriate actions
- Ensures proper equipment use

7. Long-term Benefits
Regular care provides:
- Extended tree life
- Reduced maintenance costs
- Better fruit production
- Enhanced landscape beauty

Remember, professional tree care is an investment in your property's future. Regular maintenance by qualified arborists helps ensure your trees remain healthy, safe, and beautiful for years to come.`,
    excerpt: "Discover why professional tree care is essential for maintaining healthy, safe, and beautiful trees in your landscape. Learn about the long-term benefits of expert tree maintenance.",
    imageUrl: "https://images.unsplash.com/photo-1598902108854-10e335adac99?w=800"
  }
];

async function createBlogPosts() {
  console.log('Creating blog posts...');
  
  try {
    // Create each blog post
    for (let i = 0; i < blogPosts.length; i++) {
      const post = blogPosts[i];
      const now = new Date();

      // Convert dates to strings in a specific format
      const blogPostData = {
        ...post,
        imageUrl: post.imageUrl || null,
        authorId: 1, // Add authorId field
        publishedAt: now.toISOString().split('T')[0], // YYYY-MM-DD format
        createdAt: now.toISOString().split('T')[0],
        updatedAt: now.toISOString().split('T')[0]
      };

      console.log('Creating blog post with data:', {
        ...blogPostData,
        content: blogPostData.content.substring(0, 50) + '...' // Truncate content for logging
      });

      try {
        const response = await axios.post('http://localhost:5000/api/admin/blog', blogPostData);
        console.log(`Created blog post: ${post.title}`);
      } catch (error) {
        if (error.response?.data?.errors) {
          console.error('Validation errors:', JSON.stringify(error.response.data.errors, null, 2));
        } else {
          console.error('Error creating blog post:', error.response?.data || error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
  
  console.log('Finished creating blog posts!');
}

createBlogPosts();
