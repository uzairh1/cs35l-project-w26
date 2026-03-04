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

export async function fetchSyllabi(filters = {}) {
  try {
    // turns { professor: "Eggert", year: "2026" } into "professor=Eggert&year=2026"
    // skips empty fields if we clean the object first
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    
    const queryString = new URLSearchParams(cleanFilters).toString();
    const endpoint = queryString ? `${API_URL}/api/syllabi?${queryString}` : `${API_URL}/api/syllabi`; // Yo frontend -- delete the first api from both parts in this line, should work then!

    const response = await fetch(endpoint);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Couldn't fetch syllabi");
    }

    return data;
  } catch (err) {
    return { error: err.message };
  }
}