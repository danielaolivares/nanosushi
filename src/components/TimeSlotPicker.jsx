import { useState, useEffect } from 'react';
import { db } from '../firebase/firebaseFirestore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Form, Spinner } from 'react-bootstrap';

// cartItems: [{..., preparationTime: 15}, ...]
const TimeSlotPicker = ({ cartItems, onSlotSelect }) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateAvailableSlots = async () => {
      setLoading(true);
      
      // 1. Calcular tiempo total de preparación
      const totalPreparationTime = cartItems.reduce((acc, item) => acc + (item.preparationTime || 0), 0);
      
      // 2. Definir tiempo de delivery y extra
      const deliveryTime = 45; // Ejemplo: 45 minutos
      const extraBuffer = 10; // 10 minutos extra
      const totalLeadTime = totalPreparationTime + deliveryTime + extraBuffer;

      // 3. Calcular la hora más temprana de entrega
      const now = new Date();
      const earliestDeliveryTime = new Date(now.getTime() + totalLeadTime * 60000);

      // 4. Obtener horarios bloqueados de Firestore
      const today = new Date().toISOString().split('T')[0];
      const slotsCol = collection(db, 'blockedSlots');
      const q = query(slotsCol, where('date', '==', today));
      const querySnapshot = await getDocs(q);
      const blockedSlots = new Set(querySnapshot.docs.map(d => d.data().time));

      // 5. Generar y filtrar los slots disponibles
      const allSlots = [];
      for (let i = 12; i < 23; i++) { // Horario de 12:00 a 22:00
        allSlots.push(`${i.toString().padStart(2, '0')}:00`);
      }

      const filteredSlots = allSlots.filter(slot => {
        // No mostrar si está bloqueado
        if (blockedSlots.has(slot)) {
          return false;
        }
        
        // No mostrar si es antes de la hora mínima de entrega
        const [hour] = slot.split(':');
        const slotTime = new Date();
        slotTime.setHours(hour, 0, 0, 0);

        return slotTime > earliestDeliveryTime;
      });

      setAvailableSlots(filteredSlots);
      setLoading(false);
    };

    calculateAvailableSlots();
  }, [cartItems]);

  if (loading) {
    return <Spinner animation="border" size="sm" />;
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label className="text-white">Selecciona Hora de Entrega</Form.Label>
      <Form.Select onChange={(e) => onSlotSelect(e.target.value)} required>
        <option value="">Elige un horario...</option>
        {availableSlots.length > 0 ? (
          availableSlots.map(slot => (
            <option key={slot} value={slot}>
              {slot} - {parseInt(slot) + 1}:00
            </option>
          ))
        ) : (
          <option disabled>No hay horarios disponibles por hoy.</option>
        )}
      </Form.Select>
    </Form.Group>
  );
};

export default TimeSlotPicker;
