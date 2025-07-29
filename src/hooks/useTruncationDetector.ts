import { useRef, useEffect, useState } from 'react';

export function useTruncationDetector() {
  const elementRef = useRef<HTMLParagraphElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      if (elementRef.current) {
        const element = elementRef.current;
        const isTruncated = element.scrollWidth > element.clientWidth;
        setIsTruncated(isTruncated);
      }
    };

    checkTruncation();
    
    // Re-check on window resize
    window.addEventListener('resize', checkTruncation);
    
    return () => {
      window.removeEventListener('resize', checkTruncation);
    };
  }, []);

  return { elementRef, isTruncated };
} 