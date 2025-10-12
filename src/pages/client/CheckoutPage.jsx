import { useState } from 'react';
import { Container, Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { db } from '../../firebase/firebaseFirestore';
import { bloquearVentana } from '../../firebase/firebaseFirestore';
import '../../styles/cartPages.css';
import AddressAutocomplete from "../../components/AddressAutocomplete";
import GoogleMapWithPolygons from "../../components/GoogleMapWithPolygons";

const CheckoutPage = ({ cart, setCart, deliveryMethod }) => {
  const navigate = useNavigate();
  const [zone, setZone] = useState(null);
  const [mapLocation, setMapLocation] = useState({ lat: -33.487984, lng: -70.7579365 }); // ubicación inicial (Santiago)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    address: ""
  });

  const cartItems = Object.values(cart);

  // Calcular subtotal
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Calcular hora de entrega automática
  const now = new Date();
  const deliveryTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

  // Calcular ventana de bloqueo para el pedido
const totalPreparationTime = cartItems.reduce((acc, item) => acc + (item.preparationTime || 0), 0);
const bufferTime = 10; // minutos extra
const deliveryMinutes = 45; // minutos de delivery
const totalLeadTime = totalPreparationTime + bufferTime + deliveryMinutes;
const duracionHoras = Math.ceil(totalLeadTime / 60); // duración en horas

  // Calcular el precio de delivery según zona y hora
  function getZonePrice(zone, deliveryTime) {
    if (!zone || !deliveryTime) return 0;
    const [hour, minute] = deliveryTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute;

    if (totalMinutes >= 600 && totalMinutes <= 1260) {
      // 10:00 a 21:00
      if (zone === "zona1") return 1000;
      if (zone === "zona2") return 1500;
    }
    if (totalMinutes >= 1261 && totalMinutes <= 1410) {
      // 21:01 a 23:30
      if (zone === "zona1") return 1500;
      if (zone === "zona2") return 2000;
    }
    return 0;
  }

  // Delivery cost dinámico
  const dynamicDeliveryCost =
    deliveryMethod === "delivery" && zone
      ? getZonePrice(zone, deliveryTime)
      : 0;

  // Calcular total
  const total = deliveryMethod === "delivery"
    ? subtotal + dynamicDeliveryCost
    : subtotal;

  // Actualiza el estado del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Enviar el pedido
  const handleSubmit = async (e) => {
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

  // Guardar el pedido en Firebase
  const order = {
    customer: formData,
    items: cartItems,
    deliveryMethod,
    deliveryCost: dynamicDeliveryCost,
    total,
    status: "pending-payment",
    createdAt: new Date().toISOString(),
  };

  try {
    // Bloquear ventana de tiempo en Firestore
    const today = new Date().toISOString().split('T')[0];
    const startHour = parseInt(deliveryTime.split(':')[0]);
    await bloquearVentana(today, startHour, duracionHoras);

    const docRef = await addDoc(collection(db, "orders"), order);

    console.log("Pedido guardado con ID:", docRef.id);

    setCart({});

    navigate("/order-confirmation", { state: { orderId: docRef.id } });
  } catch (err) {
    console.error("Error guardando el pedido:", err);
    alert("Hubo un problema al procesar tu pedido. Intenta nuevamente.");
  }
};

  return (
    <Container className="mt-4">
      <Link to="/cart" className="btn btn-secondary mb-3">← volver al carrito</Link>
      <Row>
        <Col md={{span: 6, offset: 3}}>
          <h2 className="text-white">Datos para tu Pedido</h2>
          <Form onSubmit={handleSubmit} className="text-white">
            <Card className="p-3 mt-3" style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}>
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
                  id="placeholderName"
                  style={{ backgroundColor: "#44448670", color: "#FFFFFF" }}
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
                  id="placeholderEmail"
                  required
                  style={{ backgroundColor: "#44448670", color: "#FFFFFF" }}
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
                  id="placeholderWhatsapp"
                  required
                  style={{ backgroundColor: "#44448670", color: "#FFFFFF" }}
                />
              </Form.Group>
              {deliveryMethod === "delivery" && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Dirección para Delivery</Form.Label>
                    <AddressAutocomplete
                      value={formData.address}
                      onChange={handleChange}
                      onLocationChange={setMapLocation}
                    />
                    {/* Mensaje si falta numeración */}
                    {formData.address && !/\d/.test(formData.address) && (
                      <div
                        style={{
                          color: "#ff2d2d",
                          fontWeight: "bold",
                          fontSize: "1rem",
                          marginTop: "8px"
                        }}
                      >
                        Por favor, ingresa la numeración de tu dirección para una mejor ubicación en Google Maps.
                      </div>
                    )}
                  </Form.Group>
                  <Card className="p-3 mb-3" style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}>
                    <h4>Ubicación en Google Maps</h4>
                    <GoogleMapWithPolygons location={mapLocation} onZoneChange={setZone} />
                    {zone && (
                      <div className="text-info">
                        Cobro {zone === "zona1" ? "zona 1" : "zona 2"}: ${getZonePrice(zone, deliveryTime)}
                      </div>
                    )}
                    {!zone && <div style={{
      color: "#ff2d2d",
      fontWeight: "bold",
      fontSize: "1.2rem",
      marginTop: "10px"
    }} >Ubicación fuera de zonas de reparto</div>}
                  </Card>
                </>
              )}
            </Card>
            <Card className="p-3 mt-3" style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}>
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
                  <Col className="text-end">${dynamicDeliveryCost}</Col>
                </Row>
              )}
              <Row className="mt-2">
                <Col><strong>Total</strong></Col>
                <Col className="text-end"><strong>${total}</strong></Col>
              </Row>
            </Card>
            <Card className="p-3 mt-3" style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}>
              <h4>Datos para Transferencia</h4>
              <p><strong>Banco:</strong> Banco Estado</p>
              <p><strong>Cuenta Corriente:</strong> 123456789</p>
              <p><strong>Nombre:</strong> Sushi Local SpA</p>
              <p><strong>RUT:</strong> 76.123.456-7</p>
              <p><strong>Email:</strong> pedidos@sushi.cl</p>
              <p>
                Para que tu pedido sea confirmado debes envíar el comprobante de transferencia a nuestro WhatsApp:{" "}
                <br/>
                <a href="https://wa.me/56912345678" target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color:"#444867" }}>
                  <strong> +56 9 1234 5678</strong>
                </a>
              </p>
            </Card>
            <Button
              style={{ backgroundColor: "#625DB1", color: "#FFFFFF" }}
              type="submit"
              className="mt-3 mb-5 w-100"
            >
              Finalizar Pedido
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage;