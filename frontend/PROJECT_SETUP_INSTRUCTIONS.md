# Ethiopian Tourist Project Setup Instructions

## Screenshot Added
I've set up the project structure to display the Ethiopian Tourist Destination project with a professional card layout.

## To Complete the Setup:

### 1. Replace the Placeholder Image
You need to replace the placeholder image with the actual screenshot:

**Path:** `src/assets/images/ethiopian-tourist.jpg`

**Steps:**
1. Save the screenshot from https://tourist-destination-2.onrender.com/
2. Replace the file at `src/assets/images/ethiopian-tourist.jpg` with your screenshot
3. Recommended image size: 800x600px or similar aspect ratio

### 2. Project Information Added

The project now includes:
- **Title:** Ethiopian Tourist Destination
- **Description:** Showcases Ethiopia's highest peak - Ras Dashen (4,560m)
- **Features:**
  - 41+ Destinations
  - 14 Countries
  - 500+ Happy Travelers
  - 10+ Years Experience
- **Technologies:** React, Node.js, MongoDB, Express
- **Live URL:** https://tourist-destination-2.onrender.com/

### 3. New Features in Projects Component

✅ Image-based project cards with hover effects
✅ Technology stack badges
✅ Feature highlights
✅ Professional overlay with "Visit Site" button
✅ Responsive design for mobile devices
✅ Smooth animations and transitions

### 4. View Your Changes

Run your development server to see the updated project:
```bash
npm run dev
```

Navigate to the Projects section to see your Ethiopian Tourist project displayed beautifully!

---

## Need to Add More Projects?

Simply add more objects to the `projects` array in `src/components/Projects.jsx`:

```javascript
{
  title: 'Your Project Name',
  description: 'Project description...',
  image: yourProjectImage, // import at the top
  link: 'https://your-project-url.com/',
  technologies: ['Tech1', 'Tech2', 'Tech3'],
  features: ['Feature 1', 'Feature 2'],
}
```

## Alternative: Use Backend API

Your portfolio also supports dynamic projects through the backend API. You can add projects through your admin panel if you have the backend running.
