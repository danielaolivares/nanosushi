// agrupa productos por categoría
// {
//   "name": "Promo Hosomaki + Bebida",
//   "description": "Hosomaki a elección + bebida 200cc",
//   "productsIncluded": [
//     {
//       "productId": "hosomaki-salmon",
//       "quantity": 1
//     },
//     {
//       "productId": "bebida-200cc",
//       "quantity": 1
//     }
//   ],
//   "discountType": "fixed",       // "fixed" = precio fijo, "percent" = descuento porcentual
//   "discountValue": 4000,         // precio final si es "fixed", o % si es "percent"
//   "availability": true,
//   "validFrom": "2025-10-01T00:00:00Z",
//   "validTo": "2025-10-07T23:59:59Z",
//   "createdAt": "2025-09-26T14:30:00Z",
//   "createdBy": "admin@nanosushi.cl"
// }

// VENTAJAS
// Puedes activar/desactivar promos fácilmente sin tocar productos.

// Manejas promos con fechas de inicio y término para programarlas con anticipación.

// Los productos incluidos se vinculan por productId, por lo que si se actualiza el precio de un producto, la promo no se rompe.

// Cuando alguien compra una promoción:

// Se identifica la promo seleccionada.

// Se recorren los productsIncluded.

// Por cada producto:

// Obtener su receta (recipeId).

// Calcular el descuento total de stock como si fueran productos normales.

// Actualizar el stock igual que con un pedido común.

// Nota: Esto asegura que las promociones no tengan un stock separado, sino que se descuenten directamente del inventario actual.