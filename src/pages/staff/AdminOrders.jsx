import { useEffect, useState } from "react";
import { db } from "../../firebase/firebaseFirestore";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc, 
  arrayUnion
} from "firebase/firestore";
import { auth, LogoutStaff } from "../../firebase/firebaseAuth";
import { Container, Card, Button, Spinner, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa";
import { convertToBaseUnit } from "../../utils/UnitConversion";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [processingId, setProcessingId] = useState(null); // para bloquear botones mientras se procesa
  
  // Escuchar órdenes en tiempo real
  useEffect(() => {
    const ordersCol = collection(db, "orders");
    const unsubscribe = onSnapshot(ordersCol, (snapshot) => {
      const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      // ordenar por fecha más reciente primero (si tienes createdAt)
      data.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      setOrders(data);
    });
    return () => unsubscribe();
  }, []);

  // Función que descuenta ingredientes según la receta asociada a cada producto del pedido
  const deductStockForOrder = async (order) => {
    for (const item of order.items) {
      // Busca la receta por productId
      const recipesRef = collection(db, "recipes");
      const q = query(recipesRef, where("productId", "==", item.id));
      const recipeSnap = await getDocs(q);
      if (recipeSnap.empty) {
        console.warn(`No recipe found for product ${item.id} (${item.name})`);
        continue;
      }

      const recipe = recipeSnap.docs[0].data();
      if (!recipe.ingredients || recipe.ingredients.length === 0) {
        console.warn(`No ingredients in recipe for product ${item.id}`);
        continue;
      }

      for (const ing of recipe.ingredients) {
        const ingredientId = ing.ingredientId;
        if (!ingredientId) {
          console.warn("Ingrediente sin id en receta:", ing);
          continue;
        }

        const totalToDeduct = Number(ing.quantity) * Number(item.quantity);

        // Busca el stock por ID
        const stockRef = doc(db, "stock", ingredientId);
        const stockSnap = await getDoc(stockRef);
        if (!stockSnap.exists()) {
          console.warn("No stock found for ingredient:", ingredientId);
          continue;
        }
        const stockData = stockSnap.data();

        // Convierte si es necesario
        const totalToDeductBase = convertToBaseUnit(
          totalToDeduct,
          ing.unit,
          stockData.unit
        );

        await updateDoc(stockRef, {
          quantity: Math.max(0, (stockData.quantity || 0) - totalToDeductBase),
          history: arrayUnion({
            type: "order",
            orderId: order.id,
            date: new Date().toISOString(),
            amount: -totalToDeductBase,
            product: item.name,
            productId: item.id,
            user: order.customer?.name || "",
          }),
        });
      }
    };
  };
    // Confirmar pedido (cambia status y descuenta stock si corresponde)
    const handleConfirm = async (orderId) => {
      setProcessingId(orderId);
      try {
        // obtener la orden desde el state local
        const order = orders.find((o) => o.id === orderId);
        if (!order) throw new Error("Orden no encontrada en memoria");

        // // Evitar doble descuento: sólo descontar si stockDeducted !== true
        if (!order.stockDeducted) {
          await deductStockForOrder(order);
        }

        // Actualizar estado de la orden en Firestore
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          status: "confirmed",
          confirmedAt: new Date().toISOString(),
          stockDeducted: true
        });
        alert("✅ Pedido confirmado y stock actualizado (si aplica).");
      } catch (err) {
        console.error("Error al confirmar pedido:", err);
        alert("Ocurrió un error al confirmar. Revisa la consola.");
      } finally {
        setProcessingId(null);
      }
    };

    // Rechazar pedido (no descuenta stock)
    const handleReject = async (orderId) => {
      if (!orderId) return;
      setProcessingId(orderId);
      try {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, {
          status: "rejected",
          rejectedAt: new Date().toISOString()
        });
        alert("❌ Pedido marcado como rechazado.");
      } catch (err) {
        console.error("Error al rechazar pedido:", err);
        alert("Ocurrió un error al rechazar. Revisa la consola.");
      } finally {
        setProcessingId(null);
      }
    };

    return (
      <Container className="mt-5">
        <Row 
        className="d-flex flex-direction-row justify-content-between align-items-center my-3"
        style={{ color: "#FFFFFF"}}
        > 
          <Col md={10} xs={6}>
            <Link to="/dashboard">
              <FaAngleLeft size={28} color="#fff"/>
            </Link>
          </Col>
          <Col md={2} xs={6}>
            <Button className="btn-secondary" onClick={() => LogoutStaff(auth)}>
              Cerrar Sesión
            </Button>
          </Col>
      </Row>
      <h2 className="text-white">📋 Pedidos</h2>
      {orders.length === 0 
        ? (
          <p className="text-white">No hay pedidos.</p>
          ) : (
            orders.map((order) => {
              const subtotal = order.items.reduce((acc, item) => acc + item.price * item.quantity, 0);
              const deliveryCost = order.deliveryMethod === "delivery" ? 2000 : 0;
              const total = subtotal + deliveryCost;
              return (
                <Card key={order.id} className="p-3 mb-3 bg-dark text-white">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <h5>{order.customer?.name || "Cliente"}</h5>
                      <p style={{ margin: 0 }}>WhatsApp: {order.customer?.whatsapp}</p>
                      <p style={{ margin: 0 }}>Email: {order.customer?.email}</p>
                      <p style={{ margin: 0 }}>Método: {order.deliveryMethod}</p>
                      <p style={{ margin: 0 }}>Dirección: {order.customer?.address}</p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ margin: 0 }}>Subtotal: <strong>${subtotal}</strong></p>
                      {deliveryCost > 0 && <p>Delivery: ${deliveryCost}</p>}
                      <p style={{ margin: 0 }}>Total: <strong>${total}</strong></p>
                      <p style={{ margin: 0 }}>
                        Estado:{" "}
                        <span style={{
                          color:
                            order.status === "confirmed" ? "#4ade80" :
                            order.status === "rejected" ? "#f87171" : "#fbbf24"
                        }}>
                          {order.status}
                        </span>
                      </p>
                      <p style={{ margin: 0, fontSize: 12, opacity: 0.8 }}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                  <hr />
                  <h6>Productos</h6>
                  <ul>
                    {order.items?.map((it, i) => (
                      <li key={i}>
                        {it.name} x {it.quantity} → ${it.price * it.quantity}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 10 }}>
                    {order.status === "pending" || order.status === "pending-payment" 
                    ? (
                      <>
                        <Button
                          variant="success"
                          className="me-2"
                          onClick={() => handleConfirm(order.id)}
                          disabled={processingId === order.id}
                        >
                          {processingId === order.id ? <Spinner animation="border" size="sm" /> : "Confirmar Pago"}
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => handleReject(order.id)}
                          disabled={processingId === order.id}
                        >
                          {processingId === order.id ? <Spinner animation="border" size="sm" /> : "Rechazar Pedido"}
                        </Button>
                      </>
                    ) : order.status === "rejected" 
                    ? (
                      <Button
                        variant="success"
                        onClick={() => handleConfirm(order.id)}
                        disabled={processingId === order.id}
                      >
                        {processingId === order.id ? <Spinner animation="border" size="sm" /> : "Confirmar luego de Pago"}
                      </Button>
                    ) : (
                      <span className="text-success">Pedido confirmado ✅</span>
                    )}
                  </div>
                </Card>
              )
            })
          )
        }
      </Container>
    );
  };


export default AdminOrders;