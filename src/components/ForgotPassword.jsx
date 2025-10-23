import { Link } from "react-router-dom";
import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import "./Login.css"

function ForgotPassword() {
  const user = getAuth();
  const [email, setEmail] = useState("");

  const sendMail = async (e) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(user, email);
      alert("Email di reset inviata! Controlla la posta.");
    } catch (error) {
      alert("Errore: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Recupera la tua password</h2>
      <form onSubmit={sendMail}>
        <label>
          Email:
          <input type="email" name="email" onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button type="submit">Invia email di reset</button>
      </form>
      <p>
        Ricordi la password? <Link to="/">Accedi qui.</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;
