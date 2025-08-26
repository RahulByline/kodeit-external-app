// Clear Cache Script - Run this in browser console to clear all cached data
console.log('🧹 Clearing all cached data...');

const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (
    key.startsWith('student_dashboard_') || 
    key.startsWith('sidebar_') ||
    key.startsWith('currentUser') ||
    key.startsWith('moodle_token') ||
    key.startsWith('token')
  )) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log('🗑️ Removed:', key);
});

console.log('✅ Cleared', keysToRemove.length, 'cached items');
console.log('🔄 Please refresh the page to see fresh data');

// Force page refresh
// window.location.reload();
