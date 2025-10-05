// import { useState } from "react";
// import { Form, Button, Container, Card } from "react-bootstrap";
// import { db } from "../firebase/firebaseFirestore";
// import { collection, addDoc, Timestamp } from "firebase/firestore";

// const StockForm = ({ user }) => {
//   const [ingredientName, setIngredientName] = useState("");
//   const [quantity, setQuantity] = useState("");
//   const [unit, setUnit] = useState("kg");
//   const [lowStockThreshold, setLowStockThreshold] = useState("");
//   const [message, setMessage] = useState("");

//   // 🔄 Conversión automática a unidades base
//   const convertToBaseUnit = (value, selectedUnit) => {
//     let numericValue = parseFloat(value);
//     if (isNaN(numericValue)) return 0;

//     switch (selectedUnit) {
//       case "kg":
//         return numericValue * 1000; // gramos
//       case "l":
//         return numericValue * 1000; // mililitros
//       default:
//         return numericValue; // unidades, hojas, etc.
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!ingredientName || !quantity) {
//       setMessage("⚠️ Debes completar todos los campos obligatorios.");
//       return;
//     }

//     const convertedQuantity = convertToBaseUnit(quantity, unit);
//     const convertedThreshold = convertToBaseUnit(lowStockThreshold, unit);
//     const baseUnit =
//       unit === "kg" ? "g" : unit === "l" ? "ml" : unit;

//     try {
//       await addDoc(collection(db, "stock"), {
//         ingredientName,
//         quantity: convertedQuantity,
//         unit: baseUnit,
//         lowStockThreshold: convertedThreshold || 0,
//         createdAt: Timestamp.now(),
//         createdBy: user?.email || "admin@nanosushi.cl",
//       });

//       setMessage(`✅ Se agregó correctamente ${quantity} ${unit} de ${ingredientName}.`);
//       setIngredientName("");
//       setQuantity("");
//       setUnit("kg");
//       setLowStockThreshold("");
//     } catch (error) {
//       console.error("Error al guardar stock:", error);
//       setMessage("❌ Hubo un error al guardar el stock.");
//     }
//   };

//   return (
//     <Container className="mt-4 text-white">
//       <Card className="bg-dark p-4">
//         <h3 className="mb-3">📦 Ingresar nuevo stock</h3>

//         <Form onSubmit={handleSubmit}>
//           <Form.Group className="mb-3">
//             <Form.Label>Nombre del producto o ingrediente</Form.Label>
//             <Form.Control
//               type="text"
//               placeholder="Ej: Arroz, Salsa de soya, Nori..."
//               value={ingredientName}
//               onChange={(e) => setIngredientName(e.target.value)}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Cantidad comprada</Form.Label>
//             <Form.Control
//               type="number"
//               placeholder="Ej: 3"
//               value={quantity}
//               onChange={(e) => setQuantity(e.target.value)}
//               required
//             />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Unidad de compra</Form.Label>
//             <Form.Select value={unit} onChange={(e) => setUnit(e.target.value)}>
//               <option value="kg">Kilos (se convertirá a gramos)</option>
//               <option value="l">Litros (se convertirá a mililitros)</option>
//               <option value="u">Unidades</option>
//               <option value="hoja">Hojas</option>
//               <option value="pieza">Piezas</option>
//             </Form.Select>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>⚠️ Avisar cuando quede menos de...</Form.Label>
//             <Form.Control
//               type="number"
//               placeholder="Ej: 1 (para 1 kilo o 1 litro)"
//               value={lowStockThreshold}
//               onChange={(e) => setLowStockThreshold(e.target.value)}
//             />
//             <Form.Text className="text-light">
//               El sistema convertirá este valor automáticamente según la unidad seleccionada.
//             </Form.Text>
//           </Form.Group>

//           <Button variant="success" type="submit">
//             Guardar Stock
//           </Button>
//         </Form>

//         {message && <p className="mt-3">{message}</p>}
//       </Card>
//     </Container>
//   );
// };

// export default StockForm;
import { useState } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { db } from "../firebase/firebaseFirestore";
import { collection, query, where, getDocs, addDoc, updateDoc, getDoc, doc } from "firebase/firestore";
import { convertToBaseUnit } from "../utils/UnitConversion";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
dayjs.extend(isoWeek);

const StockForm = ({ user, onAdd }) => {
  const [ingredientName, setIngredientName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("g"); // g, ml, unidades
  const [lowStockThreshold, setLowStockThreshold] = useState("");
  const [lowStockThresholdUnit, setLowStockThresholdUnit] = useState("g");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!ingredientName || !quantity || !unit) {
      alert("Completa todos los campos obligatorios.");
      return;
    }

    // Determine the base unit for this ingredient
    const baseUnit = unit === "kg" ? "g" : unit === "l" ? "ml" : unit;

    // Convert both quantity and threshold to base unit
    const convertedQuantity = convertToBaseUnit(quantity, unit, baseUnit);
    const convertedThreshold = convertToBaseUnit(lowStockThreshold, lowStockThresholdUnit, baseUnit);
    // let convertedQuantity = Number(quantity);
    // // Conversión automática: kg → g, litros → ml
    // if (unit === "kg") convertedQuantity *= 1000;
    // if (unit === "l") convertedQuantity *= 1000;

    const currentWeek = dayjs().isoWeek();

    // Buscar si ya existe ingrediente esta semana
    const q = query(
      collection(db, "stock"),
      where("ingredientName", "==", ingredientName),
      where("week", "==", currentWeek)
    );
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      // Sumar cantidad al stock existente
      const docRef = snapshot.docs[0].ref;
      const data = snapshot.docs[0].data();
      await updateDoc(docRef, {
        quantity: data.quantity + convertedQuantity,
        lowStockThreshold: Number(lowStockThreshold) || data.lowStockThreshold,
        updatedBy: user?.email || "admin",
        updatedAt: new Date(),
        lowStockThreshold: Number(lowStockThreshold) || 0,
        lowStockThresholdUnit: lowStockThresholdUnit,
      });
      //Llamamos al onAdd con el nuevo stock actualizado
      const updatedDoc = await getDoc(docRef);
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
        // unit: unit === "kg" ? "g" : unit === "l" ? "ml" : unit,
        lowStockThreshold: convertedThreshold || 0,
        lowStockThresholdUnit: baseUnit,
        // lowStockThreshold: Number(lowStockThreshold) || 0,
        // lowStockThresholdUnit: lowStockThresholdUnit,
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
        <Col xs={12} md={3}>
          <Form.Label>Ingrediente</Form.Label>
          <Form.Control
            type="text"
            value={ingredientName}
            onChange={(e) => setIngredientName(e.target.value)}
            placeholder="Ej: Arroz"
            required
          />
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
