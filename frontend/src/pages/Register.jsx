import { useState } from "react";
import { registerUser } from "../services/api";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // regex for ucla email validation
  const uclaRegex = /^[^\s@]+@(ucla\.edu|g\.ucla\.edu)$/;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!uclaRegex.test(email)) {
      setError("Must use UCLA email (@ucla.edu or @g.ucla.edu)");
      return;
    }

    try {
      const response = await registerUser({ email, password });

      if (response.error) {
        setError(response.error);
      } else {
        setSuccess("Registration successful!");
      }
    } catch {
      setError("Something went wrong");
    }
  }

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="UCLA Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Register</button>
      </form>

      {error && <p>{error}</p>}
      {success && <p>{success}</p>}
    </div>
  );
}