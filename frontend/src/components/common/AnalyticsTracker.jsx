import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    try {
      const data = {
        page: location.pathname,
        referrer: document.referrer || 'direct',
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        timestamp: new Date().toISOString(),
      };
      // Store in localStorage for analytics dashboard
      const history = JSON.parse(localStorage.getItem('pageViews') || '[]');
      history.push(data);
      if (history.length > 500) history.shift();
      localStorage.setItem('pageViews', JSON.stringify(history));
    } catch {
      // Silently fail
    }
  }, [location.pathname]);

  return null;
}

export default AnalyticsTracker;
