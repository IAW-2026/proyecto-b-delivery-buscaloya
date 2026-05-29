# Ecosistema BuscaloYa // Módulo de Delivery (Etapa 2)

Aplicación logística autónoma de gestión de entregas y control táctico de flota de drones, construida para la **Etapa 2 (Implementación Individual)**.

## 🚀 Acceso al Sistema

*   **URL de Producción (Vercel):** [https://proyecto-b-delivery-buscaloya.vercel.app](https://proyecto-b-delivery-buscaloya.vercel.app)
*   **Acceso / Autenticación:** 
    *   La aplicación utiliza **Clerk** en modo *sandbox* compartido.
    *   Puedes iniciar sesión registrándote con cualquier correo de pruebas en `/sign-up` o ingresando a través del flujo de `/sign-in`.

---

## 🛠️ Stack Tecnológico Implementado

| Capa | Tecnología | Implementación en este Módulo |
| :--- | :--- | :--- |
| **Frontend / Full-stack** | **Next.js 16 (App Router)** | Páginas dinámicas, componentes optimizados y API enrutada bajo `/app` y `/components`. |
| **Estilos** | **Tailwind CSS v4** | Estética brutalista y cyberpunk retro-futurista de alta fidelidad visual. |
| **Base de Datos** | **PostgreSQL (Supabase)** | Base de datos relacional aislada y persistente en la nube. |
| **ORM** | **Prisma** | Modelado relacional atómico, migraciones y tipados automáticos con cliente de producción. |
| **Autenticación** | **Clerk** | Inicio de sesión seguro y roles a nivel de operador del panel táctico. |
| **Despliegue** | **Vercel** | Instancia en producción integrada con GitHub, optimizada con compilación en Turbopack. |

---

## 📋 Lista de Requisitos Cumplidos (Checklist de la Consigna)

*   **[✓] Páginas y Componentes Reutilizables en Next.js:** Interfaz construida con layouts globales, barras de navegación reactivas y componentes semánticos reutilizables.
*   **[✓] API Propia:** Exposición de endpoints REST documentados y listos para la integración del ecosistema en la Etapa 3:
    *   `POST /api/delivery-requests`: Recepción y creación de nuevas misiones de envío (usado por la App de Ventas).
    *   `GET /api/deliveries/[id]/tracking`: Consulta de telemetría de dron (usado por la App de Clientes).
    *   `POST /api/deliveries/[id]/cancel`: Cancelación atómica del pedido.
    *   `GET /api/deliveries/pending`: Listado en tiempo real de misiones en espera.
    *   `GET /api/logs`: Terminal de auditoría del sistema (**Traveler's Log**).
*   **[✓] Base de Datos PostgreSQL Propia:** Base de datos persistente en Supabase que almacena el historial de drones (`Courier`), misiones (`Delivery`), auditorías de tráfico (`TravelerLog`) y telemetría de vuelo (`DeliveryTrackingPoint`).
*   **[✓] Autenticación Clerk:** Flujo completo de login y registro. Se protegen las rutas de administración `/admin` y el `/dashboard` mediante el middleware oficial de Clerk.
*   **[✓] Panel de Administración:**
    *   Ubicado en `/admin`, permite monitorear y buscar envíos, así como gestionar la flota aérea de drones en `/admin/couriers` (crear, editar y dar de baja unidades).
*   **[✓] Búsqueda y Paginación:** Búsqueda en tiempo real de unidades y envíos, implementada con parámetros limpios en la URL (`?search=...&page=...`) para garantizar la persistencia del estado en el navegador.
*   **[✓] Manejo de Errores:** Control de excepciones mediante bloques `try/catch` globales, páginas 404 nativas de Next.js (`notFound()`) y control de fallos en llamadas de red.
*   **[✓] Validación de Formularios en Servidor:** Las Server Actions del panel de couriers validan estrictamente las entradas del usuario (nombres, teléfonos, tipos de vehículo y vinculación de operadores) antes de persistir en PostgreSQL.
*   **[✓] Consumo de API Externa de Valor:** Integración real (sin embeds) con el servicio de meteorología **Open-Meteo API** en el backend del `/dashboard`. Consulta las coordenadas tácticas en tiempo real (`latitude=-38.7196` y `longitude=-62.2724`) para mostrar telemetría atmosférica de velocidad de viento y temperatura antes del despegue de los drones.
*   **[✓] Aislamiento Completo y Mocks:** Todos los eventos externos de comunicación con otras webapps están implementados mediante interceptores de Mock (`mockNotifyOrderStatusChange` y `mockNotifyPaymentClose` en `lib/mock-external.ts`).

---

## ⚙️ Configuración y Variables de Entorno

El archivo `.env.example` en la raíz contiene las siguientes variables requeridas para inicializar el proyecto:

```env
# URL de conexión pooler de base de datos para Prisma
DATABASE_URL="tu_url_pooler_supabase"

# URL de conexión directa para migraciones de base de datos
DIRECT_URL="tu_url_directa_supabase"

# Credenciales de autenticación compartidas de Clerk
CLERK_SECRET_KEY="tu_clave_secreta_clerk"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="tu_clave_publica_clerk"
```
