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

function HomePage() {
  const [data, setData] = useState({
    loading: true,
    error: null,
    hero: null,
    settings: null,
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
      websiteApi.getHero(),
      websiteApi.getSettings(),
      websiteApi.getProjects(),
      websiteApi.getSkills(),
      websiteApi.getExperience(),
      websiteApi.getEducation(),
      websiteApi.getTestimonials(),
      websiteApi.getServices(),
      websiteApi.getBlog(),
    ])
      .then(([heroRes, settingsRes, projectsRes, skillsRes, expRes, eduRes, testRes, servRes, blogRes]) => {
        setData({
          loading: false,
          error: null,
          hero: heroRes.data.data,
          settings: settingsRes.data.data,
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

  const { hero, settings, projects, skills, experience, education, testimonials, services, blog } = data;

  return (
    <div className="page">
      <Navbar />
      <main>
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
      </main>
      <Footer />
    </div>
  );
}

export default HomePage;
