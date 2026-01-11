import { cookies } from "next/headers";

// Nombre de la cookie de sesión
const SESSION_COOKIE = "cafe-cursor-admin-session";

/**
 * Obtiene las credenciales del admin desde variables de entorno (lectura en runtime)
 * NOTA: Usamos .trim() para eliminar espacios/saltos de línea que pueden venir en las env vars
 */
function getAdminCredentials() {
  const username = (process.env.ADMIN_USERNAME || "admin").trim();
  const password = (process.env.ADMIN_PASSWORD || "cafecursor2024").trim();
  const secret = (process.env.SESSION_SECRET || "cafe-cursor-secret-key-2024").trim();
  return { username, password, secret };
}

/**
 * Verifica las credenciales del admin
 */
export function verifyCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials();
  
  // Log para depuración (remover en producción)
  console.log(`🔑 [AUTH] Verificando credenciales...`);
  console.log(`🔑 [AUTH] ENV ADMIN_USERNAME existe: ${!!process.env.ADMIN_USERNAME}`);
  console.log(`🔑 [AUTH] ENV ADMIN_PASSWORD existe: ${!!process.env.ADMIN_PASSWORD}`);
  console.log(`🔑 [AUTH] Username esperado: ${credentials.username}`);
  console.log(`🔑 [AUTH] Username recibido: ${username}`);
  console.log(`🔑 [AUTH] Password coincide: ${password === credentials.password}`);
  
  return username === credentials.username && password === credentials.password;
}

/**
 * Crea un token de sesión simple
 */
export function createSessionToken(): string {
  const { username, secret } = getAdminCredentials();
  const timestamp = Date.now();
  const data = `${username}:${timestamp}:${secret}`;
  // Simple base64 encoding (en producción usar JWT)
  return Buffer.from(data).toString("base64");
}

/**
 * Verifica si el token de sesión es válido
 */
export function verifySessionToken(token: string): boolean {
  try {
    const credentials = getAdminCredentials();
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [username, timestamp, secret] = decoded.split(":");
    
    // Verificar que el token no tenga más de 24 horas
    const tokenTime = parseInt(timestamp, 10);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 horas
    
    if (now - tokenTime > maxAge) {
      return false;
    }
    
    return username === credentials.username && secret === credentials.secret;
  } catch {
    return false;
  }
}

/**
 * Establece la cookie de sesión
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 24 * 60 * 60, // 24 horas
    path: "/",
  });
}

/**
 * Obtiene la cookie de sesión
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

/**
 * Elimina la cookie de sesión
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Verifica si el usuario está autenticado
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await getSessionCookie();
  if (!token) return false;
  return verifySessionToken(token);
}
