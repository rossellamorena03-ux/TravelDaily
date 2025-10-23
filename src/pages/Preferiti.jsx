import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc,  updateDoc, arrayUnion, arrayRemove, onSnapshot } from "firebase/firestore";
import "./Preferiti.css";

function Preferiti() {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(null);

  const removeSaved = async (place) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      savedPlaces: arrayRemove(place)
    });
  };

  const markVisited = async (place) => {
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, {
      savedPlaces: arrayRemove(place),
      visitedPlaces: arrayUnion(place)
    });
  };

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setSaved(docSnap.data().savedPlaces || []);
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    async function getSaved() {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSaved(docSnap.data().savedPlaces || null);
        } else {
          setSaved(null);
        }
      } catch (err) {
        setError("Errore nel caricamento dei preferiti");
      } finally {
        setLoading(false);
      }
    }

    getSaved();
  }, [user]);

  if (loading) return <div>Caricamento...</div>;
  if (error) return <div>Errore: {error}</div>;

  if (!saved || saved.length === 0) {
    return (
      <div className="preferiti-container">
        <h2>Luoghi salvati</h2>
        <p style={{ textAlign: "center" }}>Non hai ancora luoghi da visitare.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Luoghi preferiti</h2>
      <div className="preferiti-container">
        <div className="saved-places-grid">
          
          {saved.map((place, index) => (
            <div key={index} className="saved-place-card">
              <div className="image">
                <img src={place.image} alt={place.name} className="saved-place-image" />
              </div>
              <div className="info">
                <h3>{place.name}</h3>
                <p>{place.region}, {place.country}</p>
                <div className="button-group">
                  <button onClick={() => removeSaved(place)} className="remove-btn">
                    Rimuovi
                  </button>
                  <button onClick={() => markVisited(place)} className="visited-btn">
                    Segna come visitato
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Preferiti;
