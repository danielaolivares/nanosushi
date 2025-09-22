import { getFirestore, collection, addDoc, getDocs, } from "firebase/firestore";
import { app } from "./firebaseConfig";
import { uploadImage } from "../supabase/supabaseStorage";
//import { getAuth } from "firebase/auth";

export const db = getFirestore(app);
//const auth = getAuth(app);
//const user = auth.currentUser;

export const addProduct = async (product) => {
  try {
    let imageUrl = null;

    if (product.imageUrl){
      imageUrl = await uploadImage(product.imageUrl);
    }

    const docRef = await addDoc(collection(db, "product"), {
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        // "imageUrl": product.imageUrl,
        imageUrl,
        "availability": product.availability,
        "createdAt": new Date(),
        "createdBy": product.createdBy,
        // "updatedAt": new Date(),
        // "updatedBy": product.userEmail
    });
    console.log("Document written with ID: ", docRef.id);
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};


export const readProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "product"));
    const products = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    return products;
  } catch (e) {
    console.error("Error reading products: ", e);
    return [];
  }
};