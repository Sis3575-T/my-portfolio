import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiSearch, FiArrowRight } from 'react-icons/fi';
import { FaFolder, FaGithub, FaExternalLinkAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { publicApi, imageUrl } from '../utils/api';

function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [projects, setProjects] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await publicApi.getProjects({ limit: 50 });
        setProjects(data.data || []);
      } catch { /* ignore */ }
      setLoaded(true);
    };
    fetch();
  }, []);

  const results = useMemo(() => {
    if (!query.trim()) return projects;
    const q = query.toLowerCase();
    return projects.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      (p.technologies || []).some(t => t.toLowerCase().includes(q))
    );
  }, [query, projects]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <Helmet>
        <title>{query ? `Search: ${query} | Sisay Temesgen` : 'Search | Sisay Temesgen'}</title>
      </Helmet>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSearch} className="mb-10">
          <div className="flex items-center gap-3 p-4 rounded-xl"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <FiSearch size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search projects by title, technology, or description..."
              className="flex-1 bg-transparent border-none outline-none text-base"
              style={{ color: 'var(--text-white)', fontFamily: 'inherit' }}
              autoFocus
            />
            <button
              type="submit"
              className="px-5 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer transition-all"
              style={{
                background: 'var(--primary-color)',
                color: '#fff',
              }}
            >
              Search
            </button>
          </div>
        </form>

        {loaded && (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
            {query ? `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"` : `Showing all ${results.length} projects`}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {results.map((project, idx) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="rounded-xl overflow-hidden transition-all duration-300"
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                backdropFilter: 'blur(20px)',
              }}
            >
              <div className="h-40 overflow-hidden" style={{ background: 'rgba(124, 58, 237, 0.06)' }}>
                {project.thumbnail ? (
                  <img src={imageUrl(project.thumbnail)} alt={project.title} className="w-full h-full object-cover" />
                ) : project.images && project.images.length > 0 ? (
                  <img src={imageUrl(project.images[0])} alt={project.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaFolder size={40} style={{ color: 'var(--primary-color)', opacity: 0.3 }} />
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-white)' }}>{project.title}</h3>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-light)', lineHeight: 1.6 }}>{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {(project.technologies || []).slice(0, 3).map(tech => (
                    <span key={tech} className="px-2 py-0.5 text-xs font-medium rounded"
                      style={{
                        background: 'rgba(34, 211, 238, 0.1)',
                        color: 'var(--primary-color)',
                        border: '1px solid rgba(34, 211, 238, 0.15)',
                      }}
                    >{tech}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Link to={`/project/${project._id}`} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold no-underline transition-all"
                    style={{
                      background: 'var(--primary-color)',
                      color: '#fff',
                    }}
                  >
                    View Details <FiArrowRight size={13} />
                  </Link>
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-light)' }}>
                      <FaGithub size={18} />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--text-light)' }}>
                      <FaExternalLinkAlt size={14} />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {loaded && results.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl mb-2" style={{ color: 'var(--text-white)' }}>No results found</p>
            <p style={{ color: 'var(--text-muted)' }}>Try searching for different keywords or browse all projects above.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchPage;
