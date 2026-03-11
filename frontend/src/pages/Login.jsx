import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await loginUser({ email, password });

      if (response.error) {
        setError(response.error);
        return;
      }

      if (!response.access_token) {
        setError("Login succeeded but no access token was returned.");
        return;
      }

      localStorage.setItem("token", response.access_token);
      navigate("/browse", { replace: true });
    } catch {
      setError("Login failed. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-container">
      <h2>Welcome Back</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>Log in to access your syllabi</p>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="UCLA Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="auth-button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      {error && <p style={{ color: "maroon", marginTop: "15px" }}>{error}</p>}

      <p style={{ marginTop: "25px", fontSize: "0.9rem", color: "#666" }}>
        Don't have an account?{" "}
        <Link to="/register" style={{ color: "#2774AE", fontWeight: "600", textDecoration: "none" }}>
          Register here
        </Link>
      </p>
    </div>
  );
}
