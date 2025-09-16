import { useState } from "react";
import { loginStaff, auth } from "../../firebase/firebaseAuth";
import { useNavigate } from "react-router-dom";


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
                    navigate("/staff/dashboard");
                } else {
                    navigate("/staff/delivery");
                }
            }
        } catch (error) {
            // Manejo de error opcional
        }
        setEmail("");
        setPassword("");
    };

    return (
        <>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="exampleInputEmail1" className="form-label">Email address</label>
                    <input type="email" className="form-control" id="exampleInputEmail1" aria-describedby="emailHelp" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <div id="emailHelp" className="form-text">We'll never share your email with anyone else.</div>
                </div>
                <div className="mb-3">
                    <label htmlFor="exampleInputPassword1" className="form-label">Password</label>
                    <input type="password" className="form-control" id="exampleInputPassword1" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary">Enviar</button>
            </form>
        </>
    );
};

export default Login;