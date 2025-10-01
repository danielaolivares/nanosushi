import { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';

const CheckoutPage = ({ cart, setCart, deliveryMethod, deliveryCost }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    address: ""
  });

  const cartItems = Object.values(cart);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = deliveryMethod === "delivery" ? subtotal + deliveryCost : subtotal;
console.log(deliveryMethod);
  // Actualiza el estado del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Enviar el pedido
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validación rápida
    if (!formData.name || !formData.email || !formData.whatsapp) {
      alert("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (deliveryMethod === "delivery" && !formData.address) {
      alert("Por favor, ingresa tu dirección para el delivery.");
      return;
    }

    // Aquí guardarías el pedido en Firebase
    const order = {
      customer: formData,
      items: cartItems,
      deliveryMethod,
      total,
      status: "pending-payment", // luego se confirmará manualmente
      createdAt: new Date().toISOString(),
    };

    console.log("Pedido confirmado:", order);

    // Limpiar carrito
    setCart({});

    // Navegar a página de confirmación visual
    navigate("/order-confirmation", { state: { order } });
  };

  return (
    <Container className="mt-4">
      <Link to="/cart" className="btn btn-secondary mb-3">← volver al carrito</Link>
      <h2 className="text-white">Datos para tu Pedido</h2>

      <Form onSubmit={handleSubmit} className="text-white">
        <Card className="p-3 mt-3">
          <h4>Información del Cliente</h4>
          <Form.Group className="mb-3">
            <Form.Label>Nombre completo</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Tu nombre"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>WhatsApp</Form.Label>
            <Form.Control
              type="tel"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="+569XXXXXXXX"
              required
            />
          </Form.Group>

          {deliveryMethod === "delivery" && (
            <Form.Group className="mb-3">
              <Form.Label>Dirección para Delivery</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle 123, Comuna"
                required
              />
            </Form.Group>
          )}
        </Card>

        <Card className="p-3 mt-3">
          <h4>Resumen del Pedido</h4>
          {cartItems.map((item) => (
            <Row key={item.id} className="mb-2">
              <Col>{item.name} x {item.quantity}</Col>
              <Col className="text-end">${item.price * item.quantity}</Col>
            </Row>
          ))}
          <hr />
          <Row>
            <Col>Subtotal</Col>
            <Col className="text-end">${subtotal}</Col>
          </Row>
          {deliveryMethod === "delivery" && (
            <Row>
              <Col>Delivery</Col>
              <Col className="text-end">${deliveryCost}</Col>
            </Row>
          )}
          <Row className="mt-2">
            <Col><strong>Total</strong></Col>
            <Col className="text-end"><strong>${total}</strong></Col>
          </Row>
        </Card>

        <Card className="p-3 mt-3">
          <h4>Datos para Transferencia</h4>
          <p><strong>Banco:</strong> Banco Estado</p>
          <p><strong>Cuenta Corriente:</strong> 123456789</p>
          <p><strong>Nombre:</strong> Sushi Local SpA</p>
          <p><strong>RUT:</strong> 76.123.456-7</p>
          <p><strong>Email:</strong> pedidos@sushi.cl</p>
          <p>
            Para que tu pedido sea confirmado debes envíar el comprobante de transferencia a nuestro WhatsApp:{" "}
            <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer">
              +56 9 1234 5678
            </a>
          </p>
        </Card>

        <Button variant="success" type="submit" className="mt-3">
          Finalizar Pedido
        </Button>
      </Form>
    </Container>
  );
};

export default CheckoutPage;
