// Debug utility for deployment issues
export const debugApiConfiguration = () => {
  const config = {
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    port: window.location.port,
    envUrl: import.meta.env.VITE_API_BASE_URL,
    isLocalhost: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    isProduction: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
  };

  // Test API endpoint
  const testApiEndpoint = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
          ? "http://localhost:7000" 
          : "";
      
      const testUrl = `${apiBase}/api/auth/whoami`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      return response.ok;
    } catch (error) {
      return false;
    }
  };
  
  return { config, testApiEndpoint };
};
