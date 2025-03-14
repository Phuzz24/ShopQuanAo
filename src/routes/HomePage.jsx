import React from 'react';
import { Helmet } from "react-helmet";
import About from '../components/About'
import SliderComponent from '../components/SliderComponent';
import CustomerReviews from '../components/CustomerReview';
import AdModal from '../components/AdModal';
import HotPage from './HotPage';
import AdBanner from '../components/AdBanner';
const HomePage = () => {
  return (
    <div>
      <Helmet>
        <title>Trang chủ</title>
      </Helmet>
      {/*Quảng cáo */}
      <AdModal />
      <AdBanner/>

      
      <SliderComponent />
      <About />
      <HotPage />
      <CustomerReviews />

    </div>
  );
};

export default HomePage;
