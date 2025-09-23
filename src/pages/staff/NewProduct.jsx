import FormAddProduct from "../../components/FormAddProduct";
import { auth, LogoutStaff } from "../../firebase/firebaseAuth";

const NewProduct = () => {
    return (
        <>
            <h1>Agregar Nuevo Producto</h1>
            <FormAddProduct />
            <button onClick={() => LogoutStaff(auth)}>Cerrar Sesión</button>
        </>
    );
};

export default NewProduct;