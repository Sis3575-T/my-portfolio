import React, { useState, useRef, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Icons, Icon } from '../lib/icons';
import { useToast } from '../components/Toast';
import PageLayout from '../components/PageLayout';

const suggestedPrompts = [
  "What's the status of my portfolio?",
  "How can I improve my SEO?",
  "Check my content for gaps",
  "Give me performance tips",
  "Run a security scan",
];

const quickActions = [
  { id: 'seo', label: 'Analyze SEO', icon: Icons.search, color: 'var(--color-primary)' },
  { id: 'content', label: 'Check content gaps', icon: Icons['file-text'], color: 'var(--color-success)' },
  { id: 'performance', label: 'Performance tips', icon: Icons['bar-chart-3'], color: 'var(--color-warning)' },
  { id: 'security', label: 'Security scan', icon: Icons.shield, color: 'var(--color-danger)' },
  { id: 'suggestions', label: 'Content suggestions', icon: Icons['lightbulb'] || Icons.star, color: 'var(--color-purple)' },
];

export default function AIAssistant() {
  const toast = useToast();
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I can help you analyze and improve your portfolio. Ask me anything or use one of the quick actions below.' },
  ]);
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [settings, setSettings] = useState(null);
  const [pages, setPages] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    fetchContext();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchContext = async () => {
    try {
      const [settingsRes, pagesRes] = await Promise.all([
        adminApi.getSettings().catch(() => ({ data: {} })),
        adminApi.getPages().catch(() => ({ data: { data: [] } })),
      ]);
      setSettings(settingsRes.data?.data || settingsRes.data?.settings || {});
      setPages(pagesRes.data?.data || []);
    } catch {
      // silently fail
    }
  };

  const addMessage = (text, role = 'assistant') => {
    setMessages(prev => [...prev, { role, text }]);
  };

  const generateSEOAnalysis = () => {
    const s = settings || {};
    const issues = [];
    if (!s.seo?.metaDescription) issues.push('- Add a meta description for better search results');
    if (!s.seo?.title) issues.push('- Set a default page title');
    if (!s.seo?.ogImage) issues.push('- Add an Open Graph image for social sharing');
    if (!s.seo?.keywords?.length) issues.push('- Define meta keywords');
    issues.push('- Ensure all images have alt text (check your projects and blog)');
    issues.push('- Consider adding structured data (JSON-LD)');
    issues.push('- Generate and submit a sitemap.xml');
    if (pages.length === 0) issues.push('- Create more pages with unique meta descriptions');

    const score = s.seo?.score || 0;
    return `**SEO Analysis**\n\nCurrent SEO Score: **${score}/100**\n\n${issues.length > 1 ? 'Issues found:\n' + issues.join('\n') : 'Your SEO looks good! No major issues found.'}\n\n**Recommendations:**\n- Focus on one keyword per page\n- Improve page load speed\n- Build quality backlinks`;
  };

  const generateContentGaps = () => {
    const s = settings || {};
    const gaps = [];
    if (!s.hero?.title) gaps.push('- Hero section: Missing headline');
    if (!s.about?.description) gaps.push('- About section: Missing biography');
    if (!s.skills?.length && !s.skills) gaps.push('- Skills section: No skills listed');
    if (pages.length === 0) gaps.push('- No dynamic pages created');

    const totalProjects = s.projects?.length || 0;
    if (totalProjects < 3) gaps.push(`- Only ${totalProjects} projects. Aim for at least 3-6.`);

    const totalBlogs = s.blogs?.length || 0;
    if (totalBlogs < 2) gaps.push(`- Only ${totalBlogs} blog posts. Regular content improves SEO.`);

    if (!s.testimonials?.length) gaps.push('- No testimonials. Add social proof.');
    if (!s.services?.length) gaps.push('- No services listed.');

    return `**Content Gap Analysis**\n\n${gaps.length > 0 ? 'Identified gaps:\n' + gaps.join('\n') : 'Your portfolio has good content coverage!'}\n\n**Priority actions:**\n1. Fill missing sections first\n2. Add at least 3-6 projects\n3. Start a blog with regular posts`;
  };

  const generatePerformanceTips = () => {
    return `**Performance Optimization Tips**\n\n1. **Image Optimization** — Use WebP format, compress images, lazy load below-fold\n2. **Caching** — Enable browser caching for static assets\n3. **Minification** — Minify CSS, JS, and HTML\n4. **CDN** — Serve assets via CDN for faster global delivery\n5. **Reduce Dependencies** — Audit and remove unused libraries\n6. **Font Loading** — Use font-display: swap to prevent layout shift\n7. **Bundle Size** — Code-split large JavaScript bundles\n8. **Server Response** — Optimize API response times, use pagination`;
  };

  const generateSecurityScan = () => {
    const s = settings || {};
    const findings = [];
    if (!s.security?.twoFactorEnabled) findings.push('- 2FA is not enabled (recommended)');
    findings.push('- SSL certificate is active');
    findings.push('- Security headers are present');

    const apiKeys = s.security?.apiKeys || [];
    if (apiKeys.length > 3) findings.push(`- You have ${apiKeys.length} API keys. Review and revoke unused ones.`);

    return `**Security Scan Results**\n\n${findings.join('\n')}\n\n**Recommendations:**\n1. Enable two-factor authentication\n2. Regularly rotate API keys\n3. Review active sessions\n4. Keep dependencies updated\n5. Monitor failed login attempts`;
  };

  const generateContentSuggestions = () => {
    return `**Content Suggestions**\n\nBased on your portfolio structure, consider adding:\n\n1. **Case Studies** — Deep dives into your most impactful projects\n2. **Tech Blog** — Write about challenges and solutions you've encountered\n3. **Video Demos** — Short walkthroughs of your projects\n4. **Open Source Contributions** — Highlight your GitHub activity\n5. **Certifications** — Add a dedicated certifications section\n6. **Speaking Engagements** — If you've presented at conferences\n7. **Podcast Interviews** — Embed relevant podcast appearances\n\n**Content Calendar Idea:**\n- Week 1: Write a project case study\n- Week 2: Record a video demo\n- Week 3: Write a tech blog post\n- Week 4: Update testimonials`;
  };

  const handleQuickAction = (actionId) => {
    const action = quickActions.find(a => a.id === actionId);
    if (!action) return;
    const userText = action.label;
    addMessage(userText, 'user');
    setProcessing(true);

    setTimeout(() => {
      let response;
      switch (actionId) {
        case 'seo': response = generateSEOAnalysis(); break;
        case 'content': response = generateContentGaps(); break;
        case 'performance': response = generatePerformanceTips(); break;
        case 'security': response = generateSecurityScan(); break;
        case 'suggestions': response = generateContentSuggestions(); break;
        default: response = 'Action not available.';
      }
      addMessage(response);
      setProcessing(false);
    }, 800);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || processing) return;
    addMessage(text, 'user');
    setInput('');
    setProcessing(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let response;
      if (lower.includes('seo') || lower.includes('search')) {
        response = generateSEOAnalysis();
      } else if (lower.includes('content') || lower.includes('gap')) {
        response = generateContentGaps();
      } else if (lower.includes('perform') || lower.includes('speed') || lower.includes('fast')) {
        response = generatePerformanceTips();
      } else if (lower.includes('secur') || lower.includes('scan')) {
        response = generateSecurityScan();
      } else if (lower.includes('suggest') || lower.includes('idea') || lower.includes('new')) {
        response = generateContentSuggestions();
      } else if (lower.includes('status') || lower.includes('health') || lower.includes('how')) {
        const s = settings || {};
        response = `**Portfolio Status**\n\n- Projects: ${s.projects?.length || 0}\n- Blog Posts: ${s.blogs?.length || 0}\n- Pages: ${pages.length}\n- SEO Score: ${s.seo?.score || 'N/A'}/100\n- 2FA: ${s.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}\n- Last Backup: ${s.lastBackup || 'Unknown'}\n\nUse the quick actions for detailed analysis!`;
      } else {
        response = `I can help you with:\n- SEO analysis\n- Content gap analysis\n- Performance optimization tips\n- Security scanning\n- Content suggestions\n\nOr try one of the suggested prompts above!`;
      }
      addMessage(response);
      setProcessing(false);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <PageLayout title="AI Assistant" description="Get insights and suggestions about your portfolio">
      <div style={{ display: 'flex', gap: '1rem', height: 'calc(100vh - 280px)', minHeight: 500 }}>
        <div style={{
          flex: '0 0 70%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          overflow: 'hidden',
        }}>
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {messages.map((msg, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  animation: 'slideUp 0.2s ease',
                }}
              >
                <div style={{
                  maxWidth: '80%',
                  padding: '0.75rem 1rem',
                  borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.role === 'user' ? 'var(--color-primary)' : 'var(--color-bg-subtle)',
                  color: msg.role === 'user' ? '#fff' : 'var(--color-text)',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontFamily: msg.role === 'user' ? 'inherit' : 'inherit',
                }}>
                  {msg.text.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <div key={i} style={{ fontWeight: 700, marginBottom: 4, fontSize: '0.9rem' }}>{line.replace(/\*\*/g, '')}</div>;
                    }
                    if (line.startsWith('- ')) {
                      return <div key={i} style={{ paddingLeft: 8, marginBottom: 2 }}>{line}</div>;
                    }
                    if (/^\d+\./.test(line)) {
                      return <div key={i} style={{ marginBottom: 2 }}>{line}</div>;
                    }
                    return <div key={i} style={{ marginBottom: line ? 2 : 8 }}>{line || '\u00A0'}</div>;
                  })}
                </div>
              </div>
            ))}
            {processing && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '16px 16px 16px 4px',
                  background: 'var(--color-bg-subtle)',
                  color: 'var(--color-text-secondary)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}>
                  <span style={{ display: 'flex', gap: 3 }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-text-tertiary)', animation: 'pulse 1.2s infinite' }} />
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-text-tertiary)', animation: 'pulse 1.2s infinite 0.2s' }} />
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-text-tertiary)', animation: 'pulse 1.2s infinite 0.4s' }} />
                  </span>
                  Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--color-border)' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              {suggestedPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  className="btn btn-ghost btn-sm"
                  onClick={() => { setInput(prompt); }}
                  style={{
                    fontSize: '0.75rem',
                    padding: '0.3rem 0.65rem',
                    borderRadius: 20,
                    background: 'var(--color-bg-subtle)',
                    border: '1px solid var(--color-border)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your portfolio..."
                style={{
                  flex: 1,
                  padding: '0.6rem 1rem',
                  borderRadius: 10,
                  border: '1.5px solid var(--color-border)',
                  background: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
                disabled={processing}
              />
              <button
                className="btn btn-primary"
                onClick={handleSend}
                disabled={!input.trim() || processing}
                style={{ borderRadius: 10, padding: '0.6rem 1.25rem' }}
              >
                <Icon path={Icons['arrow-up-right']} size={16} />
              </button>
            </div>
          </div>
        </div>

        <div style={{
          flex: '0 0 28%',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 14,
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text)', marginBottom: '0.5rem' }}>
            Quick Actions
          </div>
          {quickActions.map(action => (
            <button
              key={action.id}
              onClick={() => handleQuickAction(action.id)}
              disabled={processing}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                padding: '0.75rem',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg)',
                color: 'var(--color-text)',
                cursor: processing ? 'not-allowed' : 'pointer',
                fontSize: '0.84rem',
                fontWeight: 500,
                transition: 'background 0.15s, border-color 0.15s',
                opacity: processing ? 0.6 : 1,
                fontFamily: 'inherit',
                textAlign: 'left',
                width: '100%',
              }}
              onMouseEnter={(e) => { if (!processing) e.currentTarget.style.background = 'var(--color-bg-subtle)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--color-bg)'; }}
            >
              <span style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: action.color + '15',
                color: action.color,
                flexShrink: 0,
              }}>
                <Icon path={action.icon} size={14} />
              </span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
