import { LogoutStaff } from "../../firebase/firebaseAuth";
import { auth } from "../../firebase/firebaseAuth";

const Dashboard = () => {
    return(
        <>
        <h1>Este es un dashboard para el staff</h1>

        <button onClick={() => LogoutStaff(auth)}>Cerrar Sesión</button>
        </>
    )
};

export default Dashboard;