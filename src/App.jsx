import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/client/Menu.jsx";
import Login  from "./pages/staff/Login.jsx";
import Dashboard from "./pages/staff/Dashboard.jsx";
import Delivery from "./pages/staff/Delivery.jsx";
import NewProduct from "./pages/staff/NewProduct.jsx";
import CartPage from "./components/CartPage.jsx";

export default function AppRouter() {
  const [cart, setCart] = useState([]);
  return (
    <Routes>
      {/* <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} /> */}
      <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-product" element={<NewProduct />} />
      <Route path="/" element={<Home cart={cart} setCart={setCart}/>}/>
    </Routes>
  );
}
