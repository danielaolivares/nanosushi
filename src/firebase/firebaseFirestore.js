import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { app } from "./firebaseConfig";
import { uploadImage } from "../supabase/supabaseStorage";
//import { getAuth } from "firebase/auth";

export const db = getFirestore(app);
//const auth = getAuth(app);
//const user = auth.currentUser;

export const addProductAndRecipe = async ({product, ingredients}) => {
  try {
    let imageUrl = null;

    if (product.imageUrl){
      imageUrl = await uploadImage(product.imageUrl);
    }

    const productRef = await addDoc(collection(db, "product"), {
        "name": product.name,
        "description": product.description,
        "price": product.price,
        "category": product.category,
        imageUrl,
        "availability": product.availability,
        "createdAt": new Date(),
        "createdBy": product.createdBy,
        // "updatedAt": new Date(),
        // "updatedBy": product.userEmail
    });
    // 3. Si hay ingredientes, crear receta
    if (ingredients.length > 0) {
      const recipeRef = await addDoc(collection(db, "recipes"), {
        productId: productRef.id,
        ingredients: ingredients,
        createdAt: new Date(),
        createdBy: product.createdBy
      });

      // 4. Actualizar producto con referencia a la receta
      await updateDoc(doc(db, "product", productRef.id), {
        recipeId: recipeRef.id
      });
    }
    
    // console.log("Document written with ID: ", docRef.id);
    return productRef.id;

  } catch (e) {
    console.error("Error adding document: ", e);
    throw e;
  }
};

export const createRecipeForProduct = async (productRef, recipeData) => {
  // 1. Crear la receta
  const recipeRef = await addDoc(collection(db, "recipes"), {
    productId: productRef.id,
    ingredients: recipeData.ingredients,
    createdAt: new Date(),
    createdBy: recipeData.createdBy
  });

  // 2. Actualizar el producto con el ID de la receta
  await updateDoc(productRef, {
    recipeId: recipeRef.id
  });

  return recipeRef;
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

export const readRecipes = async () => {
  const querySnapshot = await getDocs(collection(db, "recipes"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const updateRecipe = async (recipeId, updates) => {
  const recipeRef = doc(db, "recipes", recipeId);
  await updateDoc(recipeRef, updates);
};

export const deleteRecipe = async (recipeId) => {
  await deleteDoc(doc(db, "recipes", recipeId));
};
