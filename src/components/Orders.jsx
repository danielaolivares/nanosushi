// {
//   "orderNumber": "A000046",

//   "customer": {
//     "name": "Ana González",
//     "email": "ana.gonzalez@gmail.com",
//     "phone": "+56988887777"
//   },

//   "items": [
//     {
//       "type": "product",
//       "productId": "hosomaki-salmon",
//       "name": "Hosomaki Salmón",
//       "quantity": 3,
//       "unitPrice": 2500,
//       "total": 7500,
//       "ingredientsUsed": [
//         { "ingredientId": "arroz", "quantity": 300 },
//         { "ingredientId": "nori", "quantity": 3 },
//         { "ingredientId": "salmon", "quantity": 150 }
//       ]
//     },
//     {
//       "type": "custom",
//       "name": "Arma tu Sushi",
//       "quantity": 1,
//       "basePrice": 3000,
//       "extrasPrice": 800,
//       "total": 3800,
//       "selectedIngredients": [
//         { "ingredientId": "palta", "name": "Palta", "quantity": 30 },
//         { "ingredientId": "queso_crema", "name": "Queso Crema", "quantity": 20 }
//       ]
//     }
//   ],

//   "subtotal": 11300,
//   "deliveryFee": 1500,
//   "discount": 0,
//   "total": 12800,

//   "deliveryMethod": "delivery",         // "delivery" o "pickup"
//   "deliveryAddress": {
//     "street": "Av. Principal 123",
//     "city": "Santiago",
//     "reference": "Depto 45B, Torre Azul"
//   },

//   "paymentMethod": "transfer",          // "transfer", "cash", "card", etc.
//   "paymentStatus": "pending",           // "pending", "approved", "rejected"
//   "paymentProofUrl": "payment-proofs/orderA000046.jpg",  // URL Supabase

//   "status": "pending",                  // "pending", "preparing", "completed", "cancelled"

//   "createdAt": "2025-09-26T14:30:00Z",
//   "updatedAt": "2025-09-26T14:32:00Z",
//   "createdBy": "web-client",            // web-client o admin-panel
//   "notes": "Por favor enviar sin palta extra."
// }

// Detalles clave de la nueva estructura
// A. Manejo de pagos con transferencia

// paymentMethod: identifica cómo se pagó (transfer, cash, card, etc.).

// paymentProofUrl: guarda la foto del comprobante de transferencia (subida a Supabase).

// paymentStatus:

// "pending" → cliente subió comprobante, pero no validado.

// "approved" → dueño revisó y confirmó que el pago es real.

// "rejected" → pago rechazado porque no corresponde.

// Esto evita fraudes y da transparencia.
// Modalidad delivery o retiro en tienda

// deliveryMethod:

// "pickup" → retiro en tienda (sin costo).

// "delivery" → con costo adicional.

// deliveryFee:

// Si pickup → 0.

// Si delivery → monto configurable (ej: 1500).
// Si el pedido es pickup, este campo puede quedar vacío.