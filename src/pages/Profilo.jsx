import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, updateDoc} from "firebase/firestore";
import { updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { subscribeUserToPush } from "../components/Notifiche.js";
import './Profilo.css';

function Profilo() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [usernameMessage, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    if (auth.currentUser) {
      setUsername(auth.currentUser.displayName || "");
    }
    setLoading(false);
  }, []);

  const handleUsernameChange = async (e) => {
    e.preventDefault();
    if (!newUsername.trim()) return;

    try {
      // Aggiorna displayName in Auth
      await updateProfile(auth.currentUser, { displayName: newUsername });

      // Aggiorna anche Firestore
      const userDoc = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userDoc, { username: newUsername });

      setUsername(newUsername);
      setMessage("Nome utente aggiornato con successo!");
      setNewUsername("");
    } catch (error) {
      setMessage("Si è verificato un errore, riprova.");
    }
  };

   const reauthenticate = (currentPassword) => {
    const user = auth.currentUser;
    const cred = EmailAuthProvider.credential(user.email, currentPassword);
    return reauthenticateWithCredential(user, cred);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage("");

    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("La nuova password e la conferma non coincidono.");
      return;
    }

    try {
      // Re-autentica con la password corrente
      await reauthenticate(currentPassword);
      // Cambia la password
      await updatePassword(auth.currentUser, newPassword);
      
      setPasswordMessage("Password aggiornata con successo!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setPasswordMessage("Errore: " + error.message);
    }
  };

  if (loading) return <div>Caricamento...</div>;

  return (
  <div>
    <h2>Ciao, {username}</h2>
    <div className="profile-container">
      
      <div className="profile-navigation-buttons">
        <button onClick={() => navigate("/preferenze")}>
          Preferenze di viaggio
        </button>
        <button onClick={() => navigate("/statistiche")}>
          Statistiche
        </button>
        <button onClick={async()=>{
          const registration = await navigator.serviceWorker.ready;
          console.log("SW pronto:", registration);
          await subscribeUserToPush();
        }}>
          Abilita notifiche push
        </button>
      </div>
        
      <div className="profile-sections-wrapper">
        <section className="profile-section">
        <h3>Modifica nome utente</h3>
        <form onSubmit={handleUsernameChange}>
          <label>
            Nuovo nome:
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
            />
          </label>
          <button type="submit">Aggiorna nome</button>
        </form>
        {usernameMessage && <p>{usernameMessage}</p>}
        </section>
        
        <section className="profile-section">
        <h3>Modifica password</h3>
        <form onSubmit={handleChangePassword}>
          <label>
            Password corrente:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Nuova password:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label>
            Conferma nuova password:
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
            />
          </label>
          <button type="submit">Aggiorna password</button>
        </form>
        {passwordMessage && <p>{passwordMessage}</p>}
        </section>   
      </div>
    </div>
  </div>
  );
}

export default Profilo;
