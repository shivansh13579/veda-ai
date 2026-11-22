import { useState, useEffect } from 'react';

/**
 * Programmatic client-side navigation utility using HTML5 History API.
 * @param {string} to - Destination path (e.g. '/login', '/')
 */
export const navigate = (to) => {
  if (window.location.pathname !== to) {
    window.history.pushState({}, '', to);
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

/**
 * Hook to subscribe to current URL pathname changes.
 * @returns {[string, function]} [currentPath, navigate]
 */
export const useCurrentPath = () => {
  const [path, setPath] = useState(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return [path, navigate];
};

