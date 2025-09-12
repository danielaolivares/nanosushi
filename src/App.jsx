import { Routes, Route } from "react-router-dom";
import Home from "./pages/client/Home.jsx";
// import Menu from "../pages/client/Menu";
import Login  from "./pages/staff/Login.jsx";
import Dashboard from "./pages/staff/Dashboard.jsx";
import Delivery from "./pages/staff/Delivery.jsx";

export default function AppRouter() {
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} /> */}
      <Route path="/staff/login" element={<Login />} />
      <Route path="/staff/delivery" element={<Delivery />} />
      <Route path="/staff/dashboard" element={<Dashboard />} />
      <Route path="/" element={<Home />}/>
    </Routes>
  );
}
