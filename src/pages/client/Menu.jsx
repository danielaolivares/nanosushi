import { useEffect, useState } from "react";
import { readProducts } from "../../firebase/firebaseFirestore";


const Menu = () => {
    const [products, setProducts] = useState([]);
    
    
    useEffect(() => {
        const fetchData = async () => {       
            const products = await readProducts();
            setProducts(products)
        };
        fetchData();
    }, [products]);

    return (
        <>
        <h1>Este es el Menu del cliente</h1>

        {products && products.map((product, index) => (
            <div key={index}>
                <img src={product.imageUrl} alt={product.name} style={{ width: '200px', height: '200px', objectFit: 'cover' }} />
                <h2>{product.name}</h2>
                <p>{product.description}</p>
                <p>Precio: ${product.price}</p>
                <p>Categoría: {product.category}</p>
                <p>Disponible: {product.availability ? "Sí" : "No"}</p>
            </div>
        ))}
        </>
    )
};

export default Menu;