# Adding Ethiopian Tourist Project

This guide explains how to add the Ethiopian Tourist destination project to your portfolio.

## Screenshot Preview
![Ethiopian Tourist](https://i.ibb.co/zRvYKXm/ethiopian-tourist-screenshot.png)

## Project Details
- **Title**: Ethiopian Tourist
- **Live URL**: https://tourist-destination-2.onrender.com/
- **Description**: A comprehensive tourist destination platform showcasing Ethiopia's highest peak - Ras Dashen (4,550m)
- **Features**:
  - 41+ Destinations
  - 14 Countries Coverage
  - 500+ Happy Travelers
  - 10+ Years Experience
  - Smart Matching Algorithm
  - Booking System
  - Interactive Dashboard

## Option 1: Using External Image URL (Quick Method)

Run this command to add the project with an external image URL:

```bash
cd backend
node addTouristProject.js
```

This script uses an external image URL (ImgBB) for the thumbnail.

## Option 2: Using Local Image (Recommended)

If you want to store the image locally:

1. **Save the screenshot**: 
   - Save the Ethiopian Tourist screenshot to `backend/uploads/ethiopian-tourist.jpg`

2. **Update the image path** in `backend/addTouristProjectWithLocalImage.js`:
   ```javascript
   thumbnail: '/uploads/ethiopian-tourist.jpg',
   ```

3. **Run the script**:
   ```bash
   cd backend
   node addTouristProjectWithLocalImage.js
   ```

## Option 3: Add via Admin Dashboard

You can also add the project through your admin dashboard:

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start your admin panel:
   ```bash
   cd admin
   npm run dev
   ```

3. Login to the admin dashboard at `http://localhost:5174/admin`

4. Navigate to the Projects section

5. Click "Add New Project" and fill in:
   - **Title**: Ethiopian Tourist
   - **Description**: A comprehensive tourist destination platform showcasing Ethiopia's highest peak - Ras Dashen (4,550m). Features destination discovery, smart matching, booking system, and interactive dashboards. Discover ancient civilizations, dramatic landscapes, and vibrant cultures across the Horn of Africa.
   - **Technologies**: React, Node.js, MongoDB, Express, CSS3, Responsive Design
   - **Live URL**: https://tourist-destination-2.onrender.com/
   - **Category**: Full Stack
   - **Featured**: Yes
   - **Order**: 1
   - Upload the screenshot image

## Technologies Used in This Project
- React
- Node.js
- MongoDB
- Express
- JavaScript
- CSS3
- Responsive Design
- RESTful API

## Verification

After running the script, verify the project was added:

1. Check the console output for success message
2. Login to your admin dashboard and navigate to Projects
3. You should see "Ethiopian Tourist" in your projects list

## Troubleshooting

If you encounter any errors:

1. Ensure MongoDB is running
2. Check that your `.env` file has correct database credentials
3. Make sure you're in the `backend` directory when running the scripts
4. Verify the database connection URL in `backend/.env`
