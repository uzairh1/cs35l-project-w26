const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5173/api";

export async function getHealth() {
  try {
    const res = await fetch(`${API_URL}/health`);
    return await res.json();
  } catch {
    return { status: "error" };
  }
}
