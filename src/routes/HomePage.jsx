import React from 'react';
import { Helmet } from "react-helmet";
import About from '../components/About'
import SliderComponent from '../components/SliderComponent';
import CustomerReviews from '../components/CustomerReview';
import Footer from '../components/Footer';

const HomePage = () => {
  return (
    <div>
      <Helmet>
        <title>Trang chủ</title>
      </Helmet>
      <SliderComponent />
      <About />
      <CustomerReviews />
      <Footer />
    </div>
  );
};

export default HomePage;
