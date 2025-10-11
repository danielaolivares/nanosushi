import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebaseFirestore';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Container, Button, ListGroup, Spinner } from 'react-bootstrap';

// Genera bloques de 1 hora para un día
const generateTimeSlots = () => {
  const slots = [];
  for (let i = 12; i < 23; i++) { // Ejemplo: de 12:00 a 22:00
    const time = `${i.toString().padStart(2, '0')}:00`;
    slots.push(time);
  }
  return slots;
};

const ScheduleManager = () => {
  const [timeSlots] = useState(generateTimeSlots());
  const [blockedSlots, setBlockedSlots] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [processingSlot, setProcessingSlot] = useState(null);

  const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD

  // Cargar los slots bloqueados para hoy
  useEffect(() => {
    const fetchBlockedSlots = async () => {
      setLoading(true);
      try {
        const slotsCol = collection(db, 'blockedSlots');
        const q = query(slotsCol, where('date', '==', today));
        const querySnapshot = await getDocs(q);
        const blocked = new Set(querySnapshot.docs.map(d => d.data().time));
        setBlockedSlots(blocked);
      } catch (error) {
        console.error("Error fetching blocked slots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlockedSlots();
  }, [today]);

  const toggleBlockSlot = async (time) => {
    setProcessingSlot(time);
    try {
      const isBlocked = blockedSlots.has(time);
      const slotsCol = collection(db, 'blockedSlots');

      if (isBlocked) {
        // Desbloquear: buscar y eliminar el documento
        const q = query(slotsCol, where('date', '==', today), where('time', '==', time));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docId = querySnapshot.docs[0].id;
          await deleteDoc(doc(db, 'blockedSlots', docId));
        }
        setBlockedSlots(prev => {
          const newSet = new Set(prev);
          newSet.delete(time);
          return newSet;
        });
      } else {
        // Bloquear: agregar un nuevo documento
        await addDoc(slotsCol, { date: today, time });
        setBlockedSlots(prev => new Set(prev).add(time));
      }
    } catch (error) {
      console.error("Error toggling slot:", error);
      alert('Ocurrió un error.');
    } finally {
      setProcessingSlot(null);
    }
  };

  return (
    <Container className="mt-5 text-white">
      <h2>📅 Bloquear Horarios de Entrega (Hoy)</h2>
      <p>Selecciona las franjas horarias en las que NO se podrán agendar entregas.</p>
      {loading ? <Spinner animation="border" /> : (
        <ListGroup>
          {timeSlots.map(slot => {
            const isBlocked = blockedSlots.has(slot);
            return (
              <ListGroup.Item
                key={slot}
                variant={isBlocked ? 'danger' : 'light'}
                className="d-flex justify-content-between align-items-center"
              >
                {slot} - {parseInt(slot) + 1}:00
                <Button
                  variant={isBlocked ? 'success' : 'danger'}
                  onClick={() => toggleBlockSlot(slot)}
                  disabled={processingSlot === slot}
                >
                  {processingSlot === slot ? <Spinner as="span" animation="border" size="sm" /> : (isBlocked ? 'Desbloquear' : 'Bloquear')}
                </Button>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </Container>
  );
};

export default ScheduleManager;
