import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getMyGrade, getSyllabus, submitGrade, updateSyllabus } from "../services/api";

export default function EditUpload() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [grade, setGrade] = useState("");
  const [formData, setFormData] = useState({
    department: "",
    course_number: "",
    course_title: "",
    professor_first_name: "",
    professor_last_name: "",
    quarter: "Winter",
    year: 2026,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login to edit your upload.");
      setLoading(false);
      return;
    }

    async function loadSyllabus() {
      const syllabus = await getSyllabus(id);
      if (syllabus.error) {
        setError("Failed to load syllabus data.");
        setLoading(false);
        return;
      }

      setFormData({
        department: syllabus.course.department || "",
        course_number: syllabus.course.course_number || "",
        course_title: syllabus.course.course_title || "",
        professor_first_name: syllabus.course.professor_first_name || "",
        professor_last_name: syllabus.course.professor_last_name || "",
        quarter: syllabus.quarter || "Winter",
        year: syllabus.year || 2026,
      });

      const myGrade = await getMyGrade(syllabus.course.id);
      if (!myGrade.error && myGrade.grade !== null && myGrade.grade !== undefined) {
        setGrade(String(myGrade.grade));
      }

      setLoading(false);
    }

    loadSyllabus();
  }, [id]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));
    if (file) data.append("file", file);

    const res = await updateSyllabus(id, data);

    if (res.error) {
      setSaving(false);
      setError(res.error);
      return;
    }

    if (grade !== "") {
      const numeric = Number(grade);
      if (Number.isNaN(numeric) || numeric < 0 || numeric > 4) {
        setSaving(false);
        setError("Grade must be between 0.0 and 4.0.");
        return;
      }

      const gradeRes = await submitGrade(res.course.id, numeric);
      if (gradeRes.error) {
        setSaving(false);
        setError(`Syllabus updated, but grade update failed: ${gradeRes.error}`);
        return;
      }
    }

    setSaving(false);
    navigate("/my-uploads");
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading upload...</div>;

  return (
    <div className="browse-container">
      <h2>Edit Upload</h2>
      {error && (
        <p style={{ color: "maroon" }}>
          {error} <Link to="/my-uploads">Back to My Uploads</Link>
        </p>
      )}

      <form onSubmit={handleSubmit} className="filters-section">
        <input
          type="text"
          name="department"
          placeholder="Dept (e.g. COM SCI)"
          value={formData.department}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="course_number"
          placeholder="Course # (e.g. 35L)"
          value={formData.course_number}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="course_title"
          placeholder="Course Title"
          value={formData.course_title}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="professor_first_name"
          placeholder="Professor First Name"
          value={formData.professor_first_name}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="professor_last_name"
          placeholder="Professor Last Name"
          value={formData.professor_last_name}
          onChange={handleInputChange}
          required
        />

        <select name="quarter" value={formData.quarter} onChange={handleInputChange}>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </select>

        <input
          type="number"
          name="year"
          value={formData.year}
          onChange={handleInputChange}
          required
        />

        <input
          type="number"
          min="0"
          max="4"
          step="0.1"
          placeholder="Update your grade (0.0-4.0, optional)"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />

        <label style={{ fontSize: "14px", color: "#555" }}>
          Replace PDF (optional):
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} />
        </label>

        <button type="submit" disabled={saving} style={{ backgroundColor: "#2774AE", color: "white" }}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
