import { useState, useEffect } from "react";
import { Form, Button, Row, Col } from "react-bootstrap";
import { collection, getDocs } from "firebase/firestore";
import { addProductAndRecipe, db } from "../firebase/firebaseFirestore";
import { useAuth } from "../context/AuthContext";
import { convertToBaseUnit } from "../utils/UnitConversion";
import "../styles/addProducts.css";

const FormAddProduct = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        availability: false,
        imageUrl: null,
    });
    const [stockList, setStockList] = useState([]);
    const [ingredientName, setIngredientName] = useState("");
    const [quantity, setQuantity] = useState("");
    const [unit, setUnit] = useState("g");
    const [ingredients, setIngredients] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [preparationTime, setPreparationTime] = useState("");

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

    const handleSuggestionClick = (name) => {
      setIngredientName(name);
      setShowSuggestions(false);
    };

    const handleChange = (e) => {
      const { name, value, type, checked, files } = e.target;
      setProduct((prev) => ({
          ...prev,
          [name]: type === "checkbox" ? checked : (type === "file" ? (files[0] || null) : value),
      }));
    };

    // Añadir un nuevo ingrediente vacío
    const handleAddIngredient = () => {
      if (!ingredientName.trim() || !quantity || !unit) {
      alert("Completa todos los campos del ingrediente antes de agregarlo.");
      return;
    }
    // Busca si existe en el stockList
    const stockItem = stockList.find(
      item => item.ingredientName.trim().toLowerCase() === ingredientName.trim().toLowerCase()
    );
    // const ingredientId = stockItem ? stockItem.id : null; // Si existe, usa su id; si no, null o maneja como nuevo
    if (!stockItem) {
      alert("El ingrediente debe existir en el stock. Agrégalo primero en el stock.");
      return;
    }
    setIngredients([
      ...ingredients,
      {
        ingredientId: stockItem.id, // ID real del documento en stock
        ingredientName: stockItem.ingredientName, // Nombre real del stock
        quantity,
        unit,
      }
    ]);
    // Limpia los campos si quieres
    setIngredientName("");
    setQuantity("");
    setUnit("g");
  };

   // Eliminar un ingrediente por índice
  const handleRemoveIngredient = (index) => {
    const updated = [...ingredients];
    updated.splice(index, 1);
    setIngredients(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!user || !user.email){
        alert("No hay usuario logueado, no se puede agregar producto")
        return;
    }
    if (ingredients.length === 0) {
      alert("Debes agregar al menos un ingrediente.");
      return;
    }
    setLoading(true);

    try {
      // Convierte cada ingrediente a la unidad base antes de guardar
      const ingredientsWithBaseUnit = ingredients.map((ing) => {
        // Define la unidad base para cada ingrediente
        let baseUnit = ing.unit === "kg" ? "g" : ing.unit === "l" ? "ml" : ing.unit;
        return {
          ...ing,
          quantity: convertToBaseUnit(ing.quantity, ing.unit, baseUnit),
          unit: baseUnit,
        };
      });
      // Agrega el campo createdBy al producto
      const productWithCreator = { ...product, createdBy: user.email };
      await addProductAndRecipe({
        product: productWithCreator,
        ingredients: ingredientsWithBaseUnit,
      });
      alert("Producto y receta guardados correctamente");
      // Reiniciar formulario
      setProduct({
        name: "",
        description: "",
        price: 0,
        category: "",
        availability: false,
        imageUrl: null,
      });
      setIngredients([]);
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Hubo un error al guardar el producto y la receta");
    } finally {
      setLoading(false);
    }
  }

  // Mostrar loader si la sesión se está estableciendo
  if (user === null) {
    return <div>Verificando sesión...</div>;
  }
  // Solo mostrar el formulario si el usuario es admin
  if (user.email !== "admin@nanosushi.cl") {
    return <div>No tienes permisos para agregar productos.</div>;
  }

    return (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="name" className="form-label">Nombre</label>
            <input type="text" className="form-control" id="name" placeholder="Ingresa el nombre del producto" name="name" value={product.name} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="description" className="form-label">Descripción del producto</label>
            <input type="text" className="form-control" id="description" placeholder="Describe tu producto" name="description" value={product.description} onChange={handleChange} />
          </div>
          <div className="mb-3">
            <label htmlFor="price" className="form-label">Precio</label>
            <input type="number" className="form-control" id="price" placeholder="Precio del Producto" name="price" value={product.price} onChange={handleChange} />
          </div>
          <div>
          <label htmlFor="preparationTime" className="form-label">Tiempo de preparación (minutos)</label>
          <input className="d-flex align-items-center mb-2" style={{ position: "relative", width: "100%" }}
            type="number"
            min="0"
            id="preparationTime"
            placeholder="Ej: 15"
            required
            value={preparationTime}
            onChange={e => setPreparationTime(e.target.value)}
          />
           </div>
           <br />
          
          <select className="form-select" aria-label="Default select example" name="category" value={product.category} onChange={handleChange}>
            <option value="">selecciona una categoría</option>
            <option value="1">Envuelto en Ciboulette</option>
            <option value="2">Envuelto en Sésamo</option>
            <option value="3">Rolls Tempura Panko</option>
            <option value="4">Hosomakis</option>
            <option value="5">Envuelto en palta</option>
            <option value="6">Envuelto en queso</option>
            <option value="7">Envuelto en Salmón</option>
            <option value="8">Rolls sin arroz</option>
            <option value="9">Extras</option>
            <option value="10">Gohan</option>
          </select>     
          <div className="mb-3">
            <label htmlFor="formFile" className="form-label">Imagen de referencia</label>
            <input 
            className="form-control" 
            type="file" 
            id="formFile"
            name="imageUrl"
            onChange={ handleChange}
            />
          </div>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id="switchAvailability"
              name="availability"
              checked={product.availability}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="switchAvailability">Disponible</label>
          </div>
          {/* Ingredientes dinámicos */}
          <h4 className="mt-4" style={{ color: '#FFFFFF'}}>Ingredientes</h4>
          {/* --- Bloque para agregar un nuevo ingrediente --- */}
          
          <div className="d-flex align-items-center mb-2" style={{ position: "relative", width: "100%" }}>
          <Row>
              <Col xs={12} md={6}>
            <div style={{ flex: 2, position: "relative" }}>
              <input
                type="text"
                placeholder="Ingrediente (ej: arroz, nori)"
                className="form-control mb-2"
                value={ingredientName}
                onChange={e => setIngredientName(e.target.value)}
                autoComplete="off"
                // required
                onFocus={() => setShowSuggestions(filteredSuggestions.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 100)}
              />
              {showSuggestions && (
                <ul
                  className="list-group position-absolute w-100"
                  style={{ zIndex: 10, 
                    // maxHeight: 150, 
                    overflowY: "auto" }}
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
            </div>
            </Col>
            <Col xs={8} md={3}>
            <input
              type="number"
              step="0.01"
              placeholder="Cantidad"
              className="form-control mb-2"
              // style={{ maxWidth: "100px" }}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              // required
            />
            </Col>
            <Col xs={4} md={3}>
            <select
              className="form-select mb-2"
              // style={{ maxWidth: "90px" }}
              value={unit}
              onChange={e => setUnit(e.target.value)}
            >
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="ml">ml</option>
              <option value="l">l</option>
              <option value="unidades">unidades</option>
            </select>
            </Col>
            <Col xs={12}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleAddIngredient}
            >
              + Agregar Ingrediente
            </button>
            </Col>
            </Row>
          </div>
          
          {/* --- Listado de ingredientes agregados --- */}
          {ingredients.length > 0 && (
            <ul className="list-group mb-3 mt-3">
              {ingredients.map((ingredient, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                  <span>
                    {ingredient.ingredientName} - {ingredient.quantity} {ingredient.unit}
                  </span>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button 
          style={{ backgroundColor: "#625DB1", color: "#FFFFFF" }} 
          type="submit" 
          className="btn my-5 w-100" 
          disabled={loading}>
            {loading ? "Subiendo..." : "Subir Producto"}
          </Button>
        </form>
      );
};

export default FormAddProduct;