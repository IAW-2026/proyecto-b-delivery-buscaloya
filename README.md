# Módulo de Delivery // Ecosistema BuscaloYa (Etapa 2)

---

## 1. Enlace al Deploy de Producción

La aplicación se encuentra deployada en **Vercel** en un entorno de producción optimizado con conexión persistente a la base de datos y Clerk:

🔗 **URL de Producción:** [https://proyecto-b-delivery-buscaloya.vercel.app](https://proyecto-b-delivery-buscaloya.vercel.app)

---

## 2. Listado de Usuarios Disponibles para Pruebas

Para facilitar y agilizar la evaluación de las secciones protegidas de la aplicación (`/dashboard` y `/admin`), se han pre-configurado y habilitado las siguientes credenciales de prueba en Clerk (con códigos OTP estáticos en modo de prueba para evitar el bloqueo por dispositivo nuevo):

*   **Operador de Radar (Rol Delivery - Acceso Exclusivo a Radar):**
    *   **Email:** `delivery+clerktest@iaw.com`
    *   **Contraseña:** `iawuser#`
    *   *Permisos:* Acceso completo al Radar Táctico (`/dashboard`) y panel de simulación. Si intenta ingresar al panel de administración, el sistema lo redireccionará automáticamente al radar por falta de permisos.
*   **Administrador de Flota (Rol Admin - Acceso Total):**
    *   **Email:** `admin+clerktest@iaw.com`
    *   **Contraseña:** `iawuser#`
    *   *Permisos:* Acceso irrestricto a la consola de Radar (`/dashboard`) y al panel de administración y couriers (`/admin`).

*(Nota: Si Clerk solicita un código de verificación al iniciar sesión debido a detección de nuevo dispositivo, puede ingresar el código estático de prueba **`424242`** para acceder de inmediato sin depender de un buzón real).*

---

## 3. Instrucciones para Utilizar y Evaluar la Aplicación

Para recorrer y evaluar adecuadamente todas las funcionalidades del sistema táctico y logística, siga los siguientes pasos ordenados:

1.  **Inicio de Sesión:** Ingrese a la Landing Page en `/` y haga clic en **Iniciar Operación** para ser redirigido al portal seguro de Clerk. Inicie sesión con cualquiera de las cuentas de prueba: `delivery+clerktest@iaw.com` para probar el rol operador, o `admin+clerktest@iaw.com` para probar permisos totales de administración (Contraseña común: `iawuser#`).
2.  **Consola Táctica (Radar):** Tras autenticarse, accederá a la Consola de Control (`/dashboard`). Verá el mapa táctico digital de la ciudad de Bahía Blanca con datos cargados (drones, objetivos y líneas de navegación activas).
    *   *Navegación del Mapa:* Use la rueda del mouse o gestos táctiles para hacer Zoom, y mantenga presionado el botón derecho del mouse para desplazar la vista (Pan).
3.  **Simular Entrada de Pedido:** Haga clic en el botón flotante naranja **[ CONTROL CENTER ]** en la esquina inferior derecha para desplegar la Cyber Deck. En la pestaña `SIMULATOR`, haga clic en el botón **DISPARAR PEDIDO [MOCK]**. Esto simulará que la aplicación de Ventas envía una orden para ser despachada.
    *   *Resultado:* Aparecerá instantáneamente un orbe rosa parpadeante en el mapa (en el local del vendedor) y la orden se agregará a la lista de **Pending_Payloads** en el panel de la derecha.
4.  **Asignación de Drones:** Haga clic en el orbe rosa del mapa o en la tarjeta de la orden pendiente de la derecha. Se desplegará la ventana emergente brutalista de vinculación. Seleccione un dron disponible (en color verde en el panel de telemetría de abajo) y haga clic en **ENGAGE_LINK**.
    *   *Resultado:* El dron cambiará su estado a `ASSIGNED` y se desplazará en tiempo real en el mapa hacia las coordenadas del local de comida en una secuencia suave de vuelo.
5.  **Simular Telemetría:** Haga clic en **DISPARAR TELEMETRÍA [MOCK]** en el panel flotante para simular las actualizaciones de posición GPS de los drones activos. Esto actualizará los logs del sistema.
6.  **Flujo y Estados de Entrega (Misiones Activas):** En el panel derecho de la consola táctica, localice la orden vinculada:
    *   Haga clic en **Payload_Picked** para confirmar que la mercancía fue recogida (el estado avanza a `PICKED_UP`).
    *   Haga clic en **In_Transit** para ordenar al dron volar hacia el cliente (el estado avanza a `OUT_FOR_DELIVERY` y se trazará una línea discontinua de vuelo hacia el destino).
7.  **Confirmación OTP:** Cuando el dron llegue al comprador, el botón cambiará a **Confirm_Delivery**. Haga clic en él para abrir la ventana de seguridad emergente.
    *   *Cierre de Misión:* El código OTP de 4 dígitos asignado al cliente se muestra de forma conveniente en la tarjeta de la orden para facilitar la corrección (`CÓDIGO OTP (CLIENTE): XXXX`). Ingréselo en la casilla del modal y haga clic en **CERRAR OPERACIÓN**. La orden cambiará a `DELIVERED`, el dron volverá a estar disponible y se registrará un evento de auditoría.
8.  **Inspeccionar Tráfico (Traveler's Log):** En la Cyber Deck flotante, vaya a la pestaña `TRAFFIC LOGS`. Podrá navegar por las peticiones entrantes y salientes de la API en tiempo real con un coloreado visual interactivo de los JSON.
9.  **Administración y Flota:** Haga clic en **Admin Terminal** en la cabecera (o vaya a `/admin`) para ingresar al buscador paginado de telemetría histórica de envíos y al ABM de drones en **Gestión de Flota** (`/admin/couriers`), donde podrá crear, editar y dar de baja drones de forma segura.

---

## 4. Breve Descripción del Proyecto

El **Módulo de Delivery** del ecosistema *BuscaloYa* es una consola centralizada de despacho táctico y telemetría de drones de carga, diseñada bajo una robusta y llamativa estética brutalista y cyberpunk. Su función principal es permitir a los operadores supervisar, vincular y guiar de forma segura las entregas aéreas sobre el plano urbano de la ciudad de Bahía Blanca, manteniendo una visualización responsiva e interactiva de todos los actores en el mapa con independencia de la resolución del monitor del operador.

El backend del sistema está construido sobre **Next.js (App Router)** e implementa **Prisma ORM** como motor de interacción atómica y transaccional con una base de datos relacional **PostgreSQL (Supabase)** en la nube. La capa de presentación aprovecha las nuevas capacidades de **Tailwind CSS v4** para forjar una UI cohesiva sin bordes redondeados, utilizando colores fluorescentes de alta advertencia y tipografías monoespaciadas de grado industrial que emulan monitores CRT antiguos con barridos analógicos de fósforo.

Para garantizar la seguridad, las secciones críticas de control de flota y logs de auditoría se encuentran resguardadas de accesos no autorizados mediante la integración del middleware de **Clerk** en el servidor, restringiendo accesos a operadores debidamente autenticados en el ecosistema. Adicionalmente, el módulo incorpora esquemas estrictos de validación con **Zod** y expone APIs REST robustas diseñadas para enlazarse de forma transparente con los módulos de Ventas y Compras en las siguientes etapas del proyecto.

---

## 5. Notas y Comentarios para la Corrección

*   **Control de Acceso por Roles (RBAC):** Se implementó un layout de seguridad (`app/admin/layout.tsx`) que intercepta y protege herméticamente la sección de administración `/admin` y todas sus sub-rutas. Si un usuario logueado que no es administrador (por ejemplo, el operador `delivery+clerktest@iaw.com`) intenta acceder a `/admin`, el sistema inspecciona su email en el servidor y lo redirige automáticamente a `/dashboard`, cumpliendo con la segregación estricta de roles.
*   **Protección de Rutas en Producción (proxy.ts):** Siguiendo los estándares nativos de Next.js 16 y Turbopack, la protección de rutas de Clerk se ejecuta de forma centralizada en el archivo de middleware oficial `proxy.ts` a nivel de raíz, validando sesiones de forma óptima en el Edge de Vercel.
*   **Base de Datos Ricamente Poblada (Seeder):** Para evitar que el evaluador inicie el sistema vacío, el script `prisma/seed.ts` ejecuta primero una **purga total e irreversible de todas las tablas** de la base de datos en cascada para evitar duplicados o errores de integridad, y luego inserta **6 drones con estados variados**, **8 entregas en todas las etapas del ciclo de vida** y **12+ registros telemétricos simulados** en el historial.
*   **Modal OTP Dinámico por Unidad:** La confirmación de entrega final no utiliza primitivos de navegador (`prompt`), sino una ventana emergente integrada que adopta dinámicamente el color de misión hexadecimal aleatorio generado al vincular el dron, garantizando coherencia de diseño.
*   **Simulación de Sensores de Drones:** El panel táctico calcula en tiempo real métricas de vuelo para los drones activos: altitud variable en rampa (0m en despegue, 120m en crucero y 15m en aproximación), descarga de batería basada en el tiempo y pequeñas fluctuaciones realistas en la potencia de señal RSSI (`dBm`) y la conexión de satélites GPS.
*   **APIs REST Estandarizadas:** Las APIs de tracking y solicitudes validan rigurosamente que los elementos estén mapeados en coordenadas relativas (0 a 10000) e implementan mocks salientes en `lib/mock-external.ts` que registran en la bitácora TravelerLog toda la comunicación externa.
