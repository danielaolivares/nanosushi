import { useState } from 'react';
import { Button, Card, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Cart from '../../components/Cart';
import '../../styles/cartPages.css';

const CartPage = ({ cart, setCart }) => {
  const [deliveryMethod, setDeliveryMethod] = useState("pickup");
  const navigate = useNavigate();
  const deliveryCost = 2000;
  // Convertimos el carrito en array para iterar fácilmente
  const cartItems = Object.values(cart);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = deliveryMethod === "delivery" ? subtotal + deliveryCost : subtotal;
  
  // Función: aumentar cantidad
  const handleIncreaseQuantity = (productId) => {
    setCart((prevCart) => {
      const currentProduct = prevCart[productId];
      if (!currentProduct) return prevCart;

      return {
        ...prevCart,
        [productId]: {
          ...currentProduct,
          quantity: currentProduct.quantity + 1
        }
      };
    });
  };

  // Función: disminuir cantidad
  const handleDecreaseQuantity = (productId) => {
    setCart((prevCart) => {
      const currentProduct = prevCart[productId];
      if (!currentProduct) return prevCart;

      // Si la cantidad actual es 1, eliminar el producto
      if (currentProduct.quantity === 1) {
        const { [productId]: _, ...rest } = prevCart;
        return rest;
      }

      return {
        ...prevCart,
        [productId]: {
          ...currentProduct,
          quantity: currentProduct.quantity - 1
        }
      };
    });
  };

  // Función: eliminar completamente un producto
  const handleRemoveItem = (productId) => {
    setCart((prevCart) => {
      const { [productId]: _, ...rest } = prevCart;
      return rest;
    });
  };

  return (
    <Container className="mt-4">
      <h2 className="text-white">Tu Carrito</h2>
      <Link to="/" className="btn btn-secondary mb-3">← Seguir comprando</Link>

      {cartItems.length === 0 ? (
        <p className="text-white">Tu carrito está vacío</p>
      ) : (
        <>
          <Cart
            cart={cart}
            onIncreaseQuantity={handleIncreaseQuantity}
            onDecreaseQuantity={handleDecreaseQuantity}
            onRemoveItem={handleRemoveItem}
          />

          {/* Selección de método de entrega */}
          <Card className="mt-3 p-3">
            <Form>
              <Form.Label>Método de entrega:</Form.Label>
              <Form.Check 
                type="radio"
                label="Retiro en tienda (Gratis)"
                value="pickup"
                checked={deliveryMethod === "pickup"}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
              <Form.Check 
                type="radio"
                label={`Delivery (+$${deliveryCost})`}
                value="delivery"
                checked={deliveryMethod === "delivery"}
                onChange={(e) => setDeliveryMethod(e.target.value)}
              />
            </Form>
          </Card>

          {/* Total */}
          <Card className="mt-3 p-3">
            <h4>Subtotal: ${subtotal}</h4>
            {deliveryMethod === "delivery" && <p>Costo delivery: ${deliveryCost}</p>}
            <h3>Total: ${total}</h3>
          </Card>

          <Button 
            className="mt-3" 
            variant="success" 
            onClick={() => navigate("/checkout")}
          >
            Confirmar Pedido
        </Button>
        </>
      )}
    </Container>
  );
};

export default CartPage;
//Carrito de compra.