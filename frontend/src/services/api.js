const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export async function getHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    return await res.json();
  } catch {
    return { status: "error" };
  }
}

export async function registerUser(data) {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function loginUser(data) {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function uploadSyllabus(formData) {
  try {
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      body: formData, 
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function fetchSyllabi(filters = {}) {
  try {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== "")
    );
    const queryString = new URLSearchParams(cleanFilters).toString();
    const endpoint = queryString ? `${API_URL}/syllabi?${queryString}` : `${API_URL}/syllabi`;

    const response = await fetch(endpoint);
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}