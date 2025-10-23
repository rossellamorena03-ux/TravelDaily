import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";
import InstallButton from './components/InstallButton.jsx';
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Errore nel logout:", error);
    }
  };

  return (
    <nav className="navbar">
      <h2 className="logo">🌍 TravelDaily</h2>
      <ul className="nav-links">
        <li><InstallButton /></li>
        <li><Link to="/home">Home</Link></li>
        <li><Link to="/storico">Storico</Link></li>
        <li><Link to="/preferiti">Preferiti</Link></li>
        <li><Link to="/profilo">Profilo</Link></li>
        <li>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;