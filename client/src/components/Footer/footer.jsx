import React from 'react';
import './footer.css';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="content_footer">
        <p>The product is in the process of being completed, the research team will complete the most complete product for everyone</p>
        <p>Start : September 2024</p>
      </div>
      <div className="contact-footer">
        <ul>
          <li><i className="fa-brands fa-facebook"></i>https://www.facebook.com/</li>
          <li><i className="fa-solid fa-phone"></i>0359027361</li>
          <li><i className="fa-solid fa-envelope"></i>comnetclassk17@gmail.com</li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;