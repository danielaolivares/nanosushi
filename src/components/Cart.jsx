import { Button, Card, Container, Row, Col } from 'react-bootstrap';

const Cart = ({ cart, onIncreaseQuantity, onDecreaseQuantity, onRemoveItem }) => {
  const cartItems = Object.values(cart);

  const total = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Container className="mt-4"  >
      {cartItems.map((item) => (
        <Card key={item.id} className="mb-2" style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}>
          <Card.Body>
            <Row className="d-flex flex-column flex-md-row flex-wrap gap-3">
              {/* Nombre y precio unitario */}
              <Col xs={12} md={4}>
                <Card.Title>{item.name}</Card.Title>
                <Card.Text><small>${item.price}</small></Card.Text>
              </Col>
              {/* Controles de cantidad */}
              <Col 
              xs={12} 
              md={{span:2, offset: 5}} 
              className="d-flex justify-content-center align-items-center">
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
                <Card.Text style={{display:"flex", padding: "0 20px", alignItems:"center"}}>
                  <strong style={{marginTop:"10px"}}>${item.price * item.quantity}</strong>
                  </Card.Text>
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
      <Card className="mt-3" style={{ backgroundColor: "rgba(217, 217, 217, 0.3)", color:"#FFFFFF" }}>
        <Card.Body>
          <h5>Total: ${total}</h5>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Cart;
