// Esta colección representará las opciones de ingredientes que el cliente puede elegir, muy similar a cómo funcionan las pizzas personalizadas.

// Cada documento representa un grupo de ingredientes, por ejemplo:

// Tipo de base (roll tradicional, handroll, sushi bowl).

// Tipo de proteína.

// Vegetales y toppings.

// Extras (queso crema, salsas, etc.).
// {
//   "name": "Proteínas",
//   "type": "protein",
//   "required": true,
//   "maxSelection": 2,
//   "options": [
//     {
//       "ingredientId": "salmon",
//       "name": "Salmón",
//       "extraPrice": 0
//     },
//     {
//       "ingredientId": "pollo_teriyaki",
//       "name": "Pollo Teriyaki",
//       "extraPrice": 500
//     },
//     {
//       "ingredientId": "atun",
//       "name": "Atún",
//       "extraPrice": 700
//     }
//   ]
// }
// Cuando el cliente entra a "Arma tu sushi":

// Consultas la colección customBuildOptions.

// Renderizas grupos dinámicamente (proteínas, vegetales, extras, etc.).

// El usuario selecciona ingredientes.

// El total se calcula sumando:

// Precio base del producto.

// extraPrice de cada ingrediente extra elegido.
// Cada opción seleccionada es directamente un ingrediente en stock.
// Esto simplifica el proceso porque no necesitas crear un producto previo, se construye dinámicamente.

// Flujo:

// Cliente elige:

// 1 base (roll tradicional).

// 1 proteína (salmón).

// 2 toppings (palta, queso crema).

// Antes de confirmar el pedido:

// Se valida que todos los ingredientes tengan stock suficiente.

// Si falta alguno, se notifica y se bloquea la compra.

// Al confirmar:

// Descuenta las cantidades de cada ingrediente en stock.