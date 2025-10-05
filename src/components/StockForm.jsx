import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { db } from "../firebase/firebaseFirestore";
import { collection, getDocs, addDoc, updateDoc, getDoc, doc } from "firebase/firestore";
import { convertToBaseUnit } from "../utils/UnitConversion";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

const StockForm = ({ user, onAdd }) => {
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g");
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [lowStockThresholdUnit, setLowStockThresholdUnit] = useState("g");
  const [stockList, setStockList] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  useEffect(() => {
    const fetchStock = async () => {
      const snapshot = await getDocs(collection(db, "stock"));
      setStockList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchStock();
  }, []);

  // Filtrar sugerencias al escribir
  useEffect(() => {
    if (ingredientName.trim() === "") {
      setFilteredSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const filtered = stockList.filter(item =>
      item.ingredientName.toLowerCase().includes(ingredientName.toLowerCase())
    );
    setFilteredSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
  }, [ingredientName, stockList]);

  // Al hacer click en una sugerencia
  const handleSuggestionClick = (name) => {
    setIngredientName(name);
    setShowSuggestions(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ingredientName || !quantity || !unit) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    // Buscar si ya existe el ingrediente (ignorando mayúsculas/minúsculas)
    const existing = stockList.find(
      item => item.ingredientName.trim().toLowerCase() === ingredientName.trim().toLowerCase()
    );

    // Determine the base unit for this ingredient
    const baseUnit = unit === "kg" ? "g" : unit === "l" ? "ml" : unit;
    const convertedQuantity = convertToBaseUnit(quantity, unit, baseUnit);
    const convertedThreshold = convertToBaseUnit(lowStockThreshold, lowStockThresholdUnit, baseUnit);
    const currentWeek = dayjs().isoWeek();

    if (existing) {
      // Sumar cantidad al stock existente
      const stockRef = doc(db, "stock", existing.id);
      const newAddedQuantities = [...(existing.addedQuantities || []), convertedQuantity];
      await updateDoc(stockRef, {
        quantity: (existing.quantity || 0) + convertedQuantity,
        addedQuantities: newAddedQuantities,
        lowStockThreshold: convertedThreshold || existing.lowStockThreshold || 0,
        lowStockThresholdUnit: baseUnit,
        updatedBy: user?.email || "admin",
        updatedAt: new Date(),
      });

      //Llamamos al onAdd con el nuevo stock actualizado
      const updatedDoc = await getDoc(stockRef);
      if (onAdd && updatedDoc.exists()){
        onAdd({ id: updatedDoc.id, ...updatedDoc.data()});
      }
    } else {
      // Crear nuevo documento de stock
      const docRef = await addDoc(collection(db, "stock"), {
        ingredientName,
        initialQuantity: convertedQuantity,
        addedQuantities: [],
        quantity: convertedQuantity,
        unit: baseUnit,
        lowStockThreshold: convertedThreshold || 0,
        lowStockThresholdUnit: baseUnit,
        createdBy: user?.email || "admin",
        createdAt: new Date(),
        week: currentWeek
      });

      //Llama a onAdd con el nuevo ingrediente
      const newDoc = await getDoc(docRef);
      if(onAdd && newDoc.exists()){
        onAdd({ id: newDoc.id, ...newDoc.data()});
      }
    }
    setIngredientName("");
    setQuantity("");
    setUnit("g");
    setLowStockThreshold("");
    setLowStockThresholdUnit("g");
  };

  return (
    <Form onSubmit={handleSubmit} className="mb-4">
      <Row className="align-items-end">
        <Col xs={12} md={3} style={{ position: "relative" }}>
          <Form.Label>Ingrediente</Form.Label>
          <Form.Control
            type="text"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            placeholder="Ej: Arroz"
            autoComplete="off"
            required
            onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 100)} // para permitir click en sugerencia
          />
          {showSuggestions && (
            <ul
              className="list-group position-absolute w-100"
              style={{ zIndex: 10, maxHeight: 150, overflowY: "auto" }}
            >
              {filteredSuggestions.map(item => (
                <li
                  key={item.id}
                  className="list-group-item list-group-item-action"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleSuggestionClick(item.ingredientName)}
                >
                  {item.ingredientName}
                </li>
              ))}
            </ul>
          )}
        </Col>
        <Col xs={6} md={2}>
          <Form.Label>Cantidad</Form.Label>
          <Form.Control
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Cantidad"
            required
          />
        </Col>
        <Col xs={6} md={2}>
          <Form.Label>Unidad</Form.Label>
          <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)}>
            <option value="g">Gramos (g)</option>
            <option value="kg">Kilos (kg)</option>
            <option value="ml">Mililitros (ml)</option>
            <option value="l">Litros (l)</option>
            <option value="unidades">Unidades</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Label>Alerta stock bajo</Form.Label>
          <div style={{display: "flex", gap: "0.5rem"}}>
            <Form.Control
              type="number"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              placeholder="Cantidad mínima para alerta"
            />
            <Form.Select
            value={lowStockThresholdUnit}
            onChange={(e) => setLowStockThresholdUnit(e.target.value)}
            style={{maxWidth: 90}}
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="unidades">unidades</option>
            </Form.Select>
          </div>
        </Col>
        <Col xs={6} md={2}>
          <Button type="submit" variant="success">
            Agregar
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default StockForm;
