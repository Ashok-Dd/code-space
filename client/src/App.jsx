import { useState, useEffect } from 'react';
import HomePage from './HomePage';
import CodeViewPage from './CodeViewPage';

function App() {
  const [routeId, setRouteId] = useState('');

  useEffect(() => {
    const path = window.location.pathname;
    const idFromPath = path.substring(1);
    
    if (idFromPath) {
      setRouteId(idFromPath);
    }
  }, []);

  if (routeId) {
    return <CodeViewPage routeId={routeId} />;
  }

  return <HomePage />;
}






export default App;