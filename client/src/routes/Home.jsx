// client/src/routes/Home.jsx
import { useEffect, useState } from "react";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true); setErr("");
        const res = await fetch("http://localhost:3001/api/restaurants");
        const data = await res.json();
        setRestaurants(Array.isArray(data) ? data : []);
      } catch (e) {
        setErr("No se pudieron cargar los restaurantes.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      <h2>Restaurantes</h2>
      {loading && <p>Cargando…</p>}
      {err && <p style={{color:"#fecaca"}}>{err}</p>}

      <div className="grid">
        {restaurants.map(r => (
          <div key={r.id} className="card">
            <h3 style={{marginTop:0}}>{r.name}</h3>
            <div style={{opacity:.9}}>{r.address}</div>
            {r.phone && <div style={{opacity:.8, fontSize:14}}>Tel: {r.phone}</div>}
            <div style={{marginTop:8, fontSize:14, opacity:.9}}>
              Capacidad diaria: <strong>{r.capacity}</strong>
            </div>
          </div>
        ))}
        {(!loading && restaurants.length===0) && (
          <p>No hay restaurantes aún. Ve a <strong>Admin</strong> para crear uno.</p>
        )}
      </div>
    </>
  );
}
