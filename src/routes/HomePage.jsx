import React from 'react';
import { Helmet } from "react-helmet";
import About from '../components/About'
import SliderComponent from '../components/SliderComponent';
import CustomerReviews from '../components/CustomerReview';
import SocialLinks from '../components/SocialLinks';
import Footer from '../components/Footer';
import AdModal from '../components/AdModal';

const HomePage = () => {
  return (
    <div>
      <Helmet>
        <title>Trang chủ</title>
      </Helmet>
      {/*Quảng cáo */}
      <AdModal />

      
      <SliderComponent />
      <About />
      <CustomerReviews />
      <Footer />

    </div>
  );
};

export default HomePage;
