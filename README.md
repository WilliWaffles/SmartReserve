# SmartReserve — Sistema de Reservas para Restaurantes

SmartReserve es una aplicación web que permite gestionar reservas de restaurantes con control de capacidad diaria, creación de establecimientos y validación automática mediante API REST.  
Desarrollado con **Node.js, Express, Prisma, SQLite, React y Vite**, validado con **Zod** y probado con **k6**.

---

## Objetivo del proyecto
Desarrollar un sistema funcional y validado de reservas que demuestre el ciclo completo de desarrollo ágil:
- Backend con API REST segura y validada.
- Frontend con interfaz limpia y funcional.
- Validaciones, pruebas funcionales y de rendimiento.

---

## Tecnologías principales

|    Capa    |    Tecnología     |     Descripción      |
|------------|-------------------|----------------------|
| Backend    | Node.js + Express | API REST             |
| ORM        | Prisma + SQLite   | Base de datos ligera |
| Validación | Zod               | Validación de datos  |
| Frontend   | React + Vite      | Interfaz de usuario  |
| Pruebas    | k6                | Carga y rendimiento  |

---

## Arquitectura

SmartReserve
 ┣ client/     → Interfaz React (Vite)
 ┣ server/     → API Node/Express + Prisma
 ┣ tests/k6/   → Scripts de rendimiento
 ┣ README.md

---

## Instalación y ejecución

### Backend (`server/`)
```bash
cd server
npm install
npx prisma migrate dev --name init
npm run seed     # opcional para llenar datos mock
npm run dev
```
API disponible en → [http://localhost:3001](http://localhost:3001)

### Frontend (`client/`)
```bash
cd client
npm install
npm run dev
```
Frontend en → [http://localhost:5173](http://localhost:5173)

---

## Pruebas de rendimiento (k6)

Ubicación: `tests/k6/`

### Ejemplo: `load_restaurants.js`
```js
import http from "k6/http";
import { check } from "k6";

export let options = {
  vus: 20,
  duration: "30s",
};

export default function () {
  const res = http.get("http://localhost:3001/api/restaurants");
  check(res, { "status 200": (r) => r.status === 200 });
}
```

Ejecutar:
```bash
k6 run tests/k6/load_restaurants.js
k6 run tests/k6/mix_availability.js
```

---

## Roadmap (futuras mejoras)

- Cancelar y editar reservas desde la interfaz web.
- Eliminar y editar restaurantes.
- Añadir disponibilidad por hora (no solo por día).
- Autenticación básica para el panel admin.
- Dockerización completa y CI/CD.

---
