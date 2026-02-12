const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173/api";

export async function getHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    return await res.json();
  } catch {
    return { status: "error" };
  }
}

// function to register the user
export async function registerUser(data) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // hopefully data looks like: { email: "...", password: "..." }
    body: JSON.stringify(data),
  });

  return res.json();
}

// like registerUser, but for logging in the user
export async function loginUser(data) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}