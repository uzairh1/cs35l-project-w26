/*

import { useState, useEffect } from "react";
import { uploadSyllabus, getCourses } from "../services/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [quarter, setQuarter] = useState("Winter");
  const [year, setYear] = useState(2026);
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCourses() {
      const data = await getCourses();
      if (!data.error) {
        setCourses(data);
      }
    }
    loadCourses();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError("");

    if (!file) return setError("Please select a PDF");
    if (!courseId) return setError("Please select a course");

    const data = new FormData();
    data.append("file", file);
    data.append("course_id", courseId);
    data.append("quarter", quarter);
    data.append("year", year);

    const res = await uploadSyllabus(data);

    if (res.error) {
      setError(res.error);
    } else {
      alert("Syllabus uploaded successfully!");
    }
  };

  return (
    <div className="browse-container">
      <h2>Upload Syllabus</h2>

      <form onSubmit={handleUpload} className="filters-section">

        <select value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.department} {course.course_number} — {course.course_title}
            </option>
          ))}
        </select>

        <select value={quarter} onChange={(e) => setQuarter(e.target.value)}>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </select>

        <input
          type="number"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          required
        />

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />

        <button type="submit" style={{ backgroundColor: "#2774AE", color: "white" }}>
          Upload to Database
        </button>

        {error && <p style={{ color: "maroon" }}>{error}</p>}
      </form>
    </div>
  );
} 
  */

import { useState } from "react";
import { uploadSyllabus } from "../services/api";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    department: "",
    course_number: "",
    course_title: "", 
    professor_first_name: "",
    professor_last_name: "",
    quarter: "Winter",
    year: 2026,
    grade: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a PDF");

    const data = new FormData();
    data.append("file", file);
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    const res = await uploadSyllabus(data);
    if (res.error) {
      alert("Error: " + res.error);
    } else {
      alert("Syllabus uploaded and indexed!");
    }
  };

  return (
    <div className="browse-container">
      <h2>Upload Syllabus</h2>
      <form onSubmit={handleUpload} className="filters-section">
        <input type="text" name="department" placeholder="Dept (e.g. COM SCI)" onChange={handleInputChange} required />
        <input type="text" name="course_number" placeholder="Course # (e.g. 35L)" onChange={handleInputChange} required />
        <input type="text" name="course_title" placeholder="Course Title" onChange={handleInputChange} required />
        <input type="text" name="professor_first_name" placeholder="Professor First Name" onChange={handleInputChange} required />
        <input type="text" name="professor_last_name" placeholder="Professor Last Name" onChange={handleInputChange} required />
        
        <select name="quarter" value={formData.quarter} onChange={handleInputChange}>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </select>

        <input type="number" name="year" value={formData.year} onChange={handleInputChange} required />
        <input
          type="number"
          name="grade"
          min="0"
          max="4"
          step="0.1"
          placeholder="Your Grade (0.0-4.0, optional)"
          value={formData.grade}
          onChange={handleInputChange}
        />
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required />
        
        <button type="submit" style={{backgroundColor: '#2774AE', color: 'white'}}>
          Upload to Database
        </button>
      </form>
    </div>
  );
}
