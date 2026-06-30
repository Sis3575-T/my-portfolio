import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import api, { adminApi, imageUrl } from '../services/api';
import SectionRenderer from './SectionRenderer';
import { useToast } from './Toast';

const DEVICE_PRESETS = {
  desktop: { width: '100%', maxWidth: '100%', scale: 1, padding: 0, shadow: 'none', radius: 0, minHeight: 'auto' },
  tablet: { width: '768px', maxWidth: '100%', scale: 0.82, padding: '20px', shadow: '0 4px 24px rgba(0,0,0,0.12)', radius: 12, minHeight: '800px' },
  mobile: { width: '375px', maxWidth: '100%', scale: 0.7, padding: '20px', shadow: '0 4px 24px rgba(0,0,0,0.15)', radius: 12, minHeight: '700px' },
};

const DATA_FETCHERS = {
  hero: () => adminApi.getHero(),
  about: () => adminApi.getAbout(),
  projects: () => adminApi.getProjects(),
  skills: () => adminApi.getSkills(),
  experience: () => adminApi.getExperiences(),
  education: () => adminApi.getEducation(),
  certificates: () => adminApi.getCertificates(),
  testimonials: () => adminApi.getTestimonials(),
  services: () => adminApi.getServices(),
  blog: () => adminApi.getBlogs(),
  timeline: () => (adminApi.getTimeline ? adminApi.getTimeline() : Promise.resolve({ data: [] })),
  contact: () => Promise.resolve({ data: null }),
  gallery: () => Promise.resolve({ data: null }),
  faq: () => Promise.resolve({ data: null }),
  cta: () => Promise.resolve({ data: null }),
  statistics: () => Promise.resolve({ data: null }),
  custom: () => Promise.resolve({ data: null }),
};

function SectionLoadError({ type, message, onRetry }) {
  return (
    <div style={{ padding: '40px 20px', textAlign: 'center', border: '1px dashed var(--color-danger)', borderRadius: 8, margin: '8px 16px' }}>
      <p style={{ fontSize: '0.82rem', color: 'var(--color-danger)', margin: '0 0 8px' }}>
        Failed to load {type} data: {message}
      </p>
      <button onClick={onRetry} style={{ padding: '4px 12px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
        Retry
      </button>
    </div>
  );
}

function SectionLoadSkeleton({ type }) {
  return (
    <div style={{ padding: '60px 20px', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 8, margin: '8px 16px', background: 'var(--color-bg-subtle)' }}>
      <div className="skeleton" style={{ width: '40%', height: 24, margin: '0 auto 16px', borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div className="skeleton" style={{ width: '60%', height: 14, margin: '0 auto 12px', borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div className="skeleton" style={{ width: '30%', height: 14, margin: '0 auto', borderRadius: 6, background: 'linear-gradient(90deg, var(--color-gray-100) 25%, var(--color-gray-200) 50%, var(--color-gray-100) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', marginTop: 16 }}>
        Loading {type} section data...
      </div>
    </div>
  );
}

export default function SitePreviewRenderer({ pageId, sections: propSections, device = 'desktop', editable, onEdit }) {
  const toast = useToast();
  const [sections, setSections] = useState(propSections || []);
  const [dataCache, setDataCache] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sectionErrors, setSectionErrors] = useState({});
  const [sectionLoading, setSectionLoading] = useState({});
  const containerRef = useRef(null);
  const dataFetchedRef = useRef(false);

  useEffect(() => {
    if (propSections && Array.isArray(propSections)) {
      setSections(propSections);
      return;
    }
    if (pageId) {
      loadPageSections(pageId);
    } else {
      setSections([]);
    }
  }, [pageId, propSections]);

  const loadPageSections = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/pages/${id}/components`);
      const comps = data.data || [];
      setSections(comps.map((c, i) => ({
        ...c,
        id: c._id || c.id || `sec_${i}_${Date.now()}`,
        order: c.order ?? i,
      })));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load page components';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchSectionData = useCallback(async (type, retryCount = 0) => {
    const fetcher = DATA_FETCHERS[type];
    if (!fetcher) return null;
    setSectionLoading(prev => ({ ...prev, [type]: true }));
    setSectionErrors(prev => ({ ...prev, [type]: null }));
    try {
      const result = await fetcher();
      const resData = result?.data?.data || result?.data || [];
      const normalized = Array.isArray(resData) ? resData : resData;
      setDataCache(prev => ({ ...prev, [type]: normalized }));
      return normalized;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Load failed';
      setSectionErrors(prev => ({ ...prev, [type]: msg }));
      if (retryCount < 2) {
        await new Promise(r => setTimeout(r, 1000));
        return fetchSectionData(type, retryCount + 1);
      }
      return null;
    } finally {
      setSectionLoading(prev => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    if (!sections || sections.length === 0 || dataFetchedRef.current) return;
    const types = [...new Set(sections.map(s => s.type).filter(Boolean))];
    if (types.length === 0) return;
    dataFetchedRef.current = true;
    types.forEach(type => {
      fetchSectionData(type);
    });
  }, [sections, fetchSectionData]);

  const visible = useCallback((section) => {
    if (section.visible === false) return false;
    const r = section.responsive || {};
    const d = r[device] || {};
    if (d.visible === false) return false;
    return true;
  }, [device]);

  const visibleSections = useMemo(() =>
    sections.filter(visible).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [sections, visible]
  );

  const devicePreset = DEVICE_PRESETS[device] || DEVICE_PRESETS.desktop;

  const mergeSectionProps = useCallback((section) => ({
    ...section,
    style: { ...(section.style || {}), ...(section.styles || {}) },
    layout: { ...(section.layout || {}), ...(section.data?.layout || {}), ...(section.layout || {}) },
    content: { ...(section.content || {}), ...(section.data || {}) },
    media: { ...(section.media || {}) },
    seo: { ...(section.seo || {}) },
    animation: { ...(section.animation || {}) },
    responsive: { ...(section.responsive || {}) },
    permissions: { ...(section.permissions || {}) },
    analytics: { ...(section.analytics || {}) },
    advanced: { ...(section.advanced || {}) },
  }), []);

  if (loading && sections.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-tertiary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '0.85rem' }}>Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error && sections.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-tertiary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12, opacity: 0.5 }}>!</div>
          <p style={{ fontSize: '0.9rem', color: 'var(--color-danger)', marginBottom: 8 }}>{error}</p>
          <button className="btn btn-ghost btn-sm" onClick={() => { dataFetchedRef.current = false; pageId && loadPageSections(pageId); }} style={{ marginTop: 4 }}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400, color: 'var(--color-text-tertiary)' }}>
        <div style={{ textAlign: 'center' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3, marginBottom: 16 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" />
          </svg>
          <p style={{ fontSize: '0.9rem', marginBottom: 4 }}>No sections found</p>
          <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Add sections to this page to see a preview</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{
      background: device === 'desktop' ? '#f5f5f5' : '#e8e8e8',
      padding: devicePreset.padding || 0,
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: device === 'desktop' ? 'stretch' : 'center',
      transition: 'all 0.3s ease',
    }}>
      <div style={{
        width: devicePreset.width,
        maxWidth: devicePreset.maxWidth,
        background: '#fff',
        minHeight: device === 'desktop' ? '100%' : devicePreset.minHeight,
        boxShadow: devicePreset.shadow || 'none',
        borderRadius: devicePreset.radius || 0,
        overflow: 'hidden',
        transform: device !== 'desktop' ? `scale(${devicePreset.scale})` : 'none',
        transformOrigin: 'top center',
        transition: 'all 0.3s ease',
      }}>
        {visibleSections.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
            <p style={{ fontSize: '0.9rem' }}>All sections are hidden on {device}</p>
            <p style={{ fontSize: '0.78rem', marginTop: 4, opacity: 0.7 }}>Adjust visibility in the Responsive tab</p>
          </div>
        )}
        {visibleSections.map((section, idx) => {
          const type = section.type;
          const isLoading = sectionLoading[type];
          const hasError = sectionErrors[type];
          const sectionData = dataCache[type];

          if (hasError && !sectionData) {
            return (
              <SectionLoadError
                key={section.id || idx}
                type={type}
                message={hasError}
                onRetry={() => { setSectionErrors(prev => ({ ...prev, [type]: null })); fetchSectionData(type); }}
              />
            );
          }

          if (isLoading && !sectionData) {
            return <SectionLoadSkeleton key={section.id || idx} type={type} />;
          }

          return (
            <SectionRenderer
              key={section.id || section._id || idx}
              section={mergeSectionProps(section)}
              data={sectionData}
              editable={editable}
              onEdit={onEdit}
            />
          );
        })}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
