import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseFirestore';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { Container, Table, Form, Button, Spinner } from 'react-bootstrap';

const ProductTimes = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsCol = collection(db, 'products');
        const productSnapshot = await getDocs(productsCol);
        const productList = productSnapshot.docs.map(d => ({
          id: d.id,
          ...d.data(),
          // Asignamos 0 si no tiene tiempo de preparación definido
          preparationTime: d.data().preparationTime || 0,
        }));
        setProducts(productList);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleTimeChange = (productId, value) => {
    const newProducts = products.map(p =>
      p.id === productId ? { ...p, preparationTime: parseInt(value, 10) || 0 } : p
    );
    setProducts(newProducts);
  };

  const handleSaveTime = async (productId) => {
    setSavingId(productId);
    try {
      const productToSave = products.find(p => p.id === productId);
      if (productToSave) {
        const productRef = doc(db, 'products', productId);
        await updateDoc(productRef, {
          preparationTime: productToSave.preparationTime,
        });
        alert('¡Tiempo guardado!');
      }
    } catch (error) {
      console.error("Error saving time:", error);
      alert('Error al guardar el tiempo.');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <Spinner animation="border" />;
  }

  return (
    <Container className="mt-5 text-white">
      <h2>⏱️ Tiempos de Preparación de Productos</h2>
      <p>Asigna cuántos minutos toma preparar cada producto. Este tiempo se usará para calcular la hora de entrega.</p>
      <Table striped bordered hover variant="dark">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Tiempo de Preparación (minutos)</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>
                <Form.Control
                  type="number"
                  value={product.preparationTime}
                  onChange={(e) => handleTimeChange(product.id, e.target.value)}
                  style={{ width: '100px' }}
                />
              </td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => handleSaveTime(product.id)}
                  disabled={savingId === product.id}
                >
                  {savingId === product.id ? <Spinner as="span" animation="border" size="sm" /> : 'Guardar'}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default ProductTimes;
