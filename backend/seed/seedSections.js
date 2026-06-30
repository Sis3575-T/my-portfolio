const Section = require('../models/Section');

const DEFAULT_SECTIONS = [
  { type: 'hero', order: 1, name: 'Hero', content: { title: 'Hero', subtitle: '' } },
  { type: 'about', order: 2, name: 'About', content: { title: 'About Me', subtitle: 'Get to know me better' } },
  { type: 'skills', order: 3, name: 'Skills', content: { title: 'Skills & Technologies', subtitle: 'Technologies I work with' } },
  { type: 'experience', order: 4, name: 'Experience', content: { title: 'Experience', subtitle: 'My professional journey' } },
  { type: 'education', order: 5, name: 'Education', content: { title: 'Education', subtitle: 'My academic background' } },
  { type: 'projects', order: 6, name: 'Projects', content: { title: 'Projects', subtitle: 'Things I have built' } },
  { type: 'testimonials', order: 7, name: 'Testimonials', content: { title: 'Testimonials', subtitle: 'What people say' } },
  { type: 'services', order: 8, name: 'Services', content: { title: 'Services', subtitle: 'What I offer' } },
  { type: 'blog', order: 9, name: 'Blog', content: { title: 'Latest Posts', subtitle: 'Thoughts and tutorials' } },
  { type: 'certificates', order: 10, name: 'Certificates', content: { title: 'Certificates', subtitle: 'My credentials' } },
  { type: 'contact', order: 11, name: 'Contact', content: { title: 'Get In Touch', subtitle: 'Have a project in mind? Let\'s talk' } },
];

module.exports = async function seedSections() {
  for (const def of DEFAULT_SECTIONS) {
    const existing = await Section.findOne({ type: def.type });
    if (!existing) {
      await Section.create({ ...def, status: 'published', visible: true });
      console.log(`  Section seeded: ${def.type}`);
    }
  }
};
