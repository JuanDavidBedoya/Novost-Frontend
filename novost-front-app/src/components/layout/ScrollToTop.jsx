import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

//Al recargar la página, se scrollea para arriba automáticamente

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}