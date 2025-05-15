
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllCategories } from '../api/category';
import './study.css';

function Study() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        const sortedData = data.sort((a, b) => a.id - b.id);
        setCategories(sortedData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        alert('Lỗi khi tải danh mục!');
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="main-cource">
      <h2>Danh sách học phần</h2>
      <div className="cource_module">
        {categories.map((cat) => (
          <Link to={`/category/${cat.id}/courses`} className="subject_module" key={cat.id}>
          <i className="fa-solid fa-briefcase"></i>
          <div className="subject_content">
            <h3>{cat.name}</h3>
            <p>{cat.description || 'Không có mô tả'}</p>
          </div>
        </Link>
        
        ))}
      </div>
    </div>
  );
}

export default Study;
