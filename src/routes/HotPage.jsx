import React, { useState } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const HotPage = () => {
  // Mảng sản phẩm
  const products = [
    {
      id: 1,
      name: 'iPhone 13 Pro Max',
      price: 29990000,
      description: 'Màn hình OLED 6.7-inch, chip A15 Bionic mạnh mẽ, camera cải tiến với độ phân giải cao.',
      image: 'https://via.placeholder.com/350x350',
    },
    {
      id: 2,
      name: 'Samsung Galaxy S21',
      price: 22990000,
      description: 'Màn hình Dynamic AMOLED 120Hz, camera 108MP, hiệu suất mạnh mẽ với Exynos 2100.',
      image: 'https://via.placeholder.com/350x350',
    },
    {
      id: 3,
      name: 'Xiaomi Mi 11',
      price: 19990000,
      description: 'Màn hình AMOLED 120Hz, chip Snapdragon 888, camera 108MP, pin 4600mAh.',
      image: 'https://via.placeholder.com/350x350',
    },
    {
      id: 4,
      name: 'OnePlus 9 Pro',
      price: 28990000,
      description: 'Màn hình Fluid AMOLED 120Hz, camera Hasselblad 48MP, hiệu suất nhanh với Snapdragon 888.',
      image: 'https://via.placeholder.com/350x350',
    },
    {
      id: 5,
      name: 'Google Pixel 6',
      price: 24990000,
      description: 'Màn hình OLED 90Hz, chip Google Tensor, camera cải tiến với AI.',
      image: 'https://via.placeholder.com/350x350',
    },
    {
      id: 6,
      name: 'Huawei P40 Pro',
      price: 31990000,
      description: 'Màn hình OLED 6.58-inch, camera Leica 50MP, chip Kirin 990 5G.',
      image: 'https://via.placeholder.com/350x350',
    },
    {
      id: 7,
      name: 'Sony Xperia 1 II',
      price: 35990000,
      description: 'Màn hình 4K HDR OLED, chip Snapdragon 865, camera 64MP.',
      image: 'https://via.placeholder.com/350x350',
    },
    {
      id: 8,
      name: 'Oppo Find X3 Pro',
      price: 34990000,
      description: 'Màn hình AMOLED 120Hz, chip Snapdragon 888, camera 50MP.',
      image: 'https://via.placeholder.com/350x350',
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Hiển thị 4 sản phẩm, mỗi lần chuyển 2 sản phẩm
  const displayProducts = products.slice(currentIndex, currentIndex + 4);

  // Hàm chuyển sản phẩm sang bên phải (Next)
  const handleNext = () => {
    if (currentIndex < products.length - 4) {
      setCurrentIndex(currentIndex + 2);  // Chuyển 2 sản phẩm mỗi lần
    }
  };

  // Hàm chuyển sản phẩm sang bên trái (Previous)
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 2);  // Chuyển 2 sản phẩm mỗi lần
    }
  };

  return (
    <div className="bg-gray-100 py-20">
      {/* Tiêu đề trang */}
      <section className="text-center mb-16">
        <h2 className="text-5xl font-extrabold text-blue-600 mb-6">Sản Phẩm Nổi Bật</h2>
        <p className="text-lg text-gray-600 mx-auto max-w-4xl mb-8">
          Khám phá các sản phẩm hot nhất của chúng tôi với công nghệ tiên tiến, thiết kế đẹp mắt và hiệu suất vượt trội.
        </p>
      </section>

      {/* Các sản phẩm nổi bật */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mb-8 mx-auto transition-all duration-500 ease-in-out">
        {displayProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
            data-aos="zoom-in"
          >
            <div className="absolute top-2 left-2 bg-red-600 text-white py-1 px-4 rounded-md text-xs font-bold">Hot</div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-56 object-cover rounded-lg mb-4 transition-all duration-300 group-hover:opacity-90"
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{product.name}</h3>
            <p className="text-gray-600 mb-4">{product.description}</p>
            <p className="text-lg font-bold text-red-600 mb-4">{product.price.toLocaleString()} VND</p>
            <button className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
              Mua Ngay
            </button>
          </div>
        ))}
      </section>

      {/* Nút Next và Previous */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          onClick={handlePrev}
          className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition-all duration-300"
          disabled={currentIndex === 0}
        >
          &lt; Previous
        </button>
        <button
          onClick={handleNext}
          className="bg-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-400 transition-all duration-300"
          disabled={currentIndex === products.length - 4}
        >
          Next &gt;
        </button>
      </div>
    </div>
  );
};

export default HotPage;
