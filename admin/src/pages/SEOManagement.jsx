import React, { useState, useEffect, useMemo } from 'react';
import { adminApi, imageUrl } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';
import Toolbar from '../components/Toolbar';

const OG_IMAGE_SIZE_LIMIT = 5 * 1024 * 1024;

export default function SEOManagement() {
  const toast = useToast();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [saving, setSaving] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');

  const [form, setForm] = useState({
    metaTitle: '',
    metaDescription: '',
    metaKeywords: [],
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    canonicalUrl: '',
    robotsIndex: 'index',
    robotsFollow: 'follow',
    structuredData: '',
  });

  const [originalForm, setOriginalForm] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.getSEO();
      setPages(data.data || []);
    } catch {
      toast.error('Failed to load SEO data');
    } finally {
      setLoading(false);
    }
  };

  const selectPage = (page) => {
    setSelectedPage(page);
    setActiveTab('General');
    const f = {
      metaTitle: page.metaTitle || '',
      metaDescription: page.metaDescription || '',
      metaKeywords: page.metaKeywords || [],
      ogTitle: page.ogTitle || '',
      ogDescription: page.ogDescription || '',
      ogImage: page.ogImage || '',
      twitterCard: page.twitterCard || 'summary_large_image',
      canonicalUrl: page.canonicalUrl || '',
      robotsIndex: page.robotsIndex || 'index',
      robotsFollow: page.robotsFollow || 'follow',
      structuredData: page.structuredData || '',
    };
    setForm(f);
    setOriginalForm(f);
    setKeywordsInput((page.metaKeywords || []).join(', '));
  };

  const hasChanges = useMemo(() => {
    if (!originalForm || !selectedPage) return false;
    return Object.keys(form).some(k => form[k] !== originalForm[k]);
  }, [form, originalForm, selectedPage]);

  const handleSave = async () => {
    if (!selectedPage) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        metaKeywords: keywordsInput.split(',').map(k => k.trim()).filter(Boolean),
      };
      await adminApi.updateSEO(selectedPage.page || selectedPage._id, payload);
      toast.success(`${selectedPage.page || 'Page'} SEO updated`);
      setPages(prev => prev.map(p => (p._id === selectedPage._id || p.page === selectedPage.page) ? { ...p, ...payload } : p));
      setOriginalForm({ ...payload });
    } catch {
      toast.error('Failed to save SEO');
    } finally {
      setSaving(false);
    }
  };

  const handleOgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > OG_IMAGE_SIZE_LIMIT) { toast.error('Image must be under 5MB'); return; }
    e.target.value = '';
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data: uploadRes } = await adminApi.uploadMedia(formData);
      const url = uploadRes.data?.url || uploadRes.url;
      setForm({ ...form, ogImage: url });
    } catch {
      toast.error('Upload failed');
    }
  };

  const calculateScore = (page) => {
    if (!page) return { score: 0, items: [] };
    let score = 0;
    const items = [];
    if (page.metaTitle) { score += 20; items.push({ pass: true, text: 'Meta title is set' }); } else { items.push({ pass: false, text: 'Meta title is missing' }); }
    if (page.metaTitle && page.metaTitle.length >= 30 && page.metaTitle.length <= 60) { score += 10; items.push({ pass: true, text: 'Meta title length is optimal (30-60 chars)' }); } else if (page.metaTitle) { items.push({ pass: false, text: 'Meta title length should be 30-60 chars' }); }
    if (page.metaDescription) { score += 20; items.push({ pass: true, text: 'Meta description is set' }); } else { items.push({ pass: false, text: 'Meta description is missing' }); }
    if (page.metaDescription && page.metaDescription.length >= 120 && page.metaDescription.length <= 160) { score += 10; items.push({ pass: true, text: 'Meta description length is optimal (120-160 chars)' }); } else if (page.metaDescription) { items.push({ pass: false, text: 'Meta description length should be 120-160 chars' }); }
    if (page.metaKeywords && page.metaKeywords.length > 0) { score += 10; items.push({ pass: true, text: 'Meta keywords are set' }); } else { items.push({ pass: false, text: 'Meta keywords are missing' }); }
    if (page.ogTitle) { score += 10; items.push({ pass: true, text: 'Open Graph title is set' }); } else { items.push({ pass: false, text: 'Open Graph title is missing' }); }
    if (page.ogDescription) { score += 10; items.push({ pass: true, text: 'Open Graph description is set' }); } else { items.push({ pass: false, text: 'Open Graph description is missing' }); }
    if (page.ogImage) { score += 10; items.push({ pass: true, text: 'Open Graph image is set' }); } else { items.push({ pass: false, text: 'Open Graph image is missing' }); }
    if (page.canonicalUrl) { score += 10; items.push({ pass: true, text: 'Canonical URL is set' }); } else { items.push({ pass: false, text: 'Canonical URL is missing' }); }
    const totalPages = pages.length || 1;
    const totalOptimized = pages.filter(p => p.metaTitle && p.metaDescription).length;
    return { score: Math.min(100, score), items, totalOptimized };
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 50) return '#F59E0B';
    return 'var(--color-danger)';
  };

  const missingMeta = pages.filter(p => !p.metaTitle || !p.metaDescription).length;
  const missingOG = pages.filter(p => !p.ogTitle || !p.ogDescription).length;
  const avgScore = pages.length > 0 ? Math.round(pages.reduce((acc, p) => {
    const s = calculateScore(p).score;
    return acc + s;
  }, 0) / pages.length) : 0;

  const stats = [
    { label: 'Total Pages', value: pages.length, icon: Icons['file-text'], color: 'blue' },
    { label: 'Missing Meta', value: missingMeta, icon: Icons['alert-triangle'], color: 'red' },
    { label: 'Missing OG Tags', value: missingOG, icon: Icons.share2 || Icons['alert-circle'], color: 'yellow' },
    { label: 'Avg Score', value: `${avgScore}%`, icon: Icons.award, color: avgScore >= 80 ? 'green' : avgScore >= 50 ? 'yellow' : 'red' },
  ];

  const tabs = ['General', 'Social', 'Advanced', 'Preview', 'Score'];

  return (
    <PageLayout
      title="SEO Management"
      description="Optimize your pages for search engines and social sharing"
      stats={stats}
    >
      <Toolbar
        onRefresh={fetchData}
        onExportCSV={() => {
          const csv = [['Page','Meta Title','Meta Description','Score'].join(',')];
          pages.forEach(p => {
            const s = calculateScore(p).score;
            csv.push([p.page || p._id, `"${(p.metaTitle || '').replace(/"/g, '""')}"`, `"${(p.metaDescription || '').replace(/"/g, '""')}"`, s].join(','));
          });
          const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a'); a.href = url; a.download = 'seo.csv'; a.click();
          URL.revokeObjectURL(url);
          toast.success('SEO data exported');
        }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1rem', minHeight: 'calc(100vh - 280px)' }}>
        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontWeight: 700, fontSize: '0.82rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Pages
          </div>
          <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 380px)' }}>
            {loading ? (
              <div style={{ padding: '1rem' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="skeleton" style={{ height: 56, marginBottom: 6, borderRadius: 8 }} />
                ))}
              </div>
            ) : pages.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-tertiary)' }}>
                <Icon path={Icons['file-text']} size={36} />
                <p style={{ fontSize: '0.84rem' }}>No pages found</p>
              </div>
            ) : (
              pages.map(page => {
                const isSelected = selectedPage && (selectedPage._id === page._id || selectedPage.page === page.page);
                const score = calculateScore(page).score;
                return (
                  <div
                    key={page._id}
                    onClick={() => selectPage(page)}
                    style={{
                      padding: '0.75rem 1rem', cursor: 'pointer', borderBottom: '1px solid var(--color-border-light)',
                      background: isSelected ? 'var(--color-primary-subtle)' : 'transparent',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
                    onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--color-text)', textTransform: 'capitalize' }}>
                        {page.page || 'Unknown Page'}
                      </span>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        width: 28, height: 28, borderRadius: '50%', fontSize: '0.72rem', fontWeight: 700,
                        color: '#fff', background: getScoreColor(score),
                      }}>
                        {score}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--color-text-tertiary)', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {page.metaTitle || 'No meta title set'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 14, overflow: 'hidden' }}>
          {selectedPage ? (
            <>
              <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
                {tabs.map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1, padding: '0.65rem 0.5rem', border: 'none', background: activeTab === tab ? 'var(--color-primary-subtle)' : 'transparent',
                      color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                      fontWeight: activeTab === tab ? 700 : 500, fontSize: '0.78rem', cursor: 'pointer',
                      borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                      transition: 'all 0.15s', textTransform: 'capitalize',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div style={{ padding: '1.5rem 2rem', overflow: 'auto', maxHeight: 'calc(100vh - 420px)' }}>
                {activeTab === 'General' && (
                  <div>
                    <div className="form-group">
                      <label>Meta Title</label>
                      <input
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                        placeholder="Enter meta title"
                        maxLength={70}
                      />
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: 4, textAlign: 'right' }}>
                        {form.metaTitle.length}/70
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Meta Description</label>
                      <textarea
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                        placeholder="Enter meta description"
                        rows={3}
                        maxLength={320}
                      />
                      <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', marginTop: 4, textAlign: 'right' }}>
                        {form.metaDescription.length}/320
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Keywords (comma-separated)</label>
                      <input
                        value={keywordsInput}
                        onChange={(e) => setKeywordsInput(e.target.value)}
                        placeholder="seo, keywords, optimization"
                      />
                      {keywordsInput && (
                        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: 6 }}>
                          {keywordsInput.split(',').map((k, i) => k.trim() ? (
                            <span key={i} style={{ padding: '2px 8px', background: 'var(--color-primary-subtle)', color: 'var(--color-primary)', borderRadius: 4, fontSize: '0.76rem', fontWeight: 500 }}>
                              {k.trim()}
                            </span>
                          ) : null)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'Social' && (
                  <div>
                    <div className="form-group">
                      <label>Open Graph Title</label>
                      <input
                        value={form.ogTitle}
                        onChange={(e) => setForm({ ...form, ogTitle: e.target.value })}
                        placeholder="OG Title (defaults to meta title)"
                      />
                    </div>
                    <div className="form-group">
                      <label>Open Graph Description</label>
                      <textarea
                        value={form.ogDescription}
                        onChange={(e) => setForm({ ...form, ogDescription: e.target.value })}
                        placeholder="OG Description (defaults to meta description)"
                        rows={3}
                      />
                    </div>
                    <div className="form-group">
                      <label>Open Graph Image</label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                        {form.ogImage && (
                          <div style={{ width: 120, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--color-border)', flexShrink: 0 }}>
                            <img src={imageUrl(form.ogImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', border: '2px dashed var(--color-border)', borderRadius: 8, cursor: 'pointer', color: 'var(--color-text-secondary)', fontSize: '0.85rem', background: 'var(--color-bg-subtle)' }}>
                          <Icon path={Icons.upload} size={14} />
                          {form.ogImage ? 'Replace' : 'Upload Image'}
                          <input type="file" accept="image/*" onChange={handleOgImageUpload} style={{ display: 'none' }} />
                        </label>
                        {form.ogImage && (
                          <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => setForm({ ...form, ogImage: '' })}>
                            <Icon path={Icons.x} size={14} /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Twitter Card Type</label>
                      <select value={form.twitterCard} onChange={(e) => setForm({ ...form, twitterCard: e.target.value })}>
                        <option value="summary">Summary</option>
                        <option value="summary_large_image">Summary Large Image</option>
                        <option value="app">App</option>
                        <option value="player">Player</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'Advanced' && (
                  <div>
                    <div className="form-group">
                      <label>Canonical URL</label>
                      <input
                        value={form.canonicalUrl}
                        onChange={(e) => setForm({ ...form, canonicalUrl: e.target.value })}
                        placeholder="https://example.com/page"
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>Robots Index</label>
                        <select value={form.robotsIndex} onChange={(e) => setForm({ ...form, robotsIndex: e.target.value })}>
                          <option value="index">Index</option>
                          <option value="noindex">No Index</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Robots Follow</label>
                        <select value={form.robotsFollow} onChange={(e) => setForm({ ...form, robotsFollow: e.target.value })}>
                          <option value="follow">Follow</option>
                          <option value="nofollow">No Follow</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Structured Data (JSON-LD)</label>
                      <textarea
                        value={form.structuredData}
                        onChange={(e) => setForm({ ...form, structuredData: e.target.value })}
                        placeholder='{"@context": "https://schema.org", ...}'
                        rows={8}
                        style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.82rem' }}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'Preview' && (
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Google Search Preview</h4>
                    <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--color-border)', borderRadius: 10, background: 'var(--color-bg-subtle)', marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>
                        {selectedPage.page ? `${selectedPage.page.charAt(0).toUpperCase() + selectedPage.page.slice(1)}` : 'Page'} {'>'} {window.location.hostname}
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1a0dab', marginBottom: 2, cursor: 'pointer' }}>
                        {form.metaTitle || selectedPage.page || 'Page Title'}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#006621', marginBottom: 4, wordBreak: 'break-all' }}>
                        {form.canonicalUrl || `${window.location.origin}/${selectedPage.page || ''}`}
                      </div>
                      <div style={{ fontSize: '0.84rem', color: '#545454', lineHeight: 1.4 }}>
                        {form.metaDescription || 'This page does not have a meta description.'}
                      </div>
                    </div>

                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '1rem' }}>Social Share Preview</h4>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 10, overflow: 'hidden', maxWidth: 400 }}>
                      {form.ogImage && (
                        <div style={{ width: '100%', height: 200, background: 'var(--color-bg-subtle)' }}>
                          <img src={imageUrl(form.ogImage)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      )}
                      <div style={{ padding: '0.75rem 1rem' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>
                          {window.location.hostname}
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: 4 }}>
                          {form.ogTitle || form.metaTitle || selectedPage.page || 'Title'}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                          {form.ogDescription || form.metaDescription || 'No description'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Score' && (
                  <div>
                    {(() => {
                      const result = calculateScore(selectedPage);
                      return (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                            <div style={{
                              width: 96, height: 96, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              border: `4px solid ${getScoreColor(result.score)}`, fontSize: '1.8rem', fontWeight: 800, color: getScoreColor(result.score),
                            }}>
                              {result.score}
                            </div>
                            <div>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-text)', margin: '0 0 4px' }}>
                                {result.score >= 80 ? 'Great!' : result.score >= 50 ? 'Needs Work' : 'Poor'}
                              </h3>
                              <p style={{ fontSize: '0.84rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                                {result.score >= 80 ? 'Your page is well optimized for search engines.' :
                                 result.score >= 50 ? 'Some improvements can be made to boost your SEO.' :
                                 'Major SEO improvements are needed.'}
                              </p>
                            </div>
                          </div>
                          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.75rem' }}>Recommendations</h4>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {result.items.map((item, i) => (
                              <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.85rem',
                                borderRadius: 8, background: item.pass ? 'var(--color-success-subtle, rgba(16,185,129,0.08))' : 'var(--color-danger-subtle, rgba(239,68,68,0.08))',
                                border: `1px solid ${item.pass ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                              }}>
                                <Icon path={item.pass ? Icons['check-circle'] : Icons['alert-circle']} size={16} style={{ color: item.pass ? 'var(--color-success)' : 'var(--color-danger)', flexShrink: 0 }} />
                                <span style={{ fontSize: '0.84rem', color: 'var(--color-text)', flex: 1 }}>{item.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}

                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                  <button className="btn btn-outline" onClick={() => selectPage(selectedPage)} disabled={!hasChanges}>
                    Reset
                  </button>
                  <button className="btn btn-primary" onClick={handleSave} disabled={!hasChanges || saving}>
                    {saving ? 'Saving...' : <><Icon path={Icons.save} size={14} /> Save Changes</>}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '4rem 2rem', color: 'var(--color-text-tertiary)', height: '100%' }}>
              <Icon path={Icons.globe} size={48} />
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0 }}>Select a page</h3>
              <p style={{ fontSize: '0.84rem', margin: 0, textAlign: 'center' }}>Choose a page from the list to edit its SEO settings.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
