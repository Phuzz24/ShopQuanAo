// src/routes/SalePage.jsx
import React from 'react';
import { motion } from 'framer-motion';

const SalePage = () => {
  const salePhones = [
    { id: 1, name: 'iPhone 13', image: 'src\images\iphone13.jpg', oldPrice: 999, salePrice: 799 },
    { id: 2, name: 'Samsung Galaxy S21', image: '/images/galaxyS21.jpg', oldPrice: 899, salePrice: 749 },
    { id: 3, name: 'Google Pixel 6', image: '/images/pixel6.jpg', oldPrice: 699, salePrice: 599 },
  ];

  return (
    <div className="container mx-auto mt-16 px-6">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Top Sale Phones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {salePhones.map((phone) => (
          <motion.div
            key={phone.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <div className="relative">
              <img
                src={phone.image}
                alt={phone.name}
                className="w-full h-60 object-cover rounded-xl shadow-md"
              />
              <div className="absolute top-4 left-4 text-white font-semibold text-lg px-3 py-1 rounded-lg bg-opacity-50 bg-black">
                Sale
              </div>
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-semibold text-white">{phone.name}</h3>
              <p className="text-lg text-gray-100 mt-2">
                <span className="line-through text-red-400">${phone.oldPrice}</span> ${phone.salePrice}
              </p>
              <button className="mt-4 w-full py-2 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors duration-300">
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SalePage;
