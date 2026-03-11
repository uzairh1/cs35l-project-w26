import React, { useEffect, useState } from "react";
import {
  favoriteSyllabus,
  fetchSyllabi,
  downloadSyllabus,
  getFavorites,
  getGradeDistribution,
  unfavoriteSyllabus,
} from "../services/api";

const Browse = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [distributions, setDistributions] = useState({});
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const [filters, setFilters] = useState({
    professor_last_name: "",
    course_number: "",
    department: "",
    quarter: "",
    year: "",
    sort: "newest",
  });

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleDownload = async (id) => {
    try {
      await downloadSyllabus(id);
      setSyllabi((prev) =>
        prev.map((s) =>
          s.id === id
            ? { ...s, download_count: (s.download_count || 0) + 1 }
            : s
        )
      );
    } catch (err) {
      console.error("Download failed:", err);
      alert("Download failed. Make sure you are logged in.");
    }
  };

  const handleToggleFavorite = async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to favorite syllabi.");
      return;
    }

    const isFavorited = favoriteIds.has(id);
    const res = isFavorited
      ? await unfavoriteSyllabus(id)
      : await favoriteSyllabus(id);

    if (res.error) {
      alert(res.error);
      return;
    }

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFavorited) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setSyllabi((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          favorite_count: Math.max(
            (s.favorite_count || 0) + (isFavorited ? -1 : 1),
            0
          ),
        };
      })
    );
  };

  const loadGradeDistribution = async (courseId) => {
    if (distributions[courseId]) return;

    const data = await getGradeDistribution(courseId);
    if (!data.error) {
      setDistributions((prev) => ({
        ...prev,
        [courseId]: data,
      }));
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError("");

      const response = await fetchSyllabi(filters);

      if (response.error) {
        setError(response.error);
        setSyllabi([]);
      } else {
        setSyllabi(response);
        response.forEach((s) => {
          loadGradeDistribution(s.course.id);
        });
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [filters]);

  useEffect(() => {
    async function loadFavoriteIds() {
      const token = localStorage.getItem("token");
      if (!token) return;

      const data = await getFavorites();
      if (data.error || !Array.isArray(data)) return;

      setFavoriteIds(new Set(data.map((s) => s.id)));
    }

    loadFavoriteIds();
  }, []);

  return (
    <div className="browse-container">
      <h2>Browse Syllabi</h2>

      <div
        className="filters-section"
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          name="department"
          placeholder="Dept (e.g. COM SCI)"
          value={filters.department}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="course_number"
          placeholder="Course # (e.g. 35L)"
          value={filters.course_number}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="professor_last_name"
          placeholder="Professor Last Name"
          value={filters.professor_last_name}
          onChange={handleFilterChange}
        />

        <select name="quarter" value={filters.quarter} onChange={handleFilterChange}>
          <option value="">All Quarters</option>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </select>

        <input
          type="number"
          name="year"
          placeholder="Year (e.g. 2024)"
          value={filters.year}
          onChange={handleFilterChange}
        />

        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="downloads_desc">Most Downloaded</option>
          <option value="downloads_asc">Least Downloaded</option>
        </select>
      </div>

      {loading && (
        <div className="syllabi-grid">
          {[1, 2, 3].map((n) => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      )}

      {error && <p style={{ color: "maroon" }}>{error}</p>}

      {!loading && !error && syllabi.length === 0 && (
        <p>Hmm no syllabi found. Try adjusting your search!</p>
      )}

      <div
        className="syllabi-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {!loading &&
          syllabi.map((syllabus) => (
            <div
              key={syllabus.id}
              className="syllabus-card"
              style={{ border: "1px solid #ccc", padding: "15px", borderRadius: "8px" }}
            >
              <h3>
                {syllabus.course.department} {syllabus.course.course_number}
              </h3>
              <p>
                <strong>Title:</strong> {syllabus.course.course_title}
              </p>
              <p>
                <strong>Professor:</strong> {syllabus.course.professor_first_name}{" "}
                {syllabus.course.professor_last_name}
              </p>
              <p>
                <strong>Term:</strong> {syllabus.quarter} {syllabus.year}
              </p>
              <p>
                <strong>Downloads:</strong> {syllabus.download_count}
              </p>
              <p>
                <strong>Favorites:</strong> {syllabus.favorite_count}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  marginTop: "8px",
                  gap: "8px",
                }}
              >
                <button onClick={() => handleDownload(syllabus.id)}>Download PDF</button>
                <button onClick={() => handleToggleFavorite(syllabus.id)}>
                  {favoriteIds.has(syllabus.id) ? "Unfavorite" : "Favorite"}
                </button>
              </div>

              {distributions[syllabus.course.id] &&
                distributions[syllabus.course.id].percentages && (
                  <div style={{ marginTop: "10px" }}>
                    <strong>Grade Distribution:</strong>
                    {Object.entries(distributions[syllabus.course.id].percentages).map(
                      ([grade, pct]) => (
                        <div key={grade}>
                          {grade}: {pct}%
                        </div>
                      )
                    )}
                  </div>
                )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Browse;
