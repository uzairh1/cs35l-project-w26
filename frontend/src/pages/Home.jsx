import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHealth } from '../services/api.js'; 

function HealthData() {
  const [health, setHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkBackend() {
      const data = await getHealth();
      setHealth(data);
      setIsLoading(false); 
    }
    
    checkBackend();
  }, []);

  if (isLoading) return <div>Checking connection to backend...</div>;

  return (
    <div>
      <p>Backend Status: <strong>{health?.status || "Offline"}</strong></p>
    </div>
  );
}

export default function Home() {
  return (
    <div className="browse-container"> {}
      <div className="home-hero">
        <h1>hai, welcome!</h1>
        <p>feel free to navigate UCLA syllabi and contribute to our database</p>
        
        <Link to="/browse" className="cta-button">Start Browsing</Link>
        
      </div>
    </div>
  );
}