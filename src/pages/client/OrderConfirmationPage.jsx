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

  return (
    <Container className="mt-4">
      <Card className="p-4">
        <h2>🛒 Estado del Pedido</h2>
        <p>Pedido de <strong>{order.customer.name}</strong></p>
        <p>Status actual: <strong>{order.status}</strong></p>

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
          <Col><strong>Total</strong></Col>
          <Col className="text-end"><strong>${order.total}</strong></Col>
        </Row>

        {order.status === "pending" && (
          <p className="mt-3 text-warning">
            Tu transferencia está en revisión, pronto será validada ✅
          </p>
        )}
        {order.status === "confirmed" && (
          <p className="mt-3 text-success">
            Tu pago fue confirmado 🎉 Tu pedido estará listo pronto.
          </p>
        )}
        {order.status === "rejected" && (
          <p className="mt-3 text-danger">
            Hubo un problema con tu pago. Por favor contáctanos.
          </p>
        )}
      </Card>
    </Container>
  );
};

export default OrderConfirmationPage;
