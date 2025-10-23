import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Home from "./pages/Home";
import Storico from "./pages/Storico";
import Preferiti from "./pages/Preferiti";
import Profilo from "./pages/Profilo";
import Preferenze from "./pages/Preferenze";
import Navbar from "./components/Navbar";
import ProtectedRoutes from "./components/ProtectedRoutes";
import Statistiche from "./pages/Statistiche";

function App() {
  return (
    <>
      
      <Routes>
        {/* Rotte pubbliche */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Rotte protette, con Navbar */}
        <Route
          element={
            <>
              <Navbar />
              <ProtectedRoutes />
            </>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/storico" element={<Storico />} />
          <Route path="/preferiti" element={<Preferiti />} />
          <Route path="/profilo" element={<Profilo />} />
          <Route path="/statistiche" element={<Statistiche />} />
        </Route>
        <Route path="/preferenze" element={<Preferenze />}/>
      </Routes>
    </>
  );
}

export default App;
