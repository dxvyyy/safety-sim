import { useState, useEffect } from 'react';

export function useBreakpoint() {
  const [w, setW] = useState(() => window.innerWidth);
  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop';
}
