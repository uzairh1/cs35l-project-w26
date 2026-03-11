import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { downloadSyllabus, getFavorites, unfavoriteSyllabus } from "../services/api";

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [needsLogin, setNeedsLogin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setNeedsLogin(true);
      setLoading(false);
      return;
    }

    async function loadFavorites() {
      try {
        const data = await getFavorites();

        if (data.error) {
          setError(data.error);
        } else {
          setFavorites(data);
        }
      } catch (err) {
        setError("Failed to load favorites.");
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  const handleUnfavorite = async (id) => {
    const res = await unfavoriteSyllabus(id);

    if (!res.error) {
      // Remove the item from the UI immediately
      setFavorites((prev) => prev.filter((s) => s.id !== id));
    } else {
      alert(res.error);
    }
  };

  const handleDownload = async (id) => {
    try {
      await downloadSyllabus(id);
      setFavorites((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, download_count: (s.download_count || 0) + 1 }
            : s
        )
      );
    } catch (err) {
      alert("Download failed. Make sure you are logged in.");
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading favorites...</div>;
  }

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;
  }

  if (needsLogin) {
    return (
      <div style={{ padding: "20px" }}>
        Please <Link to="/login">login</Link> to view your favorite syllabi.
      </div>
    );
  }

  if (favorites.length === 0) {
    return <div style={{ padding: "20px" }}>No favorites yet.</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Favorites</h2>

      {favorites.map((s) => (
        <div
          key={s.id}
          style={{
            border: "1px solid #ddd",
            padding: "16px",
            marginBottom: "12px",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <h4 style={{ margin: "0 0 6px 0" }}>
            {s.course.department} {s.course.course_number}
          </h4>

          <p style={{ margin: "4px 0" }}>
            {s.course.course_title}
          </p>

          <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
            {s.quarter} {s.year}
          </p>

          <p style={{ margin: "6px 0", fontSize: "13px" }}>
            Downloads: {s.download_count} | Favorites: {s.favorite_count}
          </p>

          <button
            onClick={() => handleDownload(s.id)}
            style={{
              marginTop: "8px",
              marginRight: "8px",
              padding: "6px 10px",
              backgroundColor: "#2774AE",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Download PDF
          </button>

          <button
            onClick={() => handleUnfavorite(s.id)}
            style={{
              marginTop: "8px",
              padding: "6px 10px",
              backgroundColor: "#cc0000",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Unfavorite
          </button>
        </div>
      ))}
    </div>
  );
}
