// Load environment variables from .env.remote file
require('dotenv').config({ path: '.env.remote' });
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project');

const addTouristProject = async () => {
  try {
    console.log('Connecting to remote database...');
    console.log('MongoDB URI:', process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')); // Hide password in log
    
    await connectDB();
    console.log('✓ Connected to remote database');
    console.log('\nAdding Ethiopian Tourist Destination project...');

    const touristProject = {
      title: 'Ethiopian Tourist',
      description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peak - Ras Dashen (4,550m). Features destination discovery with smart matching algorithm, integrated booking system, and interactive analytics dashboard. Discover ancient civilizations, dramatic landscapes, and vibrant cultures across the Horn of Africa. The platform serves 41+ destinations across 14 countries with 500+ happy travelers and 10+ years of experience.',
      thumbnail: 'https://i.ibb.co/zRvYKXm/ethiopian-tourist-screenshot.png',
      images: ['https://i.ibb.co/zRvYKXm/ethiopian-tourist-screenshot.png'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'CSS3', 'Responsive Design', 'RESTful API'],
      githubUrl: '', // Add your GitHub repository URL if available
      liveUrl: 'https://tourist-destination-2.onrender.com/',
      featured: true,
      category: 'Full Stack',
      order: 1,
      isActive: true,
      publishedAt: new Date(),
    };

    // Check if project already exists
    const existingProject = await Project.findOne({ liveUrl: touristProject.liveUrl });
    
    if (existingProject) {
      console.log('⚠ Project already exists. Updating...');
      const updated = await Project.findByIdAndUpdate(existingProject._id, touristProject, { new: true });
      console.log('✓ Project updated successfully!');
      console.log('\nProject details:');
      console.log('  ID:', updated._id);
      console.log('  Title:', updated.title);
      console.log('  Live URL:', updated.liveUrl);
      console.log('  Featured:', updated.featured);
    } else {
      const newProject = await Project.create(touristProject);
      console.log('✓ Ethiopian Tourist project added successfully!');
      console.log('\nProject details:');
      console.log('  ID:', newProject._id);
      console.log('  Title:', newProject.title);
      console.log('  Live URL:', newProject.liveUrl);
      console.log('  Featured:', newProject.featured);
    }

    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding project:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
};

addTouristProject();
