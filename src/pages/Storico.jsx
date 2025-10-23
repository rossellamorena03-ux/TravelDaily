import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc,  updateDoc, arrayRemove, onSnapshot } from "firebase/firestore";
import "./Preferiti.css";

function Storico() {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visited, setVisited] = useState(null);

  const removeVisited = async (place) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      visitedPlaces: arrayRemove(place)
    });
  };

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setVisited(docSnap.data().visitedPlaces || []);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    async function getVisited() {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setVisited(docSnap.data().visitedPlaces || null);
        } else {
          setVisited(null);
        }
      } catch (err) {
        setError("Errore nel caricamento dei luoghi visitati");
      } finally {
        setLoading(false);
      }
    }

    getVisited();
  }, [user]);

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;

  if (!visited || visited.length === 0) {
    return (
      <div className="preferiti-container">
        <h2>Luoghi visitati</h2>
        <p style={{ textAlign: "center" }}>Non hai ancora visitato nessun luogo.</p>
      </div>
    );
  }

  return (
    <div>
    <h2>Storico dei luoghi Visitati</h2>
    <div className="preferiti-container">
      
      <div className="saved-places-grid">
        
        {visited.map((place, index) => (
          <div key={index} className="saved-place-card">
            <div className="image">
              <img src={place.image} alt={place.name} className="saved-place-image" />
            </div>
            <div className="info">
              <h3>{place.name}</h3>
              <p>{place.region}, {place.country}</p>
              <button onClick={() => removeVisited(place)} className="remove-btn">
                Rimuovi
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </div>
  );
}

export default Storico;
