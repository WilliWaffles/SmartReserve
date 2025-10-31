// client/src/routes/Admin.jsx
import { useEffect, useState } from "react";

export default function Admin() {
  // ---------- AUTH ----------
  const [auth, setAuth] = useState({
    username: "",
    password: "",
    token: null,
    error: "",
  });

  // ---------- FORM CREAR RESTAURANTE ----------
  const [form, setForm] = useState({
    name: "",
    address: "",
    phone: "",
    capacity: 20,
  });

  // ---------- DATA ----------
  const [restaurants, setRestaurants] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [msg, setMsg] = useState("");

  // Cargar datos públicos
  async function loadRestaurants() {
    const res = await fetch("http://localhost:3001/api/restaurants");
    const data = await res.json();
    setRestaurants(data);
  }

  // Cargar reservas (admin view)
  async function loadReservations() {
    const res = await fetch("http://localhost:3001/api/reservations");
    const data = await res.json();
    setReservations(data);
  }

  useEffect(() => {
    loadRestaurants();
    loadReservations();
  }, []);

  // ---------- LOGIN ADMIN ----------
  async function handleLogin(e) {
    e.preventDefault();
    setAuth((a) => ({ ...a, error: "" }));

    try {
      const res = await fetch("http://localhost:3001/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: auth.username,
          password: auth.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Credenciales inválidas");
      }

      setAuth((a) => ({
        ...a,
        token: data.token,
        password: "",
        error: "",
      }));
    } catch (err) {
      setAuth((a) => ({ ...a, error: err.message || "Error de login" }));
    }
  }

  function handleLogout() {
    setAuth({
      username: "",
      password: "",
      token: null,
      error: "",
    });
  }

  // ---------- CREAR RESTAURANTE (PROTEGIDO) ----------
  async function handleCreateRestaurant(e) {
    e.preventDefault();
    setMsg("");

    if (!auth.token) {
      setMsg("Operación restringida: inicia sesión como administrador.");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        address: form.address.trim(),
        phone: form.phone?.trim() || undefined,
        capacity: Number(form.capacity),
      };

      const res = await fetch("http://localhost:3001/api/restaurants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "Error al crear restaurante");
      }

      setMsg("Restaurante creado");
      setForm({ name: "", address: "", phone: "", capacity: 20 });
      await loadRestaurants();
    } catch (err) {
      setMsg("Error: " + err.message);
    }
  }

  // ---------- CANCELAR RESERVA (PROTEGIDO) ----------
  async function handleCancelReservation(id) {
    if (!auth.token) {
      alert("Inicia sesión como administrador.");
      return;
    }

    const confirmCancel = window.confirm(
      "¿Seguro que quieres cancelar esta reserva?"
    );
    if (!confirmCancel) return;

    const res = await fetch(
      `http://localhost:3001/api/reservations/${id}/cancel`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    const data = await res.json();
    if (!res.ok) {
      alert(data?.error || "Error al cancelar");
      return;
    }

    // recargar reservas después de cancelar
    await loadReservations();
  }

  // =====================================================
  // RENDER: si NO hay token -> pantalla de login admin
  // =====================================================
  if (!auth.token) {
    return (
      <>
        <h2>Panel Administrador</h2>

        <div className="card" style={{ maxWidth: 360 }}>
          <h3 style={{ marginTop: 0 }}>Iniciar sesión</h3>

          <form onSubmit={handleLogin}>
            <label>
              Usuario
              <input
                className="input"
                value={auth.username}
                onChange={(e) =>
                  setAuth((a) => ({ ...a, username: e.target.value }))
                }
                required
              />
            </label>

            <label>
              Contraseña
              <input
                className="input"
                type="password"
                value={auth.password}
                onChange={(e) =>
                  setAuth((a) => ({ ...a, password: e.target.value }))
                }
                required
              />
            </label>

            <div style={{ marginTop: 12 }}>
              <button className="btn">Entrar</button>
            </div>

            {auth.error && (
              <p style={{ marginTop: 10, color: "#f87171" }}>{auth.error}</p>
            )}
          </form>

          <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
            Nota: sólo el personal autorizado puede crear restaurantes o
            cancelar reservas.
          </p>
        </div>

        {/* Vista de solo lectura */}
        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0 }}>Restaurantes (solo lectura)</h3>
          {restaurants.length === 0 && <p>No hay restaurantes</p>}
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {restaurants.map((r) => (
              <li key={r.id}>
                {r.name} — cap: {r.capacity}
              </li>
            ))}
          </ul>
        </div>

        <div className="card" style={{ marginTop: 20 }}>
          <h3 style={{ marginTop: 0 }}>Reservas registradas</h3>
          {reservations.length === 0 && <p>No hay reservas</p>}
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
            {reservations.map((rs) => (
              <li key={rs.id}>
                #{rs.id} · {rs.customerName} ({rs.partySize} ppl) ·{" "}
                {new Date(rs.date).toLocaleDateString()} ·{" "}
                {rs.status === "booked" ? "Activa" : "Cancelada"}
              </li>
            ))}
          </ul>
        </div>
      </>
    );
  }

  // =====================================================
  // RENDER: si hay token -> panel completo
  // =====================================================
  return (
    <>
      <h2>Panel Administrador</h2>

      {/* Estado de sesión */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 8,
          }}
        >
          <strong>Sesión iniciada como administrador</strong>
          <button
            type="button"
            className="btn secondary"
            onClick={handleLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Formulario alta restaurante */}
      <form className="card" onSubmit={handleCreateRestaurant}>
        <h3 style={{ marginTop: 0 }}>Registrar restaurante</h3>

        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: "1fr 1fr",
            maxWidth: 700,
          }}
        >
          <label>
            Nombre
            <input
              className="input"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              required
            />
          </label>

          <label>
            Dirección
            <input
              className="input"
              value={form.address}
              onChange={(e) =>
                setForm((f) => ({ ...f, address: e.target.value }))
              }
              required
            />
          </label>

          <label>
            Teléfono
            <input
              className="input"
              value={form.phone}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
            />
          </label>

          <label>
            Capacidad diaria
            <input
              className="input"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) =>
                setForm((f) => ({ ...f, capacity: e.target.value }))
              }
            />
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <button className="btn">Guardar</button>
        </div>
        {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
      </form>

      {/* Listado de restaurantes */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Restaurantes registrados</h3>
        {restaurants.length === 0 && <p>No hay restaurantes</p>}
        <ul style={{ margin: 0, paddingLeft: 18 }}>
          {restaurants.map((r) => (
            <li key={r.id}>
              {r.name} — cap: {r.capacity}
            </li>
          ))}
        </ul>
      </div>

      {/* Listado de reservas con botón cancelar */}
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Reservas</h3>
        {reservations.length === 0 && <p>No hay reservas</p>}
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
          {reservations.map((rs) => (
            <li key={rs.id} style={{ marginBottom: 8 }}>
              #{rs.id} · {rs.customerName} ({rs.partySize} ppl) ·{" "}
              {new Date(rs.date).toLocaleDateString()} ·{" "}
              {rs.status === "booked" ? "Activa" : "Cancelada"}
              {"  "}
              {rs.status === "booked" && (
                <button
                  className="btn"
                  type="button"
                  style={{ marginLeft: 12 }}
                  onClick={() => handleCancelReservation(rs.id)}
                >
                  Cancelar
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
