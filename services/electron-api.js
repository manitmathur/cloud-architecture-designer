// services/electron-api.js
export async function getArchitectures() {
    if (typeof window !== 'undefined' && window.electron) {
      return window.electron.getArchitectures();
    }
    
    // Fallback for web development (uses regular fetch)
    const response = await fetch('/api/architectures');
    if (!response.ok) throw new Error('Failed to fetch architectures');
    return response.json();
  }
  
  export async function createArchitecture(name) {
    if (typeof window !== 'undefined' && window.electron) {
      return window.electron.createArchitecture(name);
    }
    
    // Fallback for web development
    const response = await fetch('/api/architectures', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    
    if (!response.ok) throw new Error('Failed to create architecture');
    return response.json();
  }