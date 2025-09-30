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
  
  console.log('🔧 API Debug Configuration:', config);
  
  // Test API endpoint
  const testApiEndpoint = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
          ? "http://localhost:7000" 
          : "";
      
      const testUrl = `${apiBase}/api/auth/whoami`;
      console.log(`🧪 Testing API endpoint: ${testUrl}`);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log(`📡 API Response: ${response.status} ${response.statusText}`);
      return response.ok;
    } catch (error) {
      console.error('❌ API Test Failed:', error);
      return false;
    }
  };
  
  return { config, testApiEndpoint };
};
