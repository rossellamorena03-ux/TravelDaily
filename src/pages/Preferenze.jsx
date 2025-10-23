import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";

function Preferenze() {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState({
    maxDistance: 1000, // km di default
    areaType: "globale", // globale, continente, nazione, regione
    areaValue: "", // es. "Europa" o "Italia"
    city: "", // città utente
  });

  useEffect(() => {
    if (!user) return;

    async function fetchPrefs() {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setPrefs(docSnap.data().preferences || prefs);
      }
      setLoading(false);
    }

    fetchPrefs();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrefs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    await setDoc(doc(db, "users", user.uid), { preferences: prefs }, { merge: true });
    alert("Preferenze salvate!");
  };

  if (loading) return <div>Caricamento...</div>;

  return (
    <><Navbar />
    <div className="profile-container">
      <h2>Preferenze di Viaggio</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Distanza massima (km):
          <input
            type="number"
            name="maxDistance"
            value={prefs.maxDistance}
            onChange={handleChange}
            min={0}
          />
        </label>
        <label>
          Area:
          <select name="areaType" value={prefs.areaType} onChange={handleChange}>
            <option value="globale">Globale</option>
            <option value="continente">Continente</option>
            <option value="nazione">Nazione</option>
          </select>
        </label>
        <label>
          Valore area (es. Europa, Italia, Asia, Cina):
          <input
            type="text"
            name="areaValue"
            value={prefs.areaValue}
            onChange={handleChange}
            placeholder="Inserisci nazione o continente"
          />
        </label>
        <label>
          Città di partenza:
          <input
            type="text"
            name="city"
            value={prefs.city}
            onChange={handleChange}
            placeholder="Inserisci la tua città"
          />
        </label>
        <button type="submit">Salva preferenze</button>
      </form>
    </div></>
    
  );
}

export default Preferenze;