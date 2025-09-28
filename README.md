5. Flujo general de una compra (productos normales, promos y custom)
Paso	Producto normal	Promoción	"Arma tu sushi"
1. Cliente selecciona	productId	promotionId	Ingredientes (ingredientId)
2. Backend obtiene recetas	Sí, por recipeId	Sí, de cada productId incluido en la promo	No hay receta fija, cada ingrediente cuenta directo
3. Calcula total a descontar	Cantidad * receta	Suma de productos incluidos	Suma de ingredientes seleccionados
4. Valida stock	Sí	Sí	Sí
5. Descuenta stock	Sí	Sí	Sí
6. Actualiza availability	Sí, si stock queda en 0	Sí, si stock queda en 0	Sí, si stock queda en 0


1. Nuevos requerimientos que vamos a cubrir
Requerimiento	Cómo lo abordamos en orders
Pago por transferencia	Campo paymentMethod y paymentProof con foto subida a Supabase.
Validación manual de pago	Campo paymentStatus para que el dueño confirme.
Modalidad retiro en tienda vs delivery	Campo deliveryMethod y deliveryFee.
Delivery con costo, retiro gratis	Campo deliveryFee dinámico según elección.
Otros métodos de pago futuros	paymentMethod se deja como string flexible (e.g., "cash", "card", "paypal", "transfer").