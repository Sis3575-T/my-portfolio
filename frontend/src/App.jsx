import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProjectDetail from './pages/ProjectDetail';
import BlogPost from './pages/BlogPost';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';
import NavbarShowcase from './pages/NavbarShowcase';
import Terminal from './components/Terminal';
import ScrollProgress from './components/common/ScrollProgress';
import LoadingScreen from './components/common/Loader';

function App() {
  const [showTerminal, setShowTerminal] = useState(false);
  const location = useLocation();
  const isShowcase = location.pathname === '/navbar-showcase';

  if (isShowcase) {
    return (
      <div className="min-h-screen flex flex-col">
        <LoadingScreen />
        <Routes>
          <Route path="/navbar-showcase" element={<NavbarShowcase />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LoadingScreen />
      <ScrollProgress />
      <Header onToggleTerminal={() => setShowTerminal(prev => !prev)} />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/navbar-showcase" element={<NavbarShowcase />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
      <AnimatePresence>
        {showTerminal && <Terminal onClose={() => setShowTerminal(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
