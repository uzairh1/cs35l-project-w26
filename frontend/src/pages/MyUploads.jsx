import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { deleteSyllabus, getMySyllabi } from "../services/api";

export default function MyUploads() {
  const [uploads, setUploads] = useState([]);
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

    async function loadUploads() {
      const data = await getMySyllabi();
      if (data.error) {
        setError(data.error);
      } else {
        setUploads(data);
      }
      setLoading(false);
    }

    loadUploads();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Delete this syllabus?");
    if (!confirmed) return;

    const res = await deleteSyllabus(id);
    if (res.error) {
      alert(res.error);
      return;
    }

    setUploads((prev) => prev.filter((s) => s.id !== id));
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading your uploads...</div>;
  if (needsLogin) {
    return (
      <div style={{ padding: "20px" }}>
        Please <Link to="/login">login</Link> to view your uploads.
      </div>
    );
  }
  if (error) return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;
  if (uploads.length === 0) return <div style={{ padding: "20px" }}>You have no uploads yet.</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Uploads</h2>
      {uploads.map((s) => (
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
          <p style={{ margin: "4px 0" }}>{s.course.course_title}</p>
          <p style={{ margin: "4px 0", fontSize: "14px", color: "#555" }}>
            {s.course.professor_first_name} {s.course.professor_last_name} | {s.quarter} {s.year}
          </p>
          <p style={{ margin: "6px 0", fontSize: "13px" }}>
            Downloads: {s.download_count} | Favorites: {s.favorite_count}
          </p>

          <div style={{ display: "flex", gap: "8px" }}>
            <Link to={`/my-uploads/${s.id}/edit`}>
              <button
                style={{
                  backgroundColor: "#2774AE",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                Edit
              </button>
            </Link>
            <button
              onClick={() => handleDelete(s.id)}
              style={{
                backgroundColor: "#cc0000",
                color: "white",
                border: "none",
                borderRadius: "4px",
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
