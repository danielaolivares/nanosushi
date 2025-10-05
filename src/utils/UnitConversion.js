export function convertToBaseUnit(amount, fromUnit, baseUnit) {
  const n = Number(amount);
  if (fromUnit === baseUnit) return n;

  // Kilograms to grams
  if (fromUnit === "kg" && baseUnit === "g") return n * 1000;
  // Grams to kilograms
  if (fromUnit === "g" && baseUnit === "kg") return n / 1000;

  // Liters to milliliters
  if (fromUnit === "l" && baseUnit === "ml") return n * 1000;
  // Milliliters to liters
  if (fromUnit === "ml" && baseUnit === "l") return n / 1000;

  // No conversion needed for units, pieces, etc.
  return n;
}