// client/src/App.jsx
import { Routes, Route, NavLink } from "react-router-dom";
import Home from "./routes/Home.jsx";
import Reserve from "./routes/Reserve.jsx";
import Admin from "./routes/Admin.jsx";

export default function App() {
  return (
    <div className="container">
      <header className="navbar">
        <h1 style={{margin:0, fontSize:24}}>SmartReserve</h1>
        <nav style={{display:"flex", gap:8}}>
          <NavLink to="/" end>Inicio</NavLink>
          <NavLink to="/reserve">Reservar</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/reserve" element={<Reserve />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<p>404</p>} />
      </Routes>
    </div>
  );
}
