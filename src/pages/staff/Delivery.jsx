import { auth, LogoutStaff } from "../../firebase/firebaseAuth";

const Delivery = () => {
    return (
        <>
            <h1>Delivery Page</h1>
            <button onClick={() => LogoutStaff(auth)}>Cerrar Sesión</button>
        </>
    )
};

export default Delivery;