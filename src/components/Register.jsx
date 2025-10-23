import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebaseConfig"; // importa anche db
import { doc, setDoc } from "firebase/firestore"; // importa Firestore
import { Link, useNavigate} from "react-router-dom";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Le password non coincidono");
      return;
    }

    try {
      // Crea l'utente su Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Aggiorna il profilo con il nome utente
      await updateProfile(userCredential.user, { displayName: username });

      // Aggiungi l'utente alla collezione users in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: email,
        username: username,
        preferences: {
          maxDistance: 1000,
          areaType: "globale",
          areaValue: "",
          city: "",
        },
        visitedPlaces: [],
        savedPlaces: []
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Crea un nuovo account</h2>
      <form onSubmit={handleRegister}>
        <label>
          Nome utente:
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <label>
          Conferma password:
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </label>
        <button type="submit">Registrati</button>
      </form>

      {error && <p style={{ color: "black", fontWeight: "bold" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <p>
        Hai già un account? <Link to="/">Accedi qui.</Link>
      </p>
    </div>
  );
}

export default Register;

