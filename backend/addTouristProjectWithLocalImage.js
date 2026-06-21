require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Project = require('./models/Project');

const addTouristProject = async () => {
  try {
    await connectDB();
    console.log('Adding Ethiopian Tourist Destination project...');

    // Note: You should upload the image file to /backend/uploads/ folder first
    // Then update the thumbnail path to match your uploaded image
    // For example: '/uploads/ethiopian-tourist.jpg'
    
    const touristProject = {
      title: 'Ethiopian Tourist',
      description: 'A comprehensive tourist destination platform showcasing Ethiopia\'s highest peak - Ras Dashen (4,550m). Features destination discovery with smart matching algorithm, integrated booking system, and interactive analytics dashboard. Discover ancient civilizations, dramatic landscapes, and vibrant cultures across the Horn of Africa. The platform serves 41+ destinations across 14 countries with 500+ happy travelers and 10+ years of experience.',
      thumbnail: '/uploads/ethiopian-tourist.jpg', // Update this path after uploading the image
      images: ['/uploads/ethiopian-tourist.jpg'],
      technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'CSS3', 'Responsive Design', 'RESTful API'],
      githubUrl: '', // Add your GitHub repository URL if available
      liveUrl: 'https://tourist-destination-2.onrender.com/',
      featured: true,
      category: 'Full Stack',
      order: 1, // This will make it appear first in the projects list
      isActive: true,
      publishedAt: new Date(),
    };

    const existingProject = await Project.findOne({ liveUrl: touristProject.liveUrl });
    
    if (existingProject) {
      console.log('Project already exists. Updating...');
      const updated = await Project.findByIdAndUpdate(existingProject._id, touristProject, { new: true });
      console.log('✓ Project updated successfully!');
      console.log('Project details:', {
        id: updated._id,
        title: updated.title,
        liveUrl: updated.liveUrl,
      });
    } else {
      const newProject = await Project.create(touristProject);
      console.log('✓ Ethiopian Tourist project added successfully!');
      console.log('Project details:', {
        id: newProject._id,
        title: newProject.title,
        liveUrl: newProject.liveUrl,
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error adding project:', error);
    process.exit(1);
  }
};

addTouristProject();
