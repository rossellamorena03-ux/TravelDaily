import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import './Statistiche.css';

function Statistiche() {
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState([]);
    const [visited, setVisited] = useState([]);

    useEffect(() => {
        if (!user) return;

        async function getData() {
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
            setSaved(docSnap.data().savedPlaces || null);
            setVisited(docSnap.data().visitedPlaces || null);
            } else {
            setSaved(null);
            setVisited(null);
            }
        } catch (err) {
            setError("Errore nel caricamento dei dati.");
        } finally {
            setLoading(false);
        }
        }

        getData();
    }, [user]);

    const totalVisited = visited.length;
    const totalSaved   = saved.length;

    const countByCountry = (placesArray) => {
        return placesArray.reduce((acc, place) => {
            const country = place.country || "Unknown";
            acc[country] = (acc[country] || 0) + 1;
            return acc;
        }, {});
    };

    const visitedByCountry = countByCountry(visited);
    const savedByCountry = countByCountry(saved);

    if (loading) return <div>Caricamento...</div>;
    if (error) return <div>Errore: {error}</div>;

    return (
        <div>
            <h2>Le tue statistiche</h2>
            <div className="container">
                <div className="info">
                    <h3>Totali Visitati:</h3> <p>{totalVisited}</p>
                    <h3>Totali Salavati:</h3> <p>{totalSaved}</p>

                    <h3>Visitati per nazione</h3>
                    <ul>
                        {Object.entries(visitedByCountry).map(([country, count]) => (
                        <li key={country}><p><strong>{country}:</strong> {count}</p></li>
                        ))}
                    </ul>

                    <h3>Salvati per nazione</h3>
                    <ul>
                        {Object.entries(savedByCountry).map(([country, count]) => (
                        <li key={country}><p><strong>{country}:</strong> {count}</p></li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
export default Statistiche;
