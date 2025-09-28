import { useEffect, useState } from "react";
import { readProducts } from "../../firebase/firebaseFirestore";
import { readIngredients, createRecipe, updateRecipe, readRecipeByProduct } from "../../firebase/firebaseFirestore";
import { Button, Card, Container, Form, Row, Col } from "react-bootstrap";

const RecipeManager = () => {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [recipe, setRecipe] = useState([]);
  const [recipeId, setRecipeId] = useState(null);

  // Cargar productos y lista de ingredientes al inicio
  useEffect(() => {
    const fetchData = async () => {
      const productsData = await readProducts();
      const ingredientsData = await readIngredients();
      setProducts(productsData);
      setIngredients(ingredientsData);
    };
    fetchData();
  }, []);

  // Cuando seleccionamos un producto, cargamos su receta
  useEffect(() => {
    if (selectedProduct) {
      const fetchRecipe = async () => {
        const existingRecipe = await readRecipeByProduct(selectedProduct);
        if (existingRecipe) {
          setRecipe(existingRecipe.ingredients);
          setRecipeId(existingRecipe.id);
        } else {
          setRecipe([]);
          setRecipeId(null);
        }
      };
      fetchRecipe();
    }
  }, [selectedProduct]);

  // Manejar cambios en cantidad
  const handleQuantityChange = (ingredientId, quantity) => {
    setRecipe((prev) =>
      prev.map((item) =>
        item.ingredientId === ingredientId
          ? { ...item, quantity: parseFloat(quantity) }
          : item
      )
    );
  };

  // Agregar un nuevo ingrediente a la receta
  const handleAddIngredient = (ingredientId) => {
    if (!ingredientId) return;

    // Evitar duplicados
    if (recipe.some((item) => item.ingredientId === ingredientId)) return;

    setRecipe((prev) => [
      ...prev,
      { ingredientId, quantity: 0 }
    ]);
  };

  // Eliminar un ingrediente
  const handleRemoveIngredient = (ingredientId) => {
    setRecipe((prev) => prev.filter((item) => item.ingredientId !== ingredientId));
  };

  // Guardar receta en Firebase
  const handleSaveRecipe = async () => {
    if (!selectedProduct || recipe.length === 0) {
      alert("Selecciona un producto y agrega ingredientes");
      return;
    }

    const data = {
      productId: selectedProduct,
      ingredients: recipe,
      createdAt: new Date(),
      createdBy: "admin@nanosushi.cl"
    };

    if (recipeId) {
      await updateRecipe(recipeId, data);
      alert("Receta actualizada correctamente");
    } else {
      await createRecipe(data, selectedProduct);
      alert("Receta creada correctamente");
    }
  };

  return (
    <Container className="mt-4">
      <h2>Gestión de Recetas</h2>

      {/* Selección de producto */}
      <Form.Group className="mb-3">
        <Form.Label>Selecciona un producto</Form.Label>
        <Form.Select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="">-- Selecciona --</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {/* Lista de ingredientes en la receta */}
      {selectedProduct && (
        <>
          <h4>Ingredientes de la receta</h4>
          {recipe.map((item, index) => {
            const ingData = ingredients.find(ing => ing.id === item.ingredientId);
            return (
              <Row key={index} className="align-items-center mb-2">
                <Col xs={4}>{ingData?.name || "Ingrediente desconocido"}</Col>
                <Col xs={3}>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.ingredientId, e.target.value)}
                  />
                </Col>
                <Col xs={2}>{ingData?.unit || ""}</Col>
                <Col xs={3}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveIngredient(item.ingredientId)}
                  >
                    Eliminar
                  </Button>
                </Col>
              </Row>
            );
          })}

          {/* Agregar nuevo ingrediente */}
          <Form.Group className="mt-3">
            <Form.Label>Agregar nuevo ingrediente</Form.Label>
            <Form.Select
              onChange={(e) => handleAddIngredient(e.target.value)}
              defaultValue=""
            >
              <option value="">-- Selecciona un ingrediente --</option>
              {ingredients.map((ing) => (
                <option key={ing.id} value={ing.id}>
                  {ing.name} ({ing.unit})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Button className="mt-3" onClick={handleSaveRecipe}>
            Guardar Receta
          </Button>
        </>
      )}
    </Container>
  );
};

export default RecipeManager;
