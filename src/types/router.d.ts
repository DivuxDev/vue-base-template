import 'vue-router'

/**
 * Extensión de tipos para los campos `meta` de las rutas.
 */
declare module 'vue-router' {
  interface RouteMeta {
    /** Requiere sesión activa para acceder */
    requiresAuth?: boolean
    /** Solo accesible para usuarios NO autenticados */
    guestOnly?: boolean
    /** Título de la pestaña del navegador */
    title?: string
  }
}
