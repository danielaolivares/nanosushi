import { getFirestore, collection, addDoc } from "firebase/firestore";
import { app } from "./firebaseConfig";
import { getAuth } from "firebase/auth";

export const db = getFirestore(app);
const auth = getAuth(app);
const user = auth.currentUser;
console.log("Usuario actual:", user ? user.email : "No hay usuario logueado");
export const addProduct = async (product) => {
  try {
    const docRef = await addDoc(collection(db, "product"), {
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        "imageUrl": product.imageUrl,
        "availability": true,
        "createdAt": new Date(),
        "createdBy": user.email,
        // "updatedAt": new Date(),
        // "updatedBy": product.userEmail
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};
