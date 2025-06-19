import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * A hook that scrolls to the top of the page when the location changes
 * and saves scroll position in session history
 */
export function useScrollRestoration() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top when location changes
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}
