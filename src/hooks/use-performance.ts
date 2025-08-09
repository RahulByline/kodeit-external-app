import { useEffect, useRef, useState } from 'react';

export const usePerformanceMonitor = (componentName: string) => {
  const renderCountRef = useRef(0);
  const mountTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    
    // Log render info in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} rendered ${renderCountRef.current} times`);
      
      // Warn about excessive renders
      if (renderCountRef.current > 10) {
        console.warn(`${componentName} has rendered ${renderCountRef.current} times - consider optimization`);
      }
    }
  });

  useEffect(() => {
    const mountTime = Date.now() - mountTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`${componentName} mounted in ${mountTime}ms`);
    }
    
    return () => {
      const unmountTime = Date.now() - mountTimeRef.current;
      if (process.env.NODE_ENV === 'development') {
        console.log(`${componentName} lived for ${unmountTime}ms`);
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCountRef.current,
    mountTime: mountTimeRef.current,
  };
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Performance utility functions
export const measurePerformance = (name: string, fn: () => void) => {
  if (process.env.NODE_ENV === 'development') {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${name} took ${end - start} milliseconds`);
  } else {
    fn();
  }
};

export const preloadRoute = (routeImport: () => Promise<any>) => {
  // Preload the route component
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      routeImport();
    });
  } else {
    setTimeout(() => {
      routeImport();
    }, 100);
  }
};
