import { supabase } from "./supabaseClient";

/**
 * Sube un archivo al bucket `menu-images` y devuelve la URL pública
 * @param {File} file - Imagen seleccionada desde el formulario
 * @returns {string|null} URL pública de la imagen o null si hay error
 */
export const uploadImage = async (file) => {
  if (!file) {
    console.error("No se recibió ningún archivo para subir.");
    return null
  }

  try {
    // Nombre único para la imagen
    const fileName = `${Date.now()}-${file.name}`;

    // Subir imagen al bucket "menu-images"
    const { data, error } = await supabase.storage
      .from("menu-images") // <- tu bucket correcto
      .upload(fileName, file);

    if (error) {
      console.error("Error subiendo la imagen a Supabase:", error.message);
      return null;
    }
    console.log("Imagen subida con éxito:", data);
    // Obtener la URL pública de la imagen subida
    const { data: publicUrlData } = supabase.storage
      .from("menu-images")
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  } catch (err) {
    console.error("Error inesperado al subir la imagen:", err);
    return null;
  }
};
