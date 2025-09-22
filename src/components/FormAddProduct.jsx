import { useState } from "react";
import { addProduct } from "../firebase/firebaseFirestore";
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

     const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        setProduct((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : (type === "file" ? (files[0] || null) : value),
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if(!user || !user.email){
            alert("No hay usuario logueado, no se puede agregar producto")
            return;
        }
       
        setLoading(true);

        await addProduct({    
            ...product, 
            createdBy: user.email });

        setProduct({
            name: "",
            description: "",
            price: 0,
            category: "",
            availability: false,
            imageUrl: null,
        });
    };

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
             <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Subiendo...": "Subir Producto"}</button>
        </form>
    );
};

export default FormAddProduct;