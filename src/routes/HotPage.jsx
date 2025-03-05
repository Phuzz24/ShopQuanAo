// src/routes/HotPage.jsx
import React from 'react';
import { motion } from 'framer-motion';

const HotPage = () => {
  const hotPhones = [
    { id: 1, name: 'iPhone 14 Pro', image: '/images/iphone14pro.jpg', price: 1099 },
    { id: 2, name: 'Samsung Galaxy Z Fold 4', image: '/images/galaxyZFold4.jpg', price: 1799 },
    { id: 3, name: 'OnePlus 9 Pro', image: '/images/oneplus9pro.jpg', price: 999 },
  ];

  return (
    <div className="container mx-auto mt-16 px-6">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">Hot Phones</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {hotPhones.map((phone) => (
          <motion.div
            key={phone.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="relative">
              <img
                src={phone.image}
                alt={phone.name}
                className="w-full h-60 object-cover rounded-xl"
              />
            </div>
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-semibold text-gray-800">{phone.name}</h3>
              <p className="text-lg text-gray-700 mt-2">${phone.price}</p>
              <button className="mt-4 w-full py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-300">
                Add to Cart
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default HotPage;
