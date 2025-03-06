import React from 'react';

const SocialLinks = () => (
    <div className="flex justify-center gap-6 mt-6">
      <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
        <i className="fab fa-facebook-f text-3xl"></i>
      </a>
      <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-400">
        <i className="fab fa-instagram text-3xl"></i>
      </a>
      <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
        <i className="fab fa-twitter text-3xl"></i>
      </a>
    </div>
  );
  export default SocialLinks;
  