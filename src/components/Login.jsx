import "./Login.css"
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth} from "../firebaseConfig";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;
      if (user) {
        navigate("/home");  
      }
    } catch (err) {
      setError("Email o password errati"+err);
    }
  };

  return (
    <div className="login-container">
      <h2>Accedi</h2>
      <form onSubmit={handleLogin}>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button type="submit">Accedi</button>
      </form>

      {error && <p style={{ color: "black", fontWeight: "bold" }}>{error}</p>}

      <p>
        Non hai un account? <Link to="/register">Registrati.</Link>
      </p>
      <p>
        Hai dimenticato la password? <Link to="/reset-password">Recupera password.</Link>
      </p>
    </div>
  );
}