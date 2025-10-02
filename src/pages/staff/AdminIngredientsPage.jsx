import { useState, useEffect } from "react";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { db } from "../../firebase/firebaseFirestore";
import { collection, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";

const AdminIngredientsPage = () => {
  const [ingredients, setIngredients] = useState([]);
  const [form, setForm] = useState({
    name: "",
    unit: "g", // unidad base
    unitDisplay: "kg", // unidad de compra
    conversionFactor: 1000, // conversión a base
    stock: 0,
  });

  // cargar ingredientes
  useEffect(() => {
    const fetchIngredients = async () => {
      const snapshot = await getDocs(collection(db, "ingredients"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIngredients(data);
    };
    fetchIngredients();
  }, []);

  // actualizar form
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // agregar nuevo ingrediente
  const handleAddIngredient = async (e) => {
    e.preventDefault();

    const newIngredient = {
      name: form.name,
      stock: parseFloat(form.stock) * parseFloat(form.conversionFactor), // siempre en base
      unit: form.unit,
      unitDisplay: form.unitDisplay,
      conversionFactor: parseFloat(form.conversionFactor),
      createdAt: new Date().toISOString(),
    };

    await addDoc(collection(db, "ingredients"), newIngredient);
    alert("Ingrediente agregado ✅");
    window.location.reload(); // rápido refresco (se puede mejorar con estado)
  };

  // sumar stock a un ingrediente existente
  const handleAddStock = async (id, amount, conversionFactor) => {
    const ingRef = doc(db, "ingredients", id);

    // amount está en la unidad de compra, lo paso a unidad base
    const amountInBase = parseFloat(amount) * parseFloat(conversionFactor);

    // busco el ingrediente
    const current = ingredients.find((ing) => ing.id === id);

    await updateDoc(ingRef, {
      stock: current.stock + amountInBase,
    });

    alert("Stock actualizado ✅");
    window.location.reload();
  };

  return (
    <Container className="mt-4 text-white">
      <h2>Gestión de Ingredientes</h2>

      {/* Formulario para agregar nuevo ingrediente */}
      <Card className="p-3 mb-4">
        <h4>Agregar Ingrediente</h4>
        <Form onSubmit={handleAddIngredient}>
          <Row>
            <Col md={3}>
              <Form.Group>
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Unidad Base</Form.Label>
                <Form.Control
                  type="text"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Unidad Compra</Form.Label>
                <Form.Control
                  type="text"
                  name="unitDisplay"
                  value={form.unitDisplay}
                  onChange={handleChange}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Factor Conversión</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  name="conversionFactor"
                  value={form.conversionFactor}
                  onChange={handleChange}
                  required
                />
                <Form.Text className="text-light">
                  ej: 1 kg = 1000 g
                </Form.Text>
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Stock Inicial</Form.Label>
                <Form.Control
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>

            <Col md={1} className="d-flex align-items-end">
              <Button type="submit" variant="success">
                +
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Lista de ingredientes */}
      <h4>Lista de Ingredientes</h4>
      {ingredients.map((ing) => (
        <Card key={ing.id} className="p-3 mb-3">
          <h5>{ing.name}</h5>
          <p>
            Stock actual: {ing.stock} {ing.unit}  
            <br />
            Unidad de compra: {ing.unitDisplay} (1 {ing.unitDisplay} ={" "}
            {ing.conversionFactor} {ing.unit})
          </p>

          {/* sumar stock */}
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              const amount = e.target.amount.value;
              handleAddStock(ing.id, amount, ing.conversionFactor);
            }}
          >
            <Row>
              <Col md={4}>
                <Form.Control
                  type="number"
                  name="amount"
                  placeholder={`Cantidad en ${ing.unitDisplay}`}
                  required
                />
              </Col>
              <Col md={2}>
                <Button type="submit" variant="primary">
                  Agregar Stock
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>
      ))}
    </Container>
  );
};

export default AdminIngredientsPage;
