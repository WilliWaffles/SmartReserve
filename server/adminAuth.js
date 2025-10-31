// server/adminAuth.js
import crypto from "crypto";

const {
  ADMIN_USER,
  ADMIN_PASS,
  ADMIN_TOKEN_SECRET,
} = process.env;

console.log("[DEBUG adminAuth]", {
  ADMIN_USER,
  ADMIN_PASS,
  ADMIN_TOKEN_SECRET: ADMIN_TOKEN_SECRET ? "***present***" : "MISSING"
});

/**
 * Genera un token firmado si las credenciales son correctas.
 * Devuelve string "<base64(payload)>.<firma>" o null si son incorrectas.
 */
export function loginAdmin(username, password) {
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    // payload mínimo con rol y timestamp
    const payload = JSON.stringify({
      role: "admin",
      ts: Date.now()
    });

    // firma HMAC con un secreto del servidor
    const signature = crypto
      .createHmac("sha256", ADMIN_TOKEN_SECRET)
      .update(payload)
      .digest("hex");

    // token = base64(payload) + "." + firma
    const token =
      Buffer.from(payload).toString("base64") + "." + signature;

    return token;
  }

  return null;
}

/**
 * Valida un token "payloadBase64.signature".
 * Devuelve true si es válido y el rol es 'admin', false si no.
 */
export function validateAdminToken(rawToken) {
  if (!rawToken) return false;

  const parts = rawToken.split(".");
  if (parts.length !== 2) return false;

  const [b64, signature] = parts;
  const payload = Buffer.from(b64, "base64").toString("utf8");

  // Recalcular firma
  const expectedSig = crypto
    .createHmac("sha256", ADMIN_TOKEN_SECRET)
    .update(payload)
    .digest("hex");

  if (signature !== expectedSig) return false;

  try {
    const data = JSON.parse(payload);
    if (data.role !== "admin") return false;
    // Aquí podríamos validar expiración con data.ts si quisiéramos (TTL).
    return true;
  } catch {
    return false;
  }
}

/**
 * Middleware Express para rutas protegidas.
 * Requiere header Authorization: "Bearer <token>"
 */
export function requireAdmin(req, res, next) {
  const authHeader = req.headers["authorization"] || "";

  const parts = authHeader.split(" ");
  // Debe venir exactamente "Bearer <token>"
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res
      .status(401)
      .json({ error: "No autorizado (token faltante o formato inválido)" });
  }

  const token = parts[1];
  const ok = validateAdminToken(token);
  if (!ok) {
    return res
      .status(403)
      .json({ error: "No autorizado (token inválido)" });
  }

  next();
}
