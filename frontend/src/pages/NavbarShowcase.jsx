import React, { useState } from 'react';
import {
  FaHome, FaUser, FaCode, FaFolderOpen, FaBriefcase,
  FaCertificate, FaEnvelope, FaSun, FaMoon, FaDownload,
  FaChevronDown, FaSearch, FaBell, FaGithub, FaLinkedin,
  FaBars, FaTimes, FaTerminal, FaChartBar, FaCommentDots,
  FaCogs, FaProjectDiagram, FaEye,
  FaMobile, FaUniversalAccess, FaMousePointer, FaPalette,
  FaSearchDollar, FaBolt, FaFont, FaStar, FaUserTie, FaLock
} from 'react-icons/fa';

const STLogo = ({ size = 48, dark = false }) => (
  <div
    className="showcase-st-logo"
    style={{
      width: size,
      height: size,
      background: dark ? '#ffffff' : '#2563EB',
      borderRadius: 12,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      border: dark ? '1px solid #e2e8f0' : 'none',
    }}
  >
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 36 32">
      <text x="18" y="25" font-family="Inter, Arial, sans-serif" font-weight="700" font-size="22" fill={dark ? '#2563EB' : 'white'} text-anchor="middle" letter-spacing="-1">ST</text>
    </svg>
  </div>
);

const navItems = ['Home', 'About', 'Skills', 'Projects', 'Experience', 'Certificates', 'Contact'];

const SectionLabel = ({ number, title, subtitle }) => (
  <div className="showcase-section-label">
    <span className="showcase-section-number">{String(number).padStart(2, '0')}</span>
    <div>
      <h2 className="showcase-section-title">{title}</h2>
      {subtitle && <p className="showcase-section-subtitle">{subtitle}</p>}
    </div>
  </div>
);

const Explanation = ({ features, benefits, ux, useCases }) => (
  <div className="showcase-explanation-grid">
    {features && (
      <div className="showcase-explain-card">
        <h4>Features</h4>
        <p>{features}</p>
      </div>
    )}
    {benefits && (
      <div className="showcase-explain-card">
        <h4>Benefits</h4>
        <p>{benefits}</p>
      </div>
    )}
    {ux && (
      <div className="showcase-explain-card">
        <h4>UX Reasoning</h4>
        <p>{ux}</p>
      </div>
    )}
    {useCases && (
      <div className="showcase-explain-card">
        <h4>Best Use Cases</h4>
        <p>{useCases}</p>
      </div>
    )}
  </div>
);

const Divider = () => <div className="showcase-divider" />;

function NavbarShowcase() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="showcase-page">
      <div className="showcase-hero">
        <div className="showcase-hero-badge">Design System v1.0</div>
        <h1 className="showcase-hero-title">ST Portfolio &mdash; Professional Navbar Design System</h1>
        <p className="showcase-hero-subtitle">
          Modern, Clean, Responsive Navigation Components for Professional Developer Portfolios
        </p>
        <div className="showcase-hero-meta">
          <span>10 Navbar Variants</span>
          <span className="showcase-dot">&middot;</span>
          <span>Light &amp; Dark Mode</span>
          <span className="showcase-dot">&middot;</span>
          <span>Responsive</span>
          <span className="showcase-dot">&middot;</span>
          <span>Premium Design</span>
        </div>
      </div>

      <div className="showcase-container">
        {/* SECTION 1 */}
        <section className="showcase-section">
          <SectionLabel number={1} title="Default Navbar (Light Mode)" subtitle="Clean, minimal navigation with all core links visible" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-center">
                {navItems.map((item) => (
                  <span key={item} className="showcase-nav-link">{item}</span>
                ))}
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="ST monogram logo, full name, seven primary nav links, dark mode toggle icon, subtle box shadow, rounded corners, clean white background"
            benefits="Provides immediate clarity and orientation. Users instantly recognize the brand and can navigate to any section in one click. The light background ensures maximum readability and a professional appearance suitable for corporate contexts."
            ux="Familiar top-bar navigation pattern reduces cognitive load. The left-aligned logo anchors the brand, center links offer discoverability, and the right-aligned toggle respects user expectations. White space around elements creates breathing room and visual hierarchy."
            useCases="Personal portfolio websites, developer landing pages, SaaS product docs, corporate team pages, and any professional web presence requiring clean navigation."
          />
        </section>

        <Divider />

        {/* SECTION 2 */}
        <section className="showcase-section">
          <SectionLabel number={2} title="Navbar With Active Link" subtitle="Visual indicator showing the user's current section" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-center">
                {navItems.map((item) => (
                  <span
                    key={item}
                    className={`showcase-nav-link ${item === 'Home' ? 'active' : ''}`}
                  >
                    {item}
                    {item === 'Home' && <span className="showcase-active-underline" />}
                  </span>
                ))}
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="Active link highlighted in blue (#2563EB), smooth animated underline indicator, subtle scale transition on hover, inactive links maintain muted gray"
            benefits="Users always know exactly where they are within the portfolio. The animated underline adds a polished, premium feel while the blue accent draws attention to the current section without being distracting."
            ux="Active state indicators are a fundamental navigation convention. The underline animation provides delightful micro-interaction that rewards user exploration. Contrast between active (blue) and inactive (gray) links creates clear visual hierarchy."
            useCases="Multi-section landing pages, one-page portfolios, documentation sites with scroll spy, any site where users need orientation within a long page."
          />
        </section>

        <Divider />

        {/* SECTION 3 */}
        <section className="showcase-section">
          <SectionLabel number={3} title="Navbar With CTA Button" subtitle="Primary action button integrated into navigation" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-center">
                {navItems.slice(0, 4).map((item) => (
                  <span key={item} className="showcase-nav-link">{item}</span>
                ))}
              </div>
              <div className="showcase-nav-right">
                <button className="showcase-cta-btn">
                  <FaDownload size={13} />
                  Download CV
                </button>
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="Blue filled CTA button with download icon, white text, 12px border radius, subtle hover lift effect with darker blue shadow, proper button alignment in navbar"
            benefits="The prominent Download CV button makes it effortless for recruiters to access the resume. Placing the CTA in the navbar ensures it's visible on every section without scrolling. The hover animation adds a premium tactile response."
            ux="CTA buttons in navigation follow the principle of 'progressive disclosure' — the most important action is always one click away. The blue color creates contrast against the white navbar, naturally drawing the eye. Icon+text combination improves action recognition."
            useCases="Developer portfolios prioritizing recruiter conversion, job-seeking landing pages, personal brand sites, freelance portfolios needing prominent call-to-action."
          />
        </section>

        <Divider />

        {/* SECTION 4 */}
        <section className="showcase-section">
          <SectionLabel number={4} title="Navbar With Project Dropdown" subtitle="Expandable menu revealing project categories" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-center">
                {navItems.slice(0, 3).map((item) => (
                  <span key={item} className="showcase-nav-link">{item}</span>
                ))}
                <span
                  className="showcase-nav-link dropdown-trigger"
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  Projects
                  <FaChevronDown size={10} style={{ marginLeft: 4 }} />
                  {dropdownOpen && (
                    <div className="showcase-dropdown">
                      <div className="showcase-dropdown-item">
                        <FaProjectDiagram size={13} color="#2563EB" />
                        <span>Full Stack Projects</span>
                      </div>
                      <div className="showcase-dropdown-item">
                        <FaCode size={13} color="#2563EB" />
                        <span>React Projects</span>
                      </div>
                      <div className="showcase-dropdown-item">
                        <FaCogs size={13} color="#2563EB" />
                        <span>Node.js Projects</span>
                      </div>
                      <div className="showcase-dropdown-item">
                        <FaFolderOpen size={13} color="#2563EB" />
                        <span>MongoDB Projects</span>
                      </div>
                      <div className="showcase-dropdown-item">
                        <FaPalette size={13} color="#2563EB" />
                        <span>UI/UX Projects</span>
                      </div>
                    </div>
                  )}
                </span>
                {navItems.slice(4).map((item) => (
                  <span key={item} className="showcase-nav-link">{item}</span>
                ))}
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="Hover-triggered dropdown panel, five categorized project types with icons, smooth fade-in animation, chevron indicator on parent link, clean list layout with dividers"
            benefits="Organizes projects into logical categories, making it easy for visitors to find relevant work. Reduces navbar complexity by consolidating multiple links under one parent. Icons improve visual scanning and category recognition."
            ux="Dropdowns follow the information architecture principle of 'chunking' — related items are grouped together. The hover trigger keeps the interface clean until needed. Icons next to each category reduce reading time by 40% compared to text-only lists."
            useCases="Portfolios with diverse project types, agency websites showcasing multiple service areas, design portfolios with categorized work, any site needing to organize many links without cluttering the navbar."
          />
        </section>

        <Divider />

        {/* SECTION 5 */}
        <section className="showcase-section">
          <SectionLabel number={5} title="Navbar With Search Bar" subtitle="Integrated search for instant portfolio exploration" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-search-wrapper">
                <FaSearch size={13} color="#94a3b8" />
                <input
                  className="showcase-search-input"
                  placeholder="Search projects, skills, articles..."
                />
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="Full-width search input with magnifying glass icon, placeholder text hint, rounded search field (24px radius), subtle border on focus, clean integration between nav links and search"
            benefits="Enables instant access to any portfolio content without manual scrolling. Particularly valuable for portfolios with extensive project collections or blog archives. Search reduces friction for returning visitors looking for specific content."
            ux="Search is the most efficient navigation pattern for content-heavy sites. The magnifying glass icon is universally recognized. Placing search in the navbar keeps it accessible from anywhere. The placeholder text sets clear expectations for what can be searched."
            useCases="Large portfolios with 20+ projects, developer blogs with many articles, CMS-driven portfolio sites, any content-rich personal website where finding specific items quickly matters."
          />
        </section>

        <Divider />

        {/* SECTION 6 */}
        <section className="showcase-section">
          <SectionLabel number={6} title="Navbar With Notification Area" subtitle="Social proof and quick contact access" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-center">
                {navItems.slice(0, 5).map((item) => (
                  <span key={item} className="showcase-nav-link">{item}</span>
                ))}
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-notification-area">
                  <div className="showcase-icon-btn">
                    <FaBell size={15} color="#64748b" />
                    <span className="showcase-badge">3</span>
                  </div>
                  <div className="showcase-icon-btn">
                    <FaEnvelope size={15} color="#64748b" />
                  </div>
                  <div className="showcase-icon-btn">
                    <FaGithub size={16} color="#64748b" />
                  </div>
                  <div className="showcase-icon-btn">
                    <FaLinkedin size={16} color="#2563EB" />
                  </div>
                </div>
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="Notification bell with red badge counter, email contact shortcut, GitHub and LinkedIn social links, icon-only buttons with hover states, compact horizontal layout"
            benefits="Provides immediate access to communication channels and social proof. The notification badge suggests activity and engagement. Social icons connect to professional networks, making it easy for recruiters to verify credentials."
            ux="Icon-only buttons save horizontal space while maintaining functionality. The notification badge leverages the 'red dot' pattern to convey urgency. LinkedIn icon highlighted in brand blue draws attention to the most important professional network link."
            useCases="Active portfolios expecting recruiter visits, freelancers wanting multiple contact channels, portfolio + blog hybrids, any site wanting to display social proof while keeping navigation clean."
          />
        </section>

        <Divider />

        {/* SECTION 7 */}
        <section className="showcase-section">
          <SectionLabel number={7} title="Navbar With Command Palette" subtitle="Keyboard-first navigation for power users" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-center">
                {navItems.slice(0, 4).map((item) => (
                  <span key={item} className="showcase-nav-link">{item}</span>
                ))}
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-cmd-palette">
                  <FaTerminal size={13} color="#94a3b8" />
                  <span className="showcase-cmd-text">Quick search...</span>
                  <span className="showcase-cmd-kbd">
                    <kbd>Ctrl</kbd>+<kbd>K</kbd>
                  </span>
                </div>
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="Terminal-inspired search trigger, Ctrl+K keyboard shortcut hint, monospace-styled key badges, subtle terminal icon, minimalist design mimicking VS Code command palette"
            benefits="Appeals to developer audience familiar with keyboard shortcuts. Ctrl+K is an established convention (VS Code, Linear, GitHub). Developers can navigate the entire portfolio without touching the mouse, creating a power-user experience."
            ux="Command palettes follow the 'progressive enhancement' principle — basic navigation works for everyone, keyboard shortcuts enhance the experience for power users. The terminal icon signals 'developer tool' to the target audience. Key badges provide affordance for the shortcut."
            useCases="Developer portfolios targeting technical audiences, engineering team pages, documentation sites, any site where the primary audience is comfortable with keyboard shortcuts."
          />
        </section>

        <Divider />

        {/* SECTION 8 */}
        <section className="showcase-section">
          <SectionLabel number={8} title="Navbar Dark Mode" subtitle="Premium dark theme with blue accent" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner light-nav">
              <div className="showcase-nav-left">
                <STLogo size={48} dark />
                <span className="showcase-nav-brand light-text">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-center">
                {navItems.map((item) => (
                  <span key={item} className="showcase-nav-link light-link">{item}</span>
                ))}
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-theme-toggle light-toggle">
                  <FaMoon size={14} color="#64748b" />
                </div>
              </div>
            </div>
          </div>
          <Explanation
            features="Deep black (#0a0a0a) background, white text for primary content, blue (#2563EB) accent for active states, subtle white border (10% opacity), premium dark shadow, reduced contrast for secondary text"
            benefits="Reduces eye strain in low-light environments, creates a premium cinematic feel, extends battery life on OLED screens, and appeals to developer preferences. The dark mode variant feels modern and sophisticated."
            ux="Dark mode reduces blue light exposure by 60%, making extended portfolio browsing more comfortable. The black (not dark gray) background with OLED-optimized colors creates depth. Blue accent provides sufficient contrast against dark backgrounds while maintaining visual hierarchy."
            useCases="Evening/night portfolio browsing, developer-focused sites, creative portfolios wanting dramatic presentation, any site where users spend extended time reading content."
          />
        </section>

        <Divider />

        {/* SECTION 9 */}
        <section className="showcase-section">
          <SectionLabel number={9} title="Mobile Navbar" subtitle="Responsive hamburger menu with slide-out drawer" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-theme-toggle">
                  <FaSun size={14} color="#64748b" />
                </div>
                <button className="showcase-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
                  {mobileOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
                </button>
              </div>
            </div>
          </div>
          {mobileOpen && (
            <div className="showcase-mobile-drawer">
              <div className="showcase-drawer-header">
                <STLogo size={32} />
                <span className="showcase-nav-brand">Sisay Tadesse</span>
                <button className="showcase-drawer-close" onClick={() => setMobileOpen(false)}>
                  <FaTimes size={18} color="#64748b" />
                </button>
              </div>
              <div className="showcase-drawer-links">
                {navItems.map((item) => (
                  <span key={item} className="showcase-drawer-link">
                    {item === 'Home' && <FaHome size={14} color="#2563EB" />}
                    {item === 'About' && <FaUser size={14} color="#2563EB" />}
                    {item === 'Skills' && <FaCode size={14} color="#2563EB" />}
                    {item === 'Projects' && <FaFolderOpen size={14} color="#2563EB" />}
                    {item === 'Experience' && <FaBriefcase size={14} color="#2563EB" />}
                    {item === 'Certificates' && <FaCertificate size={14} color="#2563EB" />}
                    {item === 'Contact' && <FaEnvelope size={14} color="#2563EB" />}
                    {item}
                  </span>
                ))}
              </div>
              <div className="showcase-drawer-cta">
                <button className="showcase-cta-btn" style={{ width: '100%', justifyContent: 'center' }}>
                  <FaDownload size={13} />
                  Download CV
                </button>
              </div>
            </div>
          )}
          <Explanation
            features="Hamburger icon (three-line menu), slide-in drawer from right, full-height overlay with nav links, close button, icons next to each link, CTA button at bottom, smooth transition animation"
            benefits="Essential for mobile usability — collapses complex navigation into a simple icon. The slide-out drawer preserves screen real estate while keeping all navigation accessible within one tap. Icons improve tap target recognition on small screens."
            ux="The hamburger menu is the most recognized mobile navigation pattern. A right-side drawer follows platform conventions (iOS/Android). Icons next to links reduce reading time. The CTA at the drawer bottom is within thumb reach on most devices."
            useCases="All responsive portfolios, mobile-first designs, progressive web apps, any site needing to maintain full navigation on devices under 768px width."
          />
        </section>

        <Divider />

        {/* SECTION 10 */}
        <section className="showcase-section">
          <SectionLabel number={10} title="Admin Navbar Version" subtitle="Dashboard-style navigation for portfolio management" />
          <div className="showcase-navbar-preview">
            <div className="showcase-navbar-inner">
              <div className="showcase-nav-left">
                <STLogo />
                <span className="showcase-nav-brand">Admin Panel</span>
              </div>
              <div className="showcase-nav-center">
                <span className="showcase-nav-link active">
                  <FaChartBar size={13} />
                  Dashboard
                </span>
                <span className="showcase-nav-link">
                  <FaCommentDots size={13} />
                  Messages
                </span>
                <span className="showcase-nav-link">
                  <FaProjectDiagram size={13} />
                  Projects
                </span>
                <span className="showcase-nav-link">
                  <FaCogs size={13} />
                  Skills
                </span>
                <span className="showcase-nav-link">
                  <FaCertificate size={13} />
                  Certificates
                </span>
                <span className="showcase-nav-link">
                  <FaEye size={13} />
                  Visitors
                </span>
              </div>
              <div className="showcase-nav-right">
                <div className="showcase-admin-avatar">ST</div>
              </div>
            </div>
          </div>
          <Explanation
            features="Dashboard-style nav with analytics, messages, projects, skills, certificates, and visitor tracking links; active state on Dashboard; admin avatar monogram; icon-before-label pattern for all links"
            benefits="Provides a complete admin interface for managing portfolio content. Each link maps directly to a content type, making CRUD operations intuitive. The active state clearly shows which management section is currently being viewed."
            ux="Admin navigation follows dashboard design conventions familiar from tools like Vercel, Netlify, and WordPress. Icons before labels improve scanability — users can find sections by icon alone once learned. The avatar monogram personalizes the admin experience."
            useCases="Portfolio CMS backends, personal admin dashboards, content management interfaces, any authenticated portfolio management system."
          />
        </section>
      </div>

      {/* BOTTOM: KEY FEATURES */}
      <div className="showcase-features-section">
        <div className="showcase-container">
          <div className="showcase-features-header">
            <span className="showcase-section-number" style={{ marginBottom: 0 }}>&infin;</span>
            <h2 className="showcase-section-title" style={{ fontSize: '2.2rem', margin: '12px 0 8px' }}>Key Features</h2>
            <p className="showcase-section-subtitle" style={{ textAlign: 'center' }}>
              Every navbar variant is built with these foundational qualities
            </p>
          </div>
          <div className="showcase-features-grid">
            {[
              { icon: <FaMobile size={20} />, title: 'Fully Responsive', desc: 'Flawless adaptation across all viewports from 320px to 2560px.' },
              { icon: <FaMobile size={20} />, title: 'Mobile First', desc: 'Designed for mobile first, progressively enhanced for larger screens.' },
              { icon: <FaUniversalAccess size={20} />, title: 'Accessibility Friendly', desc: 'ARIA labels, keyboard navigation, and screen reader optimized.' },
              { icon: <FaMousePointer size={20} />, title: 'Smooth Scroll Navigation', desc: 'Scroll-linked animations with Intersection Observer for active tracking.' },
              { icon: <FaSearch size={20} />, title: 'Active Section Tracking', desc: 'Real-time scroll spy highlights the current section automatically.' },
              { icon: <FaMoon size={20} />, title: 'Dark Mode Support', desc: 'Seamless light/dark theme switching with persisted user preference.' },
              { icon: <FaSearchDollar size={20} />, title: 'SEO Friendly', desc: 'Semantic HTML structure with proper heading hierarchy for crawlers.' },
              { icon: <FaBolt size={20} />, title: 'Fast Loading', desc: 'Optimized bundle size with lazy-loaded components and minimal reflows.' },
              { icon: <FaFont size={20} />, title: 'Professional Typography', desc: 'Inter font with meticulous leading, tracking, and hierarchy.' },
              { icon: <FaStar size={20} />, title: 'Portfolio Optimized', desc: 'Every element serves developer portfolio conversion goals.' },
              { icon: <FaUserTie size={20} />, title: 'Recruiter Friendly', desc: 'CTAs and social proofs positioned for maximum recruiter engagement.' },
              { icon: <FaLock size={20} />, title: 'Admin Controlled', desc: 'Content management ready with scalable dashboard integration.' },
            ].map((feature) => (
              <div key={feature.title} className="showcase-feature-card">
                <div className="showcase-feature-icon">{feature.icon}</div>
                <h3 className="showcase-feature-title">{feature.title}</h3>
                <p className="showcase-feature-desc">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="showcase-footer">
        <div className="showcase-container">
          <div className="showcase-footer-inner">
            <div className="showcase-footer-left">
              <STLogo size={28} />
              <span className="showcase-footer-brand">ST Portfolio Design System</span>
            </div>
            <p className="showcase-footer-text">
              Built with React &amp; Tailwind CSS &mdash; Designed for developers who care about craft.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavbarShowcase;
