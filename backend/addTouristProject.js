require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project');

const addTouristProject = async () => {
  try {
    await connectDB();
    console.log('Adding Ethiopian Tourist Destination project...');

    const touristProject = {
      title: 'Ethiopian Tourist',
      description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peak - Ras Dashen (4,550m). Features destination discovery, smart matching, booking system, and interactive dashboards. Discover ancient civilizations, dramatic landscapes, and vibrant cultures across the Horn of Africa with 41+ destinations, 14 countries coverage, and 500+ happy travelers.',
      thumbnail: 'https://i.ibb.co/zRvYKXm/ethiopian-tourist-screenshot.png', // You can replace this with actual uploaded image URL
      images: ['https://i.ibb.co/zRvYKXm/ethiopian-tourist-screenshot.png'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3', 'Responsive Design'],
      githubUrl: '', // Add GitHub URL if available
      liveUrl: 'https://tourist-destination-2.onrender.com/',
      featured: true,
      category: 'Full Stack',
      order: 1, // This will make it appear first
      isActive: true,
      publishedAt: new Date(),
    };

    const existingProject = await Project.findOne({ liveUrl: touristProject.liveUrl });
    
    if (existingProject) {
      console.log('Project already exists. Updating...');
      await Project.findByIdAndUpdate(existingProject._id, touristProject);
      console.log('✓ Project updated successfully!');
    } else {
      const newProject = await Project.create(touristProject);
      console.log('✓ Ethiopian Tourist project added successfully!');
      console.log('Project ID:', newProject._id);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding project:', error);
    process.exit(1);
  }
};

addTouristProject();
