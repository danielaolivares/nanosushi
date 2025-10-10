import { Button, Card, Container, Form, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Cart from '../../components/Cart';
import '../../styles/cartPages.css';

const CartPage = ({ cart, setCart, deliveryMethod, setDeliveryMethod }) => {
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
    <Container className="mt-4" >
      <Row className="mb-3">
        <Col xs={12} md={8}>
          <h2 className="text-white mb-3">Tu Carrito</h2>
        </Col>
        <Col xs={12} md={4} className="text-md-end text-start">
          <Link to="/" className="btn btn-secondary mb-3">← Seguir comprando</Link>
        </Col>
      </Row>
      {cartItems.length === 0 ? (
        <p className="text-white">Tu carrito está vacío</p>
      ) : (
        <>
        <Row >
          <Col xs={12} md={8}>
            <Card className="mb-3 p-3 card-bg-blur d-flex flex-column flex-md-row" style={{ backgroundColor: "transparent", border: "1px solid #FFFFFF" }}>
              <Cart
                cart={cart}
                onIncreaseQuantity={handleIncreaseQuantity}
                onDecreaseQuantity={handleDecreaseQuantity}
                onRemoveItem={handleRemoveItem}
              />
            </Card>
          </Col>
          <Col xs={12} md={4}>
            {/* Selección de método de entrega */}
            <Card className="mt-3 p-3 card-bg-blur" style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}>
              <Form>
                <Form.Label><strong>Método de entrega:</strong></Form.Label>
                <Form.Check 
                  type="radio"
                  label="Retiro en tienda (Gratis)"
                  value="pickup"
                  checked={deliveryMethod === "pickup"}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
                <Form.Check 
                  type="radio"
                  label={`Delivery (Con costo)`}
                  value="delivery"
                  checked={deliveryMethod === "delivery"}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                />
              </Form>
            </Card>
            {/* Total */}
            <Card className="mt-3 p-3 card-bg-blur" style={{ backgroundColor: "rgba(217, 217, 217, 0.3)", color:"#FFFFFF" }}>
              <h5>Subtotal: ${subtotal}</h5>
              {deliveryMethod === "delivery" && <p>Costo delivery: ${subtotal}</p>}
            </Card>
            <Button 
              className="mt-3 w-100 mb-5" 
              style={{ backgroundColor: "#625DB1", color: "#FFFFFF" }}
              onClick={() => navigate("/checkout")}
            >
              Confirmar Pedido
            </Button>
          </Col>
        </Row>
      </>
    )}
  </Container>
  );
};

export default CartPage;
//Carrito de compra.