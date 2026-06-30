const router = require('express').Router();
const crypto = require('crypto');
const VisitorSession = require('../models/VisitorSession');
const VisitorEvent = require('../models/VisitorEvent');

function hashIp(ip) {
  if (!ip) return '';
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

function parseUA(ua) {
  const result = { browser: 'Unknown', browserVersion: '', os: 'Unknown', deviceType: 'unknown' };
  if (!ua) return result;
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
    result.browser = 'Chrome';
    const m = ua.match(/Chrome\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  } else if (ua.includes('Firefox/')) {
    result.browser = 'Firefox';
    const m = ua.match(/Firefox\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  } else if (ua.includes('Safari/') && !ua.includes('Chrome/')) {
    result.browser = 'Safari';
    const m = ua.match(/Version\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  } else if (ua.includes('Edg/')) {
    result.browser = 'Edge';
    const m = ua.match(/Edg\/([\d.]+)/);
    if (m) result.browserVersion = m[1];
  }
  if (ua.includes('Windows')) result.os = 'Windows';
  else if (ua.includes('Mac OS')) result.os = 'macOS';
  else if (ua.includes('Linux') && !ua.includes('Android')) result.os = 'Linux';
  else if (ua.includes('Android')) result.os = 'Android';
  else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) result.os = 'iOS';
  if (ua.includes('iPad') || ua.includes('Tablet') || (ua.includes('Android') && !ua.includes('Mobile'))) result.deviceType = 'tablet';
  else if (ua.includes('Mobile') || ua.includes('iPhone') || ua.includes('Android')) result.deviceType = 'mobile';
  else result.deviceType = 'desktop';
  return result;
}

router.post('/identify', async (req, res) => {
  try {
    const { visitorId, sessionId, browser, screen, viewport, language, timezone, referrer } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || req.connection?.remoteAddress || '';
    const ua = parseUA(browser || req.headers['user-agent'] || '');
    let session = await VisitorSession.findOne({ sessionId });

    if (!session) {
      const existing = await VisitorSession.findOne({ visitorId }).sort({ createdAt: -1 }).lean();
      session = new VisitorSession({
        visitorId, sessionId,
        ipHash: hashIp(ip),
        browser: ua.browser,
        browserVersion: ua.browserVersion,
        os: ua.os,
        deviceType: ua.deviceType,
        screenResolution: screen || '',
        viewportSize: viewport || '',
        language: language || '',
        timezone: timezone || '',
        referrer: referrer || '',
        referrerDomain: referrer ? new URL(referrer).hostname : '',
        isReturning: !!existing,
        landingPage: req.body.url || '/',
      });
    } else {
      session.ipHash = hashIp(ip);
      if (ua.browser !== 'Unknown') session.browser = ua.browser;
      if (ua.browserVersion) session.browserVersion = ua.browserVersion;
      if (ua.os !== 'Unknown') session.os = ua.os;
      session.deviceType = ua.deviceType;
      if (screen) session.screenResolution = screen;
      if (viewport) session.viewportSize = viewport;
      if (language) session.language = language;
      if (timezone) session.timezone = timezone;
    }

    session.lastActiveAt = new Date();
    session.isActive = true;
    await session.save();

    res.json({ success: true, data: { sessionId: session.sessionId } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/page-view', async (req, res) => {
  try {
    const { visitorId, sessionId, url, pageTitle, path } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const pageUrl = url || path || '/';
    await VisitorEvent.create({
      sessionId, visitorId,
      eventType: 'page_view',
      url: pageUrl,
      pageTitle: pageTitle || '',
      timestamp: new Date(),
    });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      const now = new Date();
      if (session.pages.length > 0) {
        const last = session.pages[session.pages.length - 1];
        if (!last.leftAt) {
          last.leftAt = now;
          last.duration = Math.round((now - new Date(last.enteredAt)) / 1000);
        }
      }
      session.pages.push({ url: pageUrl, title: pageTitle || '', enteredAt: now });
      session.pageViews = session.pages.length;
      if (!session.landingPage) session.landingPage = pageUrl;
      session.exitPage = pageUrl;
      session.lastActiveAt = now;
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/event', async (req, res) => {
  try {
    const { visitorId, sessionId, eventType, url, pageTitle, element, value, metadata } = req.body;
    if (!visitorId || !sessionId || !eventType) return res.status(400).json({ success: false, message: 'visitorId, sessionId, and eventType required' });

    await VisitorEvent.create({
      sessionId, visitorId, eventType,
      url: url || '',
      pageTitle: pageTitle || '',
      element: element || '',
      value: value || '',
      metadata: metadata || {},
      timestamp: new Date(),
    });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      session.clicks = (session.clicks || 0) + 1;
      if (eventType === 'project_click') session.projectClicks = (session.projectClicks || 0) + 1;
      if (eventType === 'github_click') session.githubClicks = (session.githubClicks || 0) + 1;
      if (eventType === 'live_demo_click') session.liveDemoClicks = (session.liveDemoClicks || 0) + 1;
      if (eventType === 'resume_download') session.resumeDownloads = (session.resumeDownloads || 0) + 1;
      if (eventType === 'contact_submit') session.contactSubmissions = (session.contactSubmissions || 0) + 1;
      session.lastActiveAt = new Date();
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/heartbeat', async (req, res) => {
  try {
    const { visitorId, sessionId, maxScrollDepth } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      session.lastActiveAt = new Date();
      session.isActive = true;
      if (typeof maxScrollDepth === 'number' && maxScrollDepth > (session.maxScrollDepth || 0)) {
        session.maxScrollDepth = maxScrollDepth;
      }
      await session.save();
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/exit', async (req, res) => {
  try {
    const { visitorId, sessionId, maxScrollDepth, duration } = req.body;
    if (!visitorId || !sessionId) return res.status(400).json({ success: false, message: 'visitorId and sessionId required' });

    const session = await VisitorSession.findOne({ sessionId });
    if (session) {
      const now = new Date();
      session.endedAt = now;
      session.isActive = false;
      session.lastActiveAt = now;
      if (typeof maxScrollDepth === 'number' && maxScrollDepth > (session.maxScrollDepth || 0)) {
        session.maxScrollDepth = maxScrollDepth;
      }
      const start = session.startedAt || now;
      session.duration = duration || Math.round((now - start) / 1000);

      if (session.pages.length > 0) {
        const last = session.pages[session.pages.length - 1];
        if (!last.leftAt) {
          last.leftAt = now;
          last.duration = Math.round((now - new Date(last.enteredAt)) / 1000);
        }
      }

      await session.save();

      await VisitorEvent.create({
        sessionId, visitorId,
        eventType: 'page_exit',
        url: session.exitPage || '/',
        value: `duration: ${session.duration}s, scrollDepth: ${session.maxScrollDepth}%`,
        timestamp: now,
      });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
