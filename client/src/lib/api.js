// client/src/lib/api.js
import axios from "axios";

export const API = axios.create({
  baseURL: "http://localhost:3001",
});

// RESTAURANTES
export const listRestaurants = () =>
  API.get("/api/restaurants").then(r => r.data);

export const createRestaurant = (data) =>
  // data: { name, address, capacity, phone? }
  API.post("/api/restaurants", data).then(r => r.data);

// RESERVAS
export const listReservations = () =>
  API.get("/api/reservations").then(r => r.data);

export const createReservation = (data) =>
  // data: { customerName, customerEmail, partySize, date(ISO), restaurantId }
  API.post("/api/reservations", data).then(r => r.data);

// DISPONIBILIDAD (opcional en UI)
export const getAvailability = (restaurantId, dateISO) =>
  API.get(`/api/restaurants/${restaurantId}/availability`, { params: { date: dateISO } }).then(r => r.data);
