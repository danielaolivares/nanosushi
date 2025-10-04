import FormAddProduct from "../../components/FormAddProduct";
import { auth, LogoutStaff } from "../../firebase/firebaseAuth";
import { Container, Row, Button, Col } from "react-bootstrap";
import { FaAngleLeft } from 'react-icons/fa';
import { Link } from "react-router-dom";

const NewProduct = () => {
    return (
        <Container>
            <Row 
            className="d-flex flex-direction-row justify-content-between align-items-center my-3"
            style={{ color: "#FFFFFF"}}
            > 
                <Col md={10} xs={6}>
                <Link to="/dashboard">
                    <FaAngleLeft size={28} color="#fff"/>
                </Link>
                </Col>
                <Col md={2} xs={6}>
                    <Button className="btn-secondary" onClick={() => LogoutStaff(auth)}>
                        Cerrar Sesión
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col xs={12} md={{ span:6, offset:3}}>
                    <h1 style={{ color: "#FFFFFF"}}>Agregar Nuevo Producto</h1>
                    <FormAddProduct />
                </Col>
            </Row>
        </Container>
    );
};

export default NewProduct;