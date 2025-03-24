import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from '../components/Footer'; // Import Footer
import AdBanner from "../components/AdBanner";
import Breadcrumbs from "../components/BreadCrumb";
const UserLayout = () => {
  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-4">
        <Breadcrumbs /> {/* Add Breadcrumbs */}
      </div>

      <main className="p-0">
        <Outlet />
      </main>
      <div className="mt-8">
      <Footer />
      </div>
    </div>
  );
};

export default UserLayout;
