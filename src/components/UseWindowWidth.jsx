import { useState, useEffect } from 'react';

const UseWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);

    // Cleanup function to remove the listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowWidth;
};

export default UseWindowWidth;
