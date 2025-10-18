// client/src/routes/Reserve.jsx
import { useEffect, useMemo, useState } from "react";

export default function Reserve() {
  const [restaurants, setRestaurants] = useState([]);
  const [form, setForm] = useState({
    restaurantId: "",
    date: new Date().toISOString().slice(0,10), // yyyy-mm-dd
    customerName: "",
    customerEmail: "",
    partySize: 2
  });
  const [availability, setAvailability] = useState(null);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("http://localhost:3001/api/restaurants");
      const data = await res.json();
      setRestaurants(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length && !form.restaurantId) {
        setForm(f => ({ ...f, restaurantId: String(data[0].id) }));
      }
    })();
  }, []);

  const selectedId = useMemo(() => Number(form.restaurantId || 0), [form.restaurantId]);

  useEffect(() => {
    (async () => {
      setAvailability(null); setErr(""); setOk("");
      if (!selectedId || !form.date) return;
      const url = new URL(`http://localhost:3001/api/restaurants/${selectedId}/availability`);
      url.searchParams.set("date", form.date); // día (yyyy-mm-dd)
      const res = await fetch(url);
      if (!res.ok) { setErr("No se pudo obtener disponibilidad"); return; }
      setAvailability(await res.json());
    })();
  }, [selectedId, form.date]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr(""); setOk("");
    if (!selectedId) return setErr("Selecciona un restaurante");
    try {
      // fecha como YYYY-MM-DD
      const payload = {
        restaurantId: selectedId,
        date: form.date,
        customerName: form.customerName,
        customerEmail: form.customerEmail,
        partySize: Number(form.partySize)
      };
      const res = await fetch("http://localhost:3001/api/reservations", {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "error");

      setOk("Reserva creada");
      // refrescar disponibilidad del día
      const url = new URL(`http://localhost:3001/api/restaurants/${selectedId}/availability`);
      url.searchParams.set("date", form.date);
      const res2 = await fetch(url);
      setAvailability(await res2.json());

      // limpiar nombre/correo, conservar restaurante y fecha
      setForm(f => ({ ...f, customerName:"", customerEmail:"" }));
    } catch (e) {
      setErr("No se pudo crear la reserva. " + (e.message || ""));
    }
  };

  return (
    <>
      <h2>Reservar</h2>

      <form className="card" onSubmit={onSubmit}>
        <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
          <label>
            Restaurante
            <select
              className="select"
              value={form.restaurantId}
              onChange={e=>setForm(f=>({...f, restaurantId:e.target.value}))}
            >
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </label>
          <label>
            Fecha
            <input
              className="input"
              type="date"
              value={form.date}
              onChange={e=>setForm(f=>({...f, date:e.target.value}))}
            />
          </label>
          <label>
            Nombre
            <input
              className="input"
              value={form.customerName}
              onChange={e=>setForm(f=>({...f, customerName:e.target.value}))}
              placeholder="Tu nombre"
              required
            />
          </label>
          <label>
            Email
            <input
              className="input"
              type="email"
              value={form.customerEmail}
              onChange={e=>setForm(f=>({...f, customerEmail:e.target.value}))}
              placeholder="tucorreo@ejemplo.com"
              required
            />
          </label>
          <label>
            Personas
            <input
              className="input"
              type="number" min={1}
              value={form.partySize}
              onChange={e=>setForm(f=>({...f, partySize:e.target.value}))}
            />
          </label>
        </div>

        <div style={{marginTop:12}}>
          <button className="btn">Reservar</button>
        </div>

        {ok && <p style={{color:"#bbf7d0", marginTop:10}}>{ok}</p>}
        {err && <p style={{color:"#fecaca", marginTop:10}}>{err}</p>}
      </form>

      <div className="card">
        <h3 style={{marginTop:0}}>Disponibilidad del día</h3>
        {!availability && <p>Selecciona restaurante y fecha…</p>}
        {availability && (
          <p>
            Capacidad: <strong>{availability.capacity}</strong> ·
            Reservados: <strong>{availability.reserved}</strong> ·
            Disponibles: <strong>{availability.available}</strong>
          </p>
        )}
      </div>
    </>
  );
}
