import { useEffect, useState } from "react";
import { readProducts } from "../../firebase/firebaseFirestore";
import { Button, Card, Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import '../../styles/menuclient.css';

const Menu = ({cart, setCart}) => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Obtener cantidad total en el carrito
  const totalItems = Object.values(cart).reduce((acc, item) => acc + item.quantity, 0);

    //obtenemos productos desde Firebase una sola vez
    useEffect(() => {
        const fetchData = async () => {       
            const productsData = await readProducts();
            setProducts(productsData)
        };
        fetchData();
    }, []);

    //filtramos productos según la categoría seleccionada
    const filteredProducts = 
    selectedCategory === "all"
    ? products 
    : products.filter((product) => product.category === selectedCategory);

    //categoría para la navbar
    const categories = [
        {key: "all", label: "Todos"},
        {key: "1", label: "Env Ciboulette"},
        {key: "2", label: "Env Sésamo"},
        {key: "3", label: "Rolls Tempura"},
        {key: "4", label: "Hosomakis"},
        {key: "5", label: "Env Palta"},
        {key: "6", label: "Env Queso"},
        {key: "7", label: "Env Salmón"},
        {key: "8", label: "Sin arroz"},
        {key: "9", label: "Extras"},
        {key: "10", label: "Gohan"},
    ];

    const handleAddToCart = (product) => {
  setCart((prevCart) => {
    const currentProduct = prevCart[product.id] || {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 0
    };

    return {
      ...prevCart,
      [product.id]: {
        ...currentProduct,
        quantity: currentProduct.quantity + 1
      }
    };
  });
};

    const handleRemoveFromCart = (productId) => {
  setCart((prevCart) => {
    const currentProduct = prevCart[productId];
    if (!currentProduct) return prevCart;

    const updatedQuantity = currentProduct.quantity - 1;

    if (updatedQuantity <= 0) {
      // Eliminar el producto del carrito si llega a 0
      const { [productId]: _, ...rest } = prevCart;
      return rest;
    }

    return {
      ...prevCart,
      [productId]: {
        ...currentProduct,
        quantity: updatedQuantity
      }
    };
  });
};

    const getProductQuantity = (productId) => {
  return cart[productId]?.quantity || 0;
};

    return (
        <Container fluid="sm">
            {/* Ícono del carrito con badge */}
        <Link to="/cart" className="cart-icon">
          <FaShoppingCart size={28} color="#fff" />
          {totalItems > 0 && (
            <span className="cart-badge">{totalItems}</span>
          )}
        </Link>
        {/*Navbar para filtrar*/}
        <h1 className="text-white">Nuestro Menú</h1>
        <Navbar xs={6} sm={12}>
             <Container fluid className="navbar menu-navbar">
                    <Nav className="navbar-container category-nav">
                        {categories.map((categorie) => (
                            <Nav.Link 
                            className={`category-link text-white nav-item ${
                    selectedCategory === categorie.key ? "active-category" : ""
                  }`}
                            key={categorie.key} 
                            active={selectedCategory === categorie.key}
                            onClick={() => setSelectedCategory(categorie.key)}
                            >
                                {categorie.label}
                            </Nav.Link>
                        ))}
                    </Nav>
            </Container> 
        </Navbar>
        <Container fluid="sm" >
             <Row>
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                        <Col key={index} 
                        xs={{ span: 10, offset:1 }} 
                        className="mb-3">
                            <Card 
                            xs={ 12 }
                            className="shadow-sm h-100" 
                            id="card-product">
                               <Row 
                               xs={{span: 10, offset:1}}>
                                    <Col 
                                    xs={4}>
                                         <Card.Img
                                            id="product-image"
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="img-fluid card-img"
                                            style={{ objectFit: 'cover', width: '100%', maxHeight: '120px', borderRadius: '8px' }}
                                        />
                                    </Col>
                                    <Col 
                                    xs={8}>
                                       <Card.Body>
                                        <Row>
                                            <Col style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <Card.Title className="mb-2" style={{ display: 'inline-block'}}>{product.name}</Card.Title>
                                                <Card.Text style={{ display: 'inline-block'}}><strong>$ {product.price}</strong></Card.Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col xs={10}>
                                                <Card.Text className="mb-2" style={{color: '#FFFFFF'}}>{product.description}</Card.Text>
                                            </Col>
                                            <Col xs={2} className="add-cart">
                                                <Button 
                                                onClick={() => handleRemoveFromCart(product.id)}
                                                disabled={getProductQuantity(product.id) === 0}>-</Button>
                                                <span>{getProductQuantity(product.id)}</span>
                                                {/* <Button
                                                onClick={() => handleAddToCart(product.id)}
                                                >+</Button> */}
                                                <Button onClick={() => handleAddToCart(product)}>+</Button>
                                            </Col>      
                                        </Row>
                                        </Card.Body>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>
                    ))
                ) : (
                    <Col>
                        <p className="text-center">
                            No hay productos disponibles en esta categoría
                        </p>
                    </Col>
                )}
            </Row> 
        </Container>
        </Container>
    )
};

export default Menu;