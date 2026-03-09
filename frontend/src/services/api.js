const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

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

  const json = await res.json();

  if (json.access_token) {
    localStorage.setItem("token", json.access_token);
  }

  return json;
}




export async function uploadSyllabus(formData) {
  try {
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: authHeaders(),
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

    const endpoint = queryString
      ? `${API_URL}/syllabi?${queryString}`
      : `${API_URL}/syllabi`;

    const response = await fetch(endpoint);
    return await response.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function getSyllabus(id) {
  try {
    const res = await fetch(`${API_URL}/syllabi/${id}`);
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function downloadSyllabus(id) {
  const res = await fetch(`${API_URL}/syllabi/${id}/download`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Download failed");

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "syllabus.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function getFavorites() {
  try {
    const res = await fetch(`${API_URL}/favorites`, {
      headers: authHeaders(),
    });

    if (!res.ok) {
      return { error: "Failed to fetch favorites" };
    }

    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function favoriteSyllabus(id) {
  try {
    const res = await fetch(`${API_URL}/syllabi/${id}/favorite`, {
      method: "POST",
      headers: authHeaders(),
    });

    if (!res.ok) {
      return { error: "Failed to favorite" };
    }

    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function unfavoriteSyllabus(id) {
  try {
    const res = await fetch(`${API_URL}/syllabi/${id}/favorite`, {
      method: "DELETE",
      headers: authHeaders(),
    });

    if (!res.ok) {
      return { error: "Failed to unfavorite" };
    }

    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function getGradeDistribution(courseId) {
  try {
    const res = await fetch(
      `${API_URL}/courses/${courseId}/grade-distribution`
    );
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function getMySyllabi() {
  try {
    const res = await fetch(`${API_URL}/my-syllabi`, {
      headers: authHeaders(),
    });
    if (!res.ok) {
      return { error: "Failed to fetch your uploads" };
    }
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function submitGrade(courseId, grade) {
  try {
    const res = await fetch(`${API_URL}/grades`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ course_id: courseId, grade }),
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function getMyGrade(courseId) {
  try {
    const res = await fetch(`${API_URL}/courses/${courseId}/my-grade`, {
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function updateSyllabus(id, formData) {
  try {
    const res = await fetch(`${API_URL}/syllabi/${id}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: formData,
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}

export async function deleteSyllabus(id) {
  try {
    const res = await fetch(`${API_URL}/syllabi/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}
