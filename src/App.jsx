import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/client/Menu.jsx";
import Login  from "./pages/staff/Login.jsx";
import Dashboard from "./pages/staff/Dashboard.jsx";
import Delivery from "./pages/staff/Delivery.jsx";
import NewProduct from "./pages/staff/NewProduct.jsx";
import CartPage from "./pages/client/CartPage.jsx";
import CheckoutPage from "./pages/client/CheckoutPage.jsx";
import OrderConfirmationPage from "./pages/client/OrderConfirmationPage.jsx";
import AdminOrders from "./pages/staff/AdminOrders.jsx";
import AdminIngredient from "./pages/staff/AdminIngredientsPage.jsx";

export default function AppRouter() {
  const [cart, setCart] = useState([]);
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const deliveryCost = 2000;

  return (
    <Routes>
      {/* <Route path="/" element={<Home />} />
      <Route path="/menu" element={<Menu />} /> */}
      <Route 
      path="/admin-ingredients" 
      element={<AdminIngredient />} 
      />
      <Route 
      path="/order-confirmation" 
      element={<OrderConfirmationPage 
      />} 
      />
      <Route path="/checkout" element={
        <CheckoutPage 
        cart={cart} 
        setCart={setCart} 
        deliveryMethod={deliveryMethod} 
        deliveryCost={deliveryCost} />
        } />
      <Route path="/cart" element={
        <CartPage 
          cart={cart} 
          setCart={setCart} 
          deliveryMethod={deliveryMethod} 
          setDeliveryMethod={setDeliveryMethod} 
        />
        } />
      <Route path="/admin-orders" element={<AdminOrders />} />
      <Route path="/login" element={<Login />} />
      <Route path="/delivery" element={<Delivery />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/add-product" element={<NewProduct />} />
      <Route path="/" element={<Home cart={cart} setCart={setCart}/>}/>
    </Routes>
  );
}
