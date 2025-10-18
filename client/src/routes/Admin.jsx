// client/src/routes/Admin.jsx
import { useEffect, useState } from "react";

export default function Admin() {
  const [form, setForm] = useState({ name:"", address:"", phone:"", capacity: 20 });
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    const res = await fetch("http://localhost:3001/api/restaurants");
    setList(await res.json());
  }
  useEffect(()=>{ load(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone?.trim() || undefined,
        capacity: Number(form.capacity)
      };
      const res = await fetch("http://localhost:3001/api/restaurants", {
        method: "POST", headers: { "Content-Type":"application/json" }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "error");
      setMsg("Restaurante creado");
      setForm({ name:"", address:"", phone:"", capacity: 20 });
      await load();
    } catch (e) {
      setMsg("Error: " + e.message);
    }
  };

  return (
    <>
      <h2>Admin</h2>
      <form className="card" onSubmit={onSubmit}>
        <div style={{display:"grid", gap:12, gridTemplateColumns:"1fr 1fr"}}>
          <label>Nombre
            <input className="input" value={form.name} onChange={e=>setForm(f=>({...f, name:e.target.value}))} required />
          </label>
          <label>Dirección
            <input className="input" value={form.address} onChange={e=>setForm(f=>({...f, address:e.target.value}))} required />
          </label>
          <label>Teléfono
            <input className="input" value={form.phone} onChange={e=>setForm(f=>({...f, phone:e.target.value}))} />
          </label>
          <label>Capacidad diaria
            <input className="input" type="number" min={1} value={form.capacity} onChange={e=>setForm(f=>({...f, capacity:e.target.value}))} />
          </label>
        </div>
        <div style={{marginTop:12}}>
          <button className="btn">Guardar</button>
        </div>
        {msg && <p style={{marginTop:10}}>{msg}</p>}
      </form>

      <div className="card">
        <h3 style={{marginTop:0}}>Listado</h3>
        {list.length===0 && <p>No hay restaurantes</p>}
        <ul style={{margin:0, paddingLeft:18}}>
          {list.map(r => <li key={r.id}>{r.name} — cap: {r.capacity}</li>)}
        </ul>
      </div>
    </>
  );
}
