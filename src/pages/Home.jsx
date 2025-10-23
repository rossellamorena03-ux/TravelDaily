import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import "./Home.css";

function Home() {
  const user = auth.currentUser;
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [randomCity, setRandomCity] = useState(null);
  const [error, setError] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const countriesByContinent = {
    Europa: ["Italia", "Francia", "Spagna", "Germania", "Grecia"],
    Asia: ["Giappone", "Cina", "India", "Thailandia", "Indonesia"],
    Africa: ["Marocco", "Egitto", "Sudafrica", "Kenya", "Tanzania"],
    America: ["Stati Uniti", "Canada", "Brasile", "Argentina", "Messico"],
    Oceania: ["Australia", "Nuova Zelanda", "Figi"],
  };

  async function salvaLuogo(place){
    if (!user || !place) return;

    try {
      const userDocRef = doc(db, "users", user.uid);

      await updateDoc(userDocRef, {
        savedPlaces: arrayUnion(place)
      });

      alert("Luogo aggiunto tra i preferiti!");
    } catch (error) {
      alert("Errore durante l'aggiornamento dei preferiti.");
    }
  }

  async function luogoVisitato(place){
    if (!user || !place) return;

    try {
      const userDocRef = doc(db, "users", user.uid);

      await updateDoc(userDocRef, {
        visitedPlaces: arrayUnion(place)
      });

      alert("Luogo aggiunto tra i luoghi già visitati!");
    } catch (error) {
      alert("Errore durante l'aggiornamento dei luoghi visitati.");
    }
  }
  
  // 🔹 1. Recupera preferenze utente da Firestore
  useEffect(() => {
    if (!user) return;

    async function fetchPrefs() {
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setPrefs(docSnap.data().preferences || null);
        } else {
          setPrefs(null);
        }
      } catch (err) {
        setError("Errore nel caricamento delle preferenze");
      } finally {
        setLoading(false);
      }
    }

    fetchPrefs();
  }, [user]);

  // 🔹 2. Funzione per ottenere le coordinate da Nominatim
  async function getCoordinates(cityName) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cityName)}`
    );
    const data = await response.json();

    if (data.length === 0) throw new Error("Città non trovata");
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  }

  // 🔹 3. Funzione per ottenere una città casuale
  async function getRandomPlace(lat, lon, radiusKm = 10) {
    const username = "rossella.morena";
    const url = `http://api.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&radius=${radiusKm}&maxRows=20&username=${username}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error("Errore nella chiamata GeoNames");

    const data = await response.json();
    if (!data.geonames || data.geonames.length === 0) {
      throw new Error("Nessuna città trovata in zona");
    }

    // Filtra solo i luoghi con feature code che ti interessano
    const filteredPlaces = data.geonames.filter(place =>
      ["PPL", "MT", "LK", "STM", "PRK", "PPLH", "PPLC", "PPLC"].includes(place.fcode)
    );

    if (filteredPlaces.length === 0) {
      throw new Error("Nessun luogo interessante trovato");
    }

    // Scegli un luogo casuale tra i filtrati
    const randomPlace = filteredPlaces[Math.floor(Math.random() * filteredPlaces.length)];

    return randomPlace;
  }

  async function getPlaceDetails(place) {
    const username = import.meta.env.VITE_GEONAMES_USERNAME;
    const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    // 1️⃣ Cerca descrizione e immagine su Wikipedia tramite GeoNames
    const wikiResp = await fetch(
      `https://secure.geonames.org/wikipediaSearchJSON?q=${encodeURIComponent(place.name)}&maxRows=10&username=${username}`
    );
    const wikiData = await wikiResp.json();

    // 2️⃣ Se trova risultati, cerca il primo che ha immagine o descrizione
    let wikiInfo = null;
    if (wikiData.geonames && wikiData.geonames.length > 0) {
      wikiInfo = wikiData.geonames.find(item => item.thumbnailImg || item.summary);
    }

    // 3️⃣ Se GeoNames non trova immagine, prova Unsplash
    let imageUrl = wikiInfo?.thumbnailImg || null;
    if (!imageUrl && unsplashKey) {
      const unsplashResp = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(place.name+ 'landscape')}&client_id=${unsplashKey}&per_page=1`
      );
      const unsplashData = await unsplashResp.json();
      imageUrl = unsplashData.results?.[0]?.urls?.regular || null;
    }

    // 4️⃣ Costruisce un oggetto con tutte le informazioni disponibili
    return {
      name: place.name,
      lat: place.lat,
      lon: place.lng,
      type: place.fcodeName || "Località",
      region: place.adminName1 || "N/D",
      country: place.countryName || "N/D",
      description: wikiInfo?.summary || "Nessuna descrizione disponibile.",
      image: imageUrl || null
    };
  }

  // Ottiene le coordinate di una nazione
  async function getCountryCoordinates(countryName) {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?country=${encodeURIComponent(countryName)}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length === 0) throw new Error("Nazione non trovata");
    const { lat, lon } = data[0];
    return { lat: parseFloat(lat), lon: parseFloat(lon) };
  }

// 🔹 4. Logica combinata: prima ottieni coordinate (se servono), poi scegli città
  useEffect(() => {
    async function fetchCity() {
      if (!prefs) return;

      try {
        let coords = null;

        if (prefs.city && prefs.city.trim() !== "") {
          coords = await getCoordinates(prefs.city);
          setCoordinates(coords);
        }else if (prefs.areaType === "nazione" && prefs.areaValue) {
          coords = await getCountryCoordinates(prefs.areaValue);
        }else if (prefs.areaType === "continente" && prefs.areaValue) {
          const available = countriesByContinent[prefs.areaValue];
          if (!available || available.length === 0)
            throw new Error("Nessun paese disponibile per questo continente");
          const randomCountry = available[Math.floor(Math.random() * available.length)];
          coords = await getCountryCoordinates(randomCountry);
        }else {
          coords = await getCountryCoordinates("Italia");
        }

        const lat = coords.lat;
        const lon = coords.lon;

        const isCountryOrContinent =
        prefs.areaType === "nazione" || prefs.areaType === "continente";

        const searchRadius = isCountryOrContinent
          ? 300 // 🔸 cerca in un'area più ampia
          : prefs.maxDistance || 10;

        const place = await getRandomPlace(lat, lon, searchRadius);
        const detailedPlace = await getPlaceDetails(place);
        setRandomCity(detailedPlace);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchCity();
  }, [prefs]);

  // 🔹 5. Render finale
  if (loading) return <div>Caricamento preferenze...</div>;
  if (error) return <div>Errore: {error}</div>;
  if (!randomCity) return <div>Sto cercando un luogo interessante...</div>;

  return (
    <div>
      <h2>Scopri la meta del giorno!</h2>
      <div className={`place-container ${revealed ? "revealed" : ""}`}
        onClick={() => setRevealed(true)}>
      {/* Colonna sinistra */}
      {revealed ? (
          <>
            <div className="place-left">
              {randomCity.image && (
                <img src={randomCity.image} alt={randomCity.name} className="place-image" />
              )}
            </div>
            <div className="place-center">
              <h2 className="place-name">{randomCity.name}</h2>
              <p className="place-description">{randomCity.description}</p>
              <div className="place-info">
                <p><strong>Regione:</strong> {randomCity.region}</p>
                <p><strong>Nazione:</strong> {randomCity.country}</p>
              </div>
              <button className="btn-save" onClick={() =>salvaLuogo(randomCity)}>Salva luogo</button>
              <button className="btn-visited" onClick={() =>luogoVisitato(randomCity)}>Già visitato</button>
            </div>
          </>
        ) : (
          <div className="cover">Clicca per scoprire la meta del giorno 🌍</div>
        )}
      </div>
    </div>
  );
}

export default Home;
