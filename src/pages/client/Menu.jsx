import { useEffect, useState } from "react";
import { readProducts } from "../../firebase/firebaseFirestore";
import { Button, Card, Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import '../../styles/menuclient.css';
// import '../../styles/menu.css';

const Menu = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    
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

    return (
        <Container fluid="sm">
        {/*Navbar para filtrar*/}
        <h1 className="text-white">Nuestro Menú</h1>
        <Navbar xs={6} sm={12}>
             <Container fluid className="navbar menu-navbar">
                {/*<Navbar.Toggle aria-controls="filter-navbar"/>
                <Navbar.Collapse id="filter-navbar">*/}
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
              {/*  </Navbar.Collapse>*/}
            </Container> 
        </Navbar>
        <Container fluid="sm" >
             <Row 
            //  xs={{span: 10, offset:1}} 
            //  style={{ outline: '1px solid red'}}
            //  sm={12} 
            //  style={{ outline: '1px solid green', display: 'flex', justifyContent: 'center' }}
             >
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product, index) => (
                        <Col key={index} 
                        xs={{ span: 10, offset:1 }} 
                        className="mb-3"
                        // style={{ outline: '1px solid yellow'}}
                         >
                            <Card 
                            xs={ 12 }
                            className="shadow-sm h-100" 
                            id="card-product"

                            >
                               <Row 
                               xs={{span: 10, offset:1}}
                            //    className="g-0 flex-nowrap flex-row"
                               >
                                    <Col 
                                    xs={4} 
                                    // className="d-flex align-items-center"
                                    >
                                         <Card.Img
                                            id="product-image"
                                            src={product.imageUrl}
                                            alt={product.name}
                                            className="img-fluid card-img"
                                            style={{ objectFit: 'cover', width: '100%', maxHeight: '120px', borderRadius: '8px' }}
                                        />
                                    </Col>
                                    <Col 
                                    xs={8} 
                                    // className="d-flex align-items-center" 
                                    >
                                       <Card.Body 
                                    //    className="w-100 card-content" 
                                       >
                                        <Row>
                                            <Col style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <Card.Title className="mb-2" style={{ display: 'inline-block'}}>{product.name}</Card.Title>
                                                <Card.Text style={{ display: 'inline-block'}}><strong>$ {product.price}</strong></Card.Text>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col>
                                            <Card.Text className="mb-2" style={{color: '#FFFFFF'}}>{product.description}</Card.Text>
                                            </Col>
                                        </Row>
                                            {/* 
                                            
                                            
                                            <Button className="btn mt-2" id={product.id}>Agregar al Carro</Button>*/}
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