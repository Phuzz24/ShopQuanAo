import React from 'react';
import { Helmet } from "react-helmet";
import About from '../components/About'
import SliderComponent from '../components/SliderComponent';
import CustomerReviews from '../components/CustomerReview';
import AdModal from '../components/AdModal';
import HotPage from './HotPage';
import AdBanner from '../components/AdBanner';
import PhoneMatchIntro from '../components/PhoneMatchIntro';
import PromotionBanner from '../components/PromotionBanner';
const HomePage = () => {
  return (
    <div>
      <Helmet>
        <title>Trang chủ</title>
      </Helmet>
      {/*Quảng cáo */}
      <AdModal />
      <AdBanner/>
      <PromotionBanner />
      
      <SliderComponent />
      <About />
      <PhoneMatchIntro/>
      <HotPage />
      <CustomerReviews />

    </div>
  );
};

export default HomePage;
