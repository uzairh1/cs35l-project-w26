import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = Boolean(localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">
        <Link to="/">UCLA Syllabi</Link>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/browse">Browse</Link></li>
        <li><Link to="/upload">Upload</Link></li>
        <li><Link to="/my-uploads">My Uploads</Link></li>
        <li><Link to="/favorites">Favorites</Link></li>
        {!isLoggedIn && <li><Link to="/login" className="nav-button">Login</Link></li>}
        {!isLoggedIn && <li><Link to="/register" className="nav-button signup">Register</Link></li>}
        {isLoggedIn && (
          <li>
            <Link to={location.pathname}
              onClick={handleLogout}
              className="nav-button"
              style={{ cursor: "pointer" }}
            >
              Logout
            </Link>
          </li>
        )}
      </ul>
    </nav>
  );
}
