import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { FaSearch } from 'react-icons/fa';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    // Giả sử bạn có API hoặc dữ liệu sản phẩm tĩnh
    const fetchProducts = async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, products]);

  return (
    <div className="max-w-screen-xl mx-auto p-6">
      <div className="flex items-center mb-6">
        <FaSearch className="text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

export default ProductList;
