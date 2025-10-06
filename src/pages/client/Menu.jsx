import { useEffect, useState } from "react";
import { Button, Card, Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import { FaShoppingCart } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getDocs, collection } from "firebase/firestore";
import { readProducts, db } from "../../firebase/firebaseFirestore";
import '../../styles/menuclient.css';

const Menu = ({cart, setCart}) => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [stock, setStock] = useState([]);
    const [recipes, setRecipes] = useState([]);

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

    useEffect(() => {
      const fetchStockAndRecipes = async () => {
        const stockSnap = await getDocs(collection(db, "stock"));
        setStock(stockSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        const recipesSnap = await getDocs(collection(db, "recipes"));
        setRecipes(recipesSnap.docs.map(doc => doc.data()));
      };
      fetchStockAndRecipes();
    }, []);


    const canPrepareProduct = (product, quantity = 1) => {
      const recipe = recipes.find(r => r.productId === product.id);
      if (!recipe || !recipe.ingredients) return true; // Si no hay receta, se asume disponible

      return recipe.ingredients.every(ing => {
        const stockItem = stock.find(s => s.id === ing.ingredientId);
        if (!stockItem) return false;
        // Verifica si hay suficiente stock para la cantidad deseada
        return stockItem.quantity >= Number(ing.quantity) * quantity;
      });
    };

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
        <Container fluid="md">
          <Row className="align-items-center" style={{marginTop: '20px', color: '#FFFFFF'}}>
            <Col xs={10}>
              <h1>Nuestro Menú</h1>
            </Col>
            <Col xs={2}>
              <Link to="/cart" className="cart-icon">
                <FaShoppingCart size={28} color="#fff" />
                {totalItems > 0 && (
                <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
            </Col>
          </Row>
          <Row style={{ marginTop: '20px' }}>
            <Col>
              <Nav className="d-flex flex-nowrap overflow-auto" style={{ whiteSpace: 'nowrap' }}>
                {categories.map((categorie) => (
                  <Nav.Link
                  className={`category-link text-white ${selectedCategory === categorie.key ? "active-category": ""}`}
                  key={categorie.key}
                  active={selectedCategory === categorie.key}
                  onClick={()=> setSelectedCategory(categorie.key)}
                  >
                    {categorie.label}
                  </Nav.Link>
                ))}
              </Nav>
            </Col>
          </Row>
          <Row style={{ marginTop: '20px'}}>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product, index) => (
                <Col 
                key={index}
                xs={{span:12}}
                md={{span:10, offset:1}}
                className="mb-3"
                >
                  <Card xs={12}
                  className={`shadow-sm h-100 position-relative ${!canPrepareProduct(product, getProductQuantity(product.id) + 1) ? "card-disabled" : ""}`}
                  id="card-product"
                  >
                    {/* Overlay para agotado */}
                    {!canPrepareProduct(product, getProductQuantity(product.id) + 1) && (
                      <div className="card-overlay">
                        <span className="agotado-text">Agotado</span>
                      </div>
                    )}
                    <Row>
                      <Col xs={4}>
                      <Card.Img 
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ objectFit: 'cover', width: '100%', height: '200px', borderRadius: '8px' }}
                      />
                      </Col>
                      <Col xs={8} className="py-2 py-md-3">
                      <Row >
                        <Col md={9} xs={12}>
                          <Card.Title >
                            {product.name}
                          </Card.Title>
                          <Card.Text>
                            {product.description}
                          </Card.Text>
                        </Col>
                        <Col md={3} xs={12} className="add-cart">
                          <Card.Text>
                            <strong>
                              ${product.price}
                            </strong>
                          </Card.Text>
                          <Button
                            onClick={() => handleRemoveFromCart(product.id)}
                            disabled={getProductQuantity(product.id) === 0 || !canPrepareProduct(product, getProductQuantity(product.id))}
                            >-</Button>
                          <span className="p-2">{getProductQuantity(product.id)}</span>
                          <Button onClick={() => handleAddToCart(product)}
                            disabled={!canPrepareProduct(product, getProductQuantity(product.id) + 1)}>+</Button>
                        </Col>
                      </Row>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              ))
            ): (
              <Col>
                <h2 className="text-center text-white">
                    No hay productos disponibles en esta categoría
                </h2>
              </Col>
            )
          }
          </Row>
        </Container>
    )
};

export default Menu;