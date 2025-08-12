// Preloader utility for improving perceived performance
const preloadedComponents = new Set<string>();

export const preloadComponent = async (importFn: () => Promise<any>, componentName: string) => {
  if (preloadedComponents.has(componentName)) {
    return; // Already preloaded
  }
  
  try {
    await importFn();
    preloadedComponents.add(componentName);
    console.log(`Preloaded ${componentName}`);
  } catch (error) {
    console.warn(`Failed to preload ${componentName}:`, error);
  }
};

export const preloadDashboards = () => {
  // Preload dashboard components when user shows intent
  const dashboardImports = [
    { name: 'AdminDashboard', importFn: () => import('../pages/AdminDashboard') },
    { name: 'SchoolAdminDashboard', importFn: () => import('../pages/SchoolAdminDashboard') },
    { name: 'TeacherDashboard', importFn: () => import('../pages/TeacherDashboard') },
    { name: 'StudentDashboard', importFn: () => import('../pages/StudentDashboard') },
  ];

  // Use requestIdleCallback to preload during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      dashboardImports.forEach(({ name, importFn }) => {
        preloadComponent(importFn, name);
      });
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      dashboardImports.forEach(({ name, importFn }) => {
        preloadComponent(importFn, name);
      });
    }, 100);
  }
};

export const preloadLoginPages = () => {
  const loginImports = [
    { name: 'AdminLoginPage', importFn: () => import('../pages/AdminLoginPage') },
    { name: 'SchoolAdminLoginPage', importFn: () => import('../pages/SchoolAdminLoginPage') },
    { name: 'TeacherLoginPage', importFn: () => import('../pages/TeacherLoginPage') },
    { name: 'StudentLoginPage', importFn: () => import('../pages/StudentLoginPage') },
  ];

  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      loginImports.forEach(({ name, importFn }) => {
        preloadComponent(importFn, name);
      });
    });
  } else {
    setTimeout(() => {
      loginImports.forEach(({ name, importFn }) => {
        preloadComponent(importFn, name);
      });
    }, 200);
  }
};
