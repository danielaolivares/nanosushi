import { useState } from "react";
import { loginStaff, auth } from "../../firebase/firebaseAuth";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col } from 'react-bootstrap';
import '../../styles/login.css';


const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const userCredential = await loginStaff(auth, email, password);
            if (userCredential && userCredential.user) {
                if (userCredential.user.email === "admin@nanosushi.cl") {
                    navigate("/dashboard");
                }
                else if (userCredential.user.email === "delivery@nanosushi.cl") {
                    navigate("/delivery");
                }
                else {
                    navigate("/"); // Redirigir a la página de inicio o a otra ruta
                }
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
        setEmail("");
        setPassword("");
    };

    return (
        <Container fluid className="d-flex justify-content-center align-items-center min-vh-100">
            <Row className="my-3">
                <Col>
                    <form onSubmit={handleSubmit} 
                    className="main-login"
                    >
                        <div className="logo-image">
                            <img src="https://aiplrokyinskfjeyrqrc.supabase.co/storage/v1/object/public/menu-images/logo_sushi.png" alt="Logo Nano Sushi" />
                            <h2>Bienvenidos</h2>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="InputEmail" className="form-label">Email</label>
                            <input type="email" className="form-control" id="InputEmail" aria-describedby="emailHelp" placeholder="Ingresa tu email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="InputPassword" className="form-label">Password</label>
                            <input type="password" className="form-control" placeholder="Ingresa tu clave" id="InputPassword" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="d-grid gap-2">
                            <Button type="submit" id="loginButton" className="btn" size="lg">Ingresar</Button>
                        </div>
                    </form>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;