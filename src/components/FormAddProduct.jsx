import { useState } from "react";
import { addProduct } from "../firebase/firebaseFirestore";
import { useAuth } from "../context/AuthContext";


const FormAddProduct = () => {
    const { user } = useAuth();
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: 0,
        category: "",
        imageUrl: "",
        availability: true,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Agregar el email del creador al producto
        await addProduct({ ...product, emailCreador: user?.email });
        setProduct({
            name: "",
            description: "",
            price: 0,
            category: "",
            imageUrl: "",
            availability: true,
        });
    };

    // Solo mostrar el formulario si el usuario es admin
    if (!user || user.email !== "admin@nanosushi.cl") {
        return <div>No tienes permisos para agregar productos.</div>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <div class="mb-3">
                <label for="name" class="form-label">Nombre</label>
                <input type="text" class="form-control" id="name" placeholder="Ingresa el nombre del producto" name="name" value={product.name} onChange={handleChange} />
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Descripción del producto</label>
                <input type="text" class="form-control" id="description" placeholder="Describe tu producto" name="description" value={product.description} onChange={handleChange} />
            </div>
            <div class="mb-3">
                <label for="price" class="form-label">Precio</label>
                <input type="number" class="form-control" id="price" placeholder="Precio del Producto" name="price" value={product.price} onChange={handleChange} />
            </div>
            <select class="form-select" aria-label="Default select example" name="category" value={product.category} onChange={handleChange}>
                <option selected>selecciona una categoría</option>
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
            <div class="mb-3">
                <label for="formFile" class="form-label">Imagen de referencia</label>
                <input class="form-control" type="file" id="formFile" value={product.imageUrl} onChange={handleChange}/>
            </div>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" role="switch" id="switchAvailability"/>
                <label class="form-check-label" for="switchAvailability">Disponible</label>
            </div>
             <button type="submit" class="btn btn-primary">Subir Producto</button>
        </form>
    );
};

export default FormAddProduct;