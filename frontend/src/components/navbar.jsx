import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">UCLA Syllabi</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/browse">Browse</Link></li>
        <li><Link to="/upload">Upload</Link></li>
        <li><Link to="/login" className="nav-button">Login</Link></li>
        <li><Link to="/register" className="nav-button signup">Register</Link></li>
      </ul>
    </nav>
  );
}