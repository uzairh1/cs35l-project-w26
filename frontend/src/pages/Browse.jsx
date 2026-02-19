import React, { useState, useEffect } from 'react';
import { fetchSyllabi } from '../services/api';

const Browse = () => {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // all filters are one state object
  const [filters, setFilters] = useState({
    professor: '',
    course_number: '',
    department: '',
    quarter: '',
    year: '',
    sort: 'newest' 
  });

  // input or dropdown 
  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  // runs on load and whenever filters change
  useEffect(() => {
    // wait 500ms after the user stops typing before calling the API
    const delayDebounceFn = setTimeout(async () => {
      setLoading(true);
      setError('');
      
      const response = await fetchSyllabi(filters);
      
      if (response.error) {
        setError(response.error);
        setSyllabi([]);
      } else {
        // hopefully backend returns an array of syllabus objects
        setSyllabi(response); 
      }
      
      setLoading(false);
    }, 500); 

    // clear timer if the user keeps typing
    return () => clearTimeout(delayDebounceFn);
  }, [filters]); 

  return (
    <div className="browse-container">
      <h2>Browse Syllabi</h2>

      <div className="filters-section" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <input type="text" name="department" placeholder="Dept (e.g. COM SCI)" value={filters.department} onChange={handleFilterChange} />
        <input type="text" name="course_number" placeholder="Course # (e.g. 35L)" value={filters.course_number} onChange={handleFilterChange} />
        <input type="text" name="professor" placeholder="Professor Name" value={filters.professor} onChange={handleFilterChange} />
        
        <select name="quarter" value={filters.quarter} onChange={handleFilterChange}>
          <option value="">All Quarters</option>
          <option value="Fall">Fall</option>
          <option value="Winter">Winter</option>
          <option value="Spring">Spring</option>
          <option value="Summer">Summer</option>
        </select>

        <input type="number" name="year" placeholder="Year (e.g. 2024)" value={filters.year} onChange={handleFilterChange} />

        <select name="sort" value={filters.sort} onChange={handleFilterChange}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="most_downloaded">Most Downloaded</option>
          <option value="least_downloaded">Least Downloaded</option>
        </select>
      </div>

      {loading && <p>Loading syllabi...</p>}
      {error && <p style={{ color: 'maroon' }}>{error}</p>}
      {!loading && !error && syllabi.length === 0 && (
        <p>Hmm no syllabi found. Try adjusting your search!</p>
      )}

      <div className="syllabi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
        {!loading && syllabi.map((syllabus) => (
          <div key={syllabus.id} className="syllabus-card" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h3>{syllabus.department} {syllabus.course_number}</h3>
            <p><strong>Title:</strong> {syllabus.course_title}</p>
            <p><strong>Professor:</strong> {syllabus.professor_first_name} {syllabus.professor_last_name}</p>
            <p><strong>Term:</strong> {syllabus.quarter} {syllabus.year}</p>
            <p><strong>Downloads:</strong> {syllabus.download_count}</p>

            <button disabled>Download PDF</button> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default Browse;