import { LogoutStaff, auth } from "../../firebase/firebaseAuth";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
    const navigate = useNavigate();
    const handleAddProduct = () => {
        navigate("/staff/add-product");
    };

    return(
        <>
        <h1>Este es un dashboard para el staff</h1>
        <button onClick={handleAddProduct}>Agregar Producto</button>
        <button onClick={() => LogoutStaff(auth)}>Cerrar Sesión</button>
        </>
    );
};

export default Dashboard;