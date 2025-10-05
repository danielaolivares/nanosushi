import { useState, useEffect } from "react";
import { Container, Card, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { db } from "../../firebase/firebaseFirestore";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { auth, LogoutStaff } from "../../firebase/firebaseAuth";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { FaEdit, FaAngleLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { convertToBaseUnit } from "../../utils/UnitConversion";
import StockForm from "../../components/StockForm";

dayjs.extend(isoWeek);

const AdminStockPage = () => {
  const [stock, setStock] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);

  const weekNumber = dayjs().isoWeek();
  const monday = dayjs().isoWeek(weekNumber).startOf("isoWeek");
  const sunday = dayjs().isoWeek(weekNumber).endOf("isoWeek");

  // Cargar stock desde Firestore
  const fetchStock = async () => {
    const snapshot = await getDocs(collection(db, "stock"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => b.week - a.week); // semana actual primero
    setStock(data);
  };

  useEffect(() => {
    fetchStock();
  }, []);

  // Callback que llamará StockForm al agregar un nuevo ingrediente
  const handleAddNewIngredient = (newItem) => {
    setStock((prev) => [newItem, ...prev]);
  };

  // Abrir modal de edición
  const handleOpenModal = (item) => {
    setCurrentItem({ 
      ...item, 
      addedQuantities: item.addedQuantities || []
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setShowModal(false);
  };

  // Guardar cambios en modal
  const handleSaveChanges = async () => {
    if (!currentItem) return;
    // Convertir la cantidad ingresada a la unidad base del ingrediente
  const addAmountBase = convertToBaseUnit(
    currentItem.addAmount,
    currentItem.addAmountUnit || currentItem.unit,
    currentItem.unit // unit base guardada en el stock
  );
    if (addAmountBase <= 0) {
      alert("Ingresa una cantidad válida para agregar.");
      return;
    }

    // Solo guardamos si se agregó cantidad positiva
    const newAddedQuantities = [...(currentItem.addedQuantities || []), addAmountBase];
    const newQuantity =
    Number(currentItem.initialQuantity || 0) +
    newAddedQuantities.reduce((a, b) => a + b, 0);
    // const initialQuantity = Number(currentItem.initialQuantity || 0);
    // const totalAdded = currentItem.addedQuantities?.reduce((a, b) => a + b, 0) || 0;

    const stockRef = doc(db, "stock", currentItem.id);
    await updateDoc(stockRef, {
      addedQuantities: newAddedQuantities,
      quantity: newQuantity,
      lowStockThreshold: Number(currentItem.lowStockThreshold || 0),
      lowStockUnit: currentItem.lowStockUnit || currentItem.unit,
      updatedAt: new Date(),
    });

    // Actualizar estado local
    setStock((prev) =>
    prev.map((s) =>
      s.id === currentItem.id
        ? {
            ...currentItem,
            addedQuantities: newAddedQuantities,
            quantity: newQuantity,
            addAmount: "", // limpia el campo
            addAmountUnit: currentItem.unit,
          }
        : s
    )
  );

    handleCloseModal();
  };

  // Determinar color de alerta
  const getStockColor = (item) => {
    if (item.quantity <= 0) return "🔴";
    if (item.lowStockThreshold && item.quantity <= item.lowStockThreshold) return "🟡";
    return "🟢";
  };

  // Agrupar stock por semana
  const stockByWeek = stock.reduce((acc, item) => {
    if (!acc[item.week]) acc[item.week] = [];
    acc[item.week].push(item);
    return acc;
  }, {});

  return (
    <Container className="mt-4">
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
      <h2 className="text-white">Gestión de Stock</h2>

      {/* Formulario para agregar stock */}
      <StockForm onAdd={handleAddNewIngredient} />

      {Object.keys(stockByWeek)
        .sort((a, b) => b - a)
        .map((week) => (
          <Card key={week} className="mb-3 p-3">
            {/* <h4>Semana {week}</h4> */}
            <h4 style={{ display:"inline"}}>Semana {weekNumber}</h4>
            <span style={{fontWeight: "normal", fontSize: "1rem"}}>
              ( {monday.format("DD MMM")} - {sunday.format("DD MMM")})
            </span>
            {stockByWeek[week].map((item) => (
              <Row key={item.id} className="align-items-center mb-2">
                <Col xs={1}>{getStockColor(item)}</Col>
                <Col xs={3}>{item.ingredientName}</Col>
                <Col xs={2}>
                  {item.quantity} {item.unit} <br />
                  <small>
                    Inicial: {item.initialQuantity} {item.unit} | Agregado: {item.addedQuantities?.join(", ") || 0} {item.unit}
                  </small>
                </Col>
                <Col xs={2}>
                  Alerta: {item.lowStockThreshold || 0} {item.lowStockUnit || item.unit}
                </Col>
                <Col xs={2}>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleOpenModal(item)}
                  >
                    <FaEdit />
                  </Button>
                </Col>
              </Row>
            ))}
          </Card>
        ))}

      {/* Modal de edición */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Ingrediente</Modal.Title>
        </Modal.Header>
        {currentItem && (
          <Modal.Body>
            <Form>
              <Form.Group className="mb-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control type="text" value={currentItem.ingredientName} disabled />
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Agregar cantidad</Form.Label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                <Form.Control
                  type="number"
                  value={currentItem.addAmount || ""}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, addAmount: e.target.value })
                  }
                  placeholder="Cantidad a agregar"
                />
                <Form.Select
                  value={currentItem.addAmountUnit || currentItem.unit}
                  onChange={(e) =>
                    setCurrentItem({ ...currentItem, addAmountUnit: e.target.value })
                  }
                  style={{ maxWidth: 90 }}
                >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="l">l</option>
                    <option value="unidades">unidades</option>
                  </Form.Select>
                </div>
              </Form.Group>
              <Form.Group className="mb-2">
                <Form.Label>Umbral de alerta</Form.Label>
                <Row>
                  <Col xs={8}>
                    <Form.Control
                      type="number"
                      value={Number(currentItem.lowStockThreshold || 0)}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          lowStockThreshold: Number(e.target.value),
                        })
                      }
                    />
                  </Col>
                  <Col xs={4}>
                    <Form.Select
                      value={currentItem.lowStockUnit || currentItem.unit}
                      onChange={(e) =>
                        setCurrentItem({
                          ...currentItem,
                          lowStockUnit: e.target.value,
                        })
                      }
                    >
                      <option value="g">Gramos (g)</option>
                      <option value="kg">Kilos (kg)</option>
                      <option value="ml">Mililitros (ml)</option>
                      <option value="l">Litros (l)</option>
                      <option value="unidades">Unidades</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Form.Group>
            </Form>
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="success" onClick={handleSaveChanges}>Guardar cambios</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminStockPage;