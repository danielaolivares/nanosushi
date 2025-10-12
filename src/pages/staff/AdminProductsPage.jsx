import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Table, Button, Modal, Col } from "react-bootstrap";
import { FaAngleLeft } from "react-icons/fa";
import { db } from "../../firebase/firebaseFirestore";
import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { readProducts } from "../../firebase/firebaseFirestore";


const AdminProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [stock, setStock] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [showModal, setShowModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const products = await readProducts();
      setProducts(products);
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

    const handleShowModal = (product) => {
    setProductToDelete(product);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProductToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      await deleteDoc(doc(db, "products", productToDelete.id));
      setShowModal(false);
      setProductToDelete(null);
      // Actualiza la lista
      const products = await readProducts();
      setProducts(products);
    }
  };

 return (
  <>
    <Col md={10} xs={6}>
      <Link to="/dashboard">
        <FaAngleLeft size={28} color="#fff"/>
      </Link>
    </Col>
    <Container className="mt-4">
      <h2 className="mb-4 text-white">Productos</h2>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Precio</th>
            <th>Tiempo (min)</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>${product.price}</td>
              <td>{product.preparationTime} min</td>
              <td>{product.category}</td>
              <td>
                <Button variant="danger" size="sm" onClick={() => handleShowModal(product)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro que deseas eliminar el producto <strong>{productToDelete?.name}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  </>
);
};

export default AdminProductsPage;