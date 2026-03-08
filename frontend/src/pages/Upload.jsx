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
    year: 2026
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
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} required />
        
        <button type="submit" style={{backgroundColor: '#2774AE', color: 'white'}}>
          Upload to Database
        </button>
      </form>
    </div>
  );
}