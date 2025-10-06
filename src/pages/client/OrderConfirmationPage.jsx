import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { db } from "../../firebase/firebaseFirestore";
import { doc, onSnapshot } from "firebase/firestore";
import { Container, Card, Row, Col } from "react-bootstrap";

const OrderConfirmationPage = () => {
  const location = useLocation();
  const { orderId } = location.state || {};
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    const unsubscribe = onSnapshot(doc(db, "orders", orderId), (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      }
    });

    return () => unsubscribe();
  }, [orderId]);

  if (!order) {
    return (
      <Container className="mt-4 text-white">
        <h2>Cargando pedido...</h2>
      </Container>
    );
  }
  const statusMap = {
  "pending-payment": { color: "orange", label: "Pendiente de confirmación" },
  "confirmed": { color: "#5ed305", label: "Confirmado" },
  "rejected": { color: "red", label: "Rechazado" }
};

  const statusInfo = statusMap[order.status] || { color: "#fff", label: order.status };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={{span: 6, offset: 3}}>
        <h2 className="text-white mb-3">Estado del Pedido</h2>
          <Card className="p-4" style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}>
            <p>Hola <strong>{order.customer.name}</strong></p>
            <p>
              El estado actual de tu pedido es:{" "}
              <strong style={{ color: statusInfo.color }}>
                {statusInfo.label}
              </strong>
            </p>
            <hr />
            <h4>Resumen</h4>
            {order.items.map((item, index) => (
              <Row key={index} className="mb-2">
                <Col>{item.name} x {item.quantity}</Col>
                <Col className="text-end">${item.price * item.quantity}</Col>
              </Row>
            ))}
            <hr />
            <Row>
              <Col>Subtotal</Col>
              <Col className="text-end">${order.subtotal || order.items.reduce((acc, item) => acc + item.price * item.quantity, 0)}</Col>
            </Row>
            {order.deliveryMethod === "delivery" && (
              <Row>
                <Col>Delivery</Col>
                <Col className="text-end">${order.deliveryCost || 2000}</Col>
              </Row>
            )}
            <Row>
              <Col><strong>Total</strong></Col>
              <Col className="text-end"><strong>${order.total}</strong></Col>
            </Row>
            {order.status === "pending-payment" && (
              <p className="mt-3">
                Tu transferencia está en revisión, pronto será validada
              </p>
            )}
            {order.status === "confirmed" && (
              <p className="mt-3">
                Tu pago fue confirmado.Tu pedido estará listo pronto.
              </p>
            )}
            {order.status === "rejected" && (
              <p className="mt-3">
                Hubo un problema con tu pago. Por favor contáctanos a este número: 
                <strong> +56 9 1234 5678</strong>
              </p>
            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default OrderConfirmationPage;
