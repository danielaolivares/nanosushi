import { useState } from "react";
import { addProductAndRecipe } from "../firebase/firebaseFirestore";
import { useAuth } from "../context/AuthContext";


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
    
    const [ingredients, setIngredients] = useState([]);

     const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setProduct((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : (type === "file" ? (files[0] || null) : value),
        }));
    };

    // Añadir un nuevo ingrediente vacío
  const handleAddIngredient = () => {
    setIngredients([...ingredients, { ingredientId: "", quantity: 0 }]);
  };

   // Eliminar un ingrediente por índice
  const handleRemoveIngredient = (index) => {
    const updated = [...ingredients];
    updated.splice(index, 1);
    setIngredients(updated);
  };

  // Actualizar datos de un ingrediente
  const handleIngredientChange = (index, field, value) => {
    const updated = [...ingredients];
    updated[index][field] = field === "quantity" ? parseFloat(value) : value;
    setIngredients(updated);
  };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!user || !user.email){
            alert("No hay usuario logueado, no se puede agregar producto")
            return;
        }
        setLoading(true);

    try {
      // Agrega el campo createdBy al producto
      const productWithCreator = { ...product, createdBy: user.email };
      await addProductAndRecipe({
        product: productWithCreator,
        ingredients,
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

        // await addProduct({    
        //     ...product, 
        //     createdBy: user.email });

        // setProduct({
        //     name: "",
        //     description: "",
        //     price: 0,
        //     category: "",
        //     availability: false,
        //     imageUrl: null,
        // });


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
      <h4>Ingredientes (opcional)</h4>
      {ingredients.map((ingredient, index) => (
        <div key={index} className="d-flex align-items-center mb-2">
          <input
            type="text"
            placeholder="Ingrediente (ej: arroz, nori)"
            className="form-control me-2"
            value={ingredient.ingredientId}
            onChange={(e) =>
              handleIngredientChange(index, "ingredientId", e.target.value)
            }
            required
          />
          <input
            type="number"
            step="0.01"
            placeholder="Cantidad"
            className="form-control me-2"
            style={{ maxWidth: "100px" }}
            value={ingredient.quantity}
            onChange={(e) =>
              handleIngredientChange(index, "quantity", e.target.value)
            }
            required
          />
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => handleRemoveIngredient(index)}
          >
            ❌
          </button>
        </div>
      ))}

      <button
        type="button"
        className="btn btn-secondary mb-3"
        onClick={handleAddIngredient}
      >
        + Agregar Ingrediente
      </button>

      <br />
             <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Subiendo...": "Subir Producto"}</button>
        </form>
    );
};

export default FormAddProduct;