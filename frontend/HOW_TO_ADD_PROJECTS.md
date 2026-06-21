# How to Add/Edit Projects in Frontend

## 📍 Location
File: `frontend/src/components/Projects.jsx`

## ✏️ How to Add a New Project

### Step 1: Add the project image (optional)

1. Save your project screenshot to `frontend/src/assets/images/`
2. Name it something like `your-project-name.jpg`

### Step 2: Import the image in Projects.jsx

At the top of the file, add:
```jsx
import yourProjectImg from '../assets/images/your-project-name.jpg';
```

### Step 3: Add project to the array

In the `projects` array, add a new object:

```jsx
{
  title: 'Your Project Name',
  description: 'Detailed description of your project. What it does, who it\'s for, and what makes it special.',
  image: yourProjectImg, // or use projectPlaceholder
  link: 'https://your-project-url.com/', // or '#' if no live demo
  technologies: ['React', 'Node.js', 'MongoDB', 'Express'],
  features: ['Feature 1', 'Feature 2', 'Feature 3', 'Feature 4'],
},
```

## 📝 Project Object Structure

```jsx
{
  title: 'String - Project name',
  description: 'String - Detailed description (2-3 sentences)',
  image: ImageImport, // imported image or projectPlaceholder
  link: 'String - URL', // live demo or GitHub link, use '#' if none
  technologies: ['Array', 'of', 'tech', 'stack'], // tech badges
  features: ['Key', 'features', 'or', 'stats'], // highlight features
}
```

## 🎨 Example: Add a New Project

```jsx
// 1. Import image (at top of file)
import blogAppImg from '../assets/images/blog-app.jpg';

// 2. Add to projects array
const projects = [
  {
    title: 'Ethiopian Tourist Destination',
    description: '...',
    image: ethiopianTouristImg,
    link: 'https://tourist-destination-2.onrender.com/',
    technologies: ['React', 'Node.js', 'MongoDB', 'Express', 'CSS3'],
    features: ['41+ Destinations', '14 Countries', '500+ Happy Travelers', '10+ Years Experience'],
  },
  {
    title: 'Blog Platform',
    description: 'Modern blogging platform with markdown support, comments, tags, and SEO optimization. Features include user authentication, rich text editor, and social sharing.',
    image: blogAppImg,
    link: 'https://my-blog-app.com',
    technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind'],
    features: ['Markdown Support', 'SEO Optimized', 'Comments System', 'Social Sharing'],
  },
  // ... more projects
];
```

## 🔄 How to Edit Existing Projects

Simply modify the values in the projects array:

```jsx
{
  title: 'Ethiopian Tourist Destination', // ← Change title here
  description: 'New description...', // ← Change description here
  image: ethiopianTouristImg, // ← Change image here
  link: 'https://new-link.com/', // ← Change link here
  technologies: ['React', 'Vue'], // ← Change technologies here
  features: ['New Feature'], // ← Change features here
}
```

## 🗑️ How to Remove a Project

Simply delete or comment out the project object from the array:

```jsx
const projects = [
  {
    title: 'Ethiopian Tourist Destination',
    // ...
  },
  // Remove this project by deleting or commenting it out
  // {
  //   title: 'E-Commerce Platform',
  //   // ...
  // },
  {
    title: 'Task Management System',
    // ...
  },
];
```

## 🖼️ Using Placeholder Images

If you don't have a project screenshot yet, use the placeholder:

```jsx
import projectPlaceholder from '../assets/images/project.jpg';

// Then use it:
{
  title: 'My Project',
  image: projectPlaceholder, // ← Uses placeholder
  // ...
}
```

## 🎯 Tips

1. **Keep descriptions concise**: 2-3 sentences, 150-200 characters
2. **Use relevant technologies**: List the main tech stack (4-6 items max)
3. **Highlight key features**: Use numbers or specific achievements when possible
4. **Optimize images**: Keep image sizes under 500KB for better performance
5. **Test links**: Make sure all project links work before deploying

## 📐 Recommended Image Sizes

- **Width**: 800-1200px
- **Height**: 500-700px
- **Aspect Ratio**: 16:9 or 3:2
- **Format**: JPG or WebP
- **File Size**: Under 500KB

## 🚀 After Making Changes

1. Save the file
2. The dev server will auto-reload
3. Check `http://localhost:5173` to see changes
4. Commit and push to deploy

## ✅ Current Projects in Your Portfolio

1. ✅ **Ethiopian Tourist Destination** (Live project with image)
2. ⚪ **E-Commerce Platform** (Placeholder - replace with your project)
3. ⚪ **Task Management System** (Placeholder - replace with your project)
4. ⚪ **Weather Dashboard** (Placeholder - replace with your project)
5. ⚪ **Social Media Platform** (Placeholder - replace with your project)
6. ⚪ **Portfolio CMS** (Placeholder - replace with your project)

Replace the placeholder projects with your actual projects as you build them!

## 🎨 Customizing Project Card Styling

If you want to change the appearance, edit `frontend/src/components/Projects.css`

Common customizations:
- Card size: `.project-card`
- Image height: `.project-image-container { height: 240px; }`
- Colors: `.project-link-button { background: #818cf8; }`
- Spacing: `.projects-grid { gap: 2rem; }`

## 🆘 Need Help?

- Check the existing projects for reference
- Keep the same structure for consistency
- Test locally before deploying
- Make sure all imports are correct

Happy coding! 🎉
