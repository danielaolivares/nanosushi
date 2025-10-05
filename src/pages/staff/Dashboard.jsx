import { Link, useNavigate } from "react-router-dom";
import { LogoutStaff, auth } from "../../firebase/firebaseAuth";
import { Container, Card, Row, Col, Button, Modal, Form } from "react-bootstrap";
import { RiAddBoxLine } from 'react-icons/ri';
import { MdAssignment } from 'react-icons/md';
import { FaBoxes } from 'react-icons/fa';

const Dashboard = () => {
    const navigate = useNavigate();
    const handleAddProduct = () => {
        navigate("/add-product");
    };
    const handleOrders = () => {
        navigate("/admin-orders");
    };
    const handleStocks = () => {
        navigate("/admin-stock");
    };

    return(
        <Container>
            <Row 
            className="d-flex flex-direction-row justify-content-between align-items-center my-3"
            style={{ color: "#FFFFFF"}}
            > 
                <Col md={{ span: 2, offset: 10 }} xs={{ span: 6, offset: 6 }}>
                    <Button className="btn-secondary" onClick={() => LogoutStaff(auth)}>
                        Cerrar Sesión
                    </Button>
                </Col>
            </Row>
            <h1 className="text-white mb-5">Panel de Administración</h1>
            <Row className="d-flex flex-column flex-md-row justify-content-evenly align-items-center text-center ">
                <Col xs={12} md={3}>
                    <Link to="/add-product" style={{ textDecoration: 'none' }}>
                        <Card 
                        style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}
                        className="d-flex flex-column justify-content-center align-items-center p-3 mb-2"
                        >
                            <RiAddBoxLine style={{ fontSize: "3rem", color: "#FFFFFF" }}/>
                            <Card.Title className="pt-2">Agregar Producto</Card.Title>
                        </Card>
                    </Link>
                </Col>
                <Col xs={12} md={3}>
                    <Link to="/admin-orders" style={{ textDecoration: 'none' }}>
                        <Card style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}
                            className="d-flex flex-column justify-content-center align-items-center p-3 mb-2">
                            <MdAssignment style={{ fontSize: "3rem", color: "#FFFFFF" }}/>
                            <Card.Title className="pt-2">Administrar Pedidos</Card.Title>
                        </Card>
                    </Link>
                </Col>
                <Col xs={12} md={3}>
                    <Link to="/admin-stock" style={{ textDecoration: 'none' }}>
                        <Card style={{ backgroundColor: "rgba(217, 217, 217, 0.2)", color:"#FFFFFF" }}
                            className="d-flex flex-column justify-content-center align-items-center p-3 mb-2">
                            <FaBoxes style={{ fontSize: "3rem", color: "#FFFFFF" }}/>
                            <Card.Title className="pt-2">Administrar Stock</Card.Title>
                        </Card>
                    </Link>
                </Col>
            </Row>
        </Container>
    );
};

export default Dashboard;