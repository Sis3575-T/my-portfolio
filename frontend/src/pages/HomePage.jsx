import React, { useState, useEffect, useCallback } from 'react';
import { websiteApi } from '../api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Skills from '../components/Skills';
import Experience from '../components/Experience';
import Education from '../components/Education';
import Projects from '../components/Projects';
import Testimonials from '../components/Testimonials';
import Services from '../components/Services';
import Blog from '../components/Blog';
import Contact from '../components/Contact';
import Footer from '../components/Footer';

const SECTION_MAP = {
  hero: [Hero, 'hero'],
  about: [About, null],
  skills: [Skills, 'skills'],
  experience: [Experience, 'experience'],
  education: [Education, 'education'],
  projects: [Projects, 'projects'],
  testimonials: [Testimonials, 'testimonials'],
  services: [Services, 'services'],
  blog: [Blog, 'posts'],
  contact: [Contact, null],
  certificates: [null, null],
};

function HomePage() {
  const [data, setData] = useState({
    loading: true,
    error: null,
    sections: null,
    settings: null,
    hero: null,
    projects: [],
    skills: [],
    experience: [],
    education: [],
    testimonials: [],
    services: [],
    blog: [],
  });

  const fetchData = useCallback(() => {
    setData(prev => ({ ...prev, loading: true, error: null }));
    Promise.all([
      websiteApi.getSiteConfig(),
      websiteApi.getHero(),
      websiteApi.getProjects(),
      websiteApi.getSkills(),
      websiteApi.getExperience(),
      websiteApi.getEducation(),
      websiteApi.getTestimonials(),
      websiteApi.getServices(),
      websiteApi.getBlog(),
    ])
      .then(([configRes, heroRes, projectsRes, skillsRes, expRes, eduRes, testRes, servRes, blogRes]) => {
        const config = configRes.data.data;
        setData({
          loading: false,
          error: null,
          sections: config?.sections || null,
          settings: config?.settings || null,
          navItems: config?.navItems || [],
          hero: heroRes.data.data,
          projects: projectsRes.data.data || [],
          skills: skillsRes.data.data || [],
          experience: expRes.data.data || [],
          education: eduRes.data.data || [],
          testimonials: testRes.data.data || [],
          services: servRes.data.data || [],
          blog: blogRes.data.data || [],
        });
      })
      .catch(err => {
        setData(prev => ({ ...prev, loading: false, error: err.message }));
      });
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (data.loading) {
    return (
      <div className="page">
        <div className="navbar-placeholder" />
        <div className="container" style={{ padding: '4rem 0' }}>
          <LoadingSkeleton variant="card" count={6} />
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <div className="page">
        <div className="navbar-placeholder" />
        <div className="container" style={{ padding: '4rem 0' }}>
          <ErrorState message={data.error} onRetry={fetchData} />
        </div>
      </div>
    );
  }

  const { sections, settings, hero, projects, skills, experience, education, testimonials, services, blog, navItems } = data;

  const dataMap = { hero, projects, skills, experience, education, testimonials, services, blog };

  const sectionsToRender = sections && sections.length > 0
    ? sections.filter(s => s.visible !== false && s.status === 'published')
    : null;

  return (
    <div className="page">
      <Navbar navItems={navItems} settings={settings} />
      <main>
        {sectionsToRender ? (
          sectionsToRender.map(section => {
            const mapping = SECTION_MAP[section.type];
            if (!mapping) return null;
            const [Comp, dataKey] = mapping;
            if (!Comp) return null;
            const content = section.content || {};
            const extraProps = dataKey ? { [dataKey]: dataMap[dataKey] } : {};
            return (
              <Comp
                key={section.type}
                {...extraProps}
                settings={settings}
                sectionTitle={content.title}
                sectionSubtitle={content.subtitle}
              />
            );
          })
        ) : (
          <>
            <Hero hero={hero} settings={settings} />
            <About settings={settings} />
            <Skills skills={skills} />
            <Experience experience={experience} />
            <Education education={education} />
            <Projects projects={projects} />
            <Testimonials testimonials={testimonials} />
            <Services services={services} />
            <Blog posts={blog} />
            <Contact settings={settings} />
          </>
        )}
      </main>
      <Footer settings={settings} navItems={navItems} />
    </div>
  );
}

export default HomePage;
