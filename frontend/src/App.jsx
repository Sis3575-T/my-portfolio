import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ProjectDetail from './pages/ProjectDetail';
import BlogPost from './pages/BlogPost';
import SearchPage from './pages/SearchPage';
import NotFound from './pages/NotFound';
import Terminal from './components/Terminal';

function App() {
  const [showTerminal, setShowTerminal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <Header onToggleTerminal={() => setShowTerminal(prev => !prev)} />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/project/:id" element={<ProjectDetail />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <AnimatePresence>
        {showTerminal && <Terminal onClose={() => setShowTerminal(false)} />}
      </AnimatePresence>
    </div>
  );
}

export default App;
