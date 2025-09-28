import { Button, Card, Container, Row, Col } from 'react-bootstrap';

const Cart = ({ cart, onIncreaseQuantity, onDecreaseQuantity, onRemoveItem }) => {
  const cartItems = Object.values(cart);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Container className="mt-4">
      {cartItems.map((item) => (
        <Card key={item.id} className="mb-2">
          <Card.Body>
            <Row className="align-items-center">
              {/* Nombre y precio unitario */}
              <Col xs={4}>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text>${item.price}</Card.Text>
              </Col>

              {/* Controles de cantidad */}
              <Col xs={4} className="d-flex justify-content-center align-items-center">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onDecreaseQuantity(item.id)}
                >
                  -
                </Button>
                <span className="mx-2">{item.quantity}</span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onIncreaseQuantity(item.id)}
                >
                  +
                </Button>
              </Col>

              {/* Subtotal por producto */}
              <Col xs={2} className="text-end">
                <Card.Text><strong>${item.price * item.quantity}</strong></Card.Text>
              </Col>

              {/* Botón para eliminar todo el producto */}
              <Col xs={2} className="text-end">
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => onRemoveItem(item.id)}
                >
                  X
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}

      {/* Total */}
      <Card className="mt-3">
        <Card.Body>
          <h4>Total: ${total}</h4>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Cart;
