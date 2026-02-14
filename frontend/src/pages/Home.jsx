import { useState, useEffect } from 'react';
import { getHealth } from '/src/services/api.js';


function HealthData() {
  const [health, setHealth] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch("/v1/projects/{ref}/health")
    .then(response => response.json())
    .then(jsonData => setHealth(jsonData));
  }, []);


  if (isLoading) return <div>Loading...</div>;


  return (
    <ul>
      {health.items.map(item => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  );
}


export default function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <HealthData/>
    </div>
  );
}
