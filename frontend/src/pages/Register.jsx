import { useState } from "react";
import { Link } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const uclaRegex = /^[^\s@]+@(ucla\.edu|g\.ucla\.edu)$/;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!uclaRegex.test(email)) {
      setError("Must provide @ucla.edu email");
      return;
    }

    try {
      const response = await registerUser({ email, password });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Registration successful! You can now log in.");
        setEmail("");
        setPassword("");
      }
    } catch {
      setError("Something went wrong. Is the backend running?");
    }
  }

  return (
    <div className="auth-container">
      <h2>Create Account</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>Join to access our syllabi</p>
      <p style={{ color: "#666", marginTop: "-10px", marginBottom: "20px" }}>
        Must provide @ucla.edu email
      </p>

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

        <button className="auth-button" type="submit">Register</button>
      </form>

      {error && <p style={{ color: "maroon", marginTop: "15px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginTop: "15px" }}>{success}</p>}

      <p style={{ marginTop: "25px", fontSize: "0.9rem", color: "#666" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#2774AE", fontWeight: "600", textDecoration: "none" }}>
          Login here
        </Link>
      </p>
    </div>
  );
}
