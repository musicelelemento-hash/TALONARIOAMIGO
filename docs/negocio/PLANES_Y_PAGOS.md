# Planes, menús de pago y cobros — Talonario Amigo

> Base para `crecimiento-negocio` (qué cobrar) y para `interfaz-minimalista` y `dev-backend` (cómo se ve
> y cómo se cobra). **Los precios son hipótesis:** se validan con 20 comerciantes antes de fijarlos.

## 1. Principios
1. **Para las masas, el precio de entrada es cero.** El competidor real es el talonario de papel y la
   herramienta gratuita del SRI; lo que cobramos es la tranquilidad, la rapidez y la ayuda humana.
2. **Nunca bloquear una factura a medio camino.** Si alguien llega a su límite, la factura que está
   haciendo se emite igual y después se le ofrece subir de plan.
3. **Un solo botón para pagar**, con precio claro en dólares y "cancela cuando quieras".
4. **La imprenta también vende:** cada plan se puede activar con un código de la imprenta.

## 2. Planes (propuesta para validar)
| Plan | Para quién | Precio hipótesis | Incluye |
|---|---|---|---|
| **Gratis** | Probar sin miedo; ventas pequeñas | $0 | Hasta 15 facturas al mes, Modo Tranquilo, botón Ayúdame, el RIDE lleva "Hecho con Talonario Amigo" |
| **Tranquilo** | Mayores y negocios pequeños | ~$2,99/mes | Hasta 100 facturas, factura por WhatsApp, configuración asistida una vez |
| **Comerciante** | Tiendas con movimiento diario | ~$5,99/mes | Facturas ilimitadas, ticketera, clientes frecuentes, resumen del día, logo propio |
| **Pro** | Contadores y varias sucursales | ~$14,99/mes | Varias empresas, reportes, Excel y XML para el contador, atajos |
| **Paquete imprenta** | Imprentas aliadas | Por volumen (30/60/120 cuentas) | Panel de imprenta, activaciones, comisión mensual |

Anual: 2 meses gratis. Referidos: 1 mes gratis por cada vecino que emite su primera factura.

> El plan anterior hablaba de $25/mes. Para tiendas de barrio y mercados es probablemente alto: se
> recomienda probar los precios de arriba con 20 comerciantes reales y medir conversión.

## 3. Menús de pago dentro de la app (cómo se ve)
- **Medidor amable** en el inicio: "Te quedan 3 facturas gratis este mes" (sin rojo, sin alarma).
- **Pantalla de planes:** 3 tarjetas grandes (Gratis, Tranquilo, Comerciante) con 3 beneficios cada
  una, precio grande y un botón. Pro va en "Para contadores".
- **Desbloqueos visibles pero tranquilos:** las funciones de pago se ven con un candado pequeño y una
  frase ("Con el plan Comerciante puedes poner tu logo"), nunca con ventanas que interrumpen.
- **Pagar:** tarjeta, transferencia o código de la imprenta. Confirmación: "Listo, ya tienes tu plan".

## 4. Cómo se cobra (pendiente de decidir)
| Opción | Ventaja | A revisar |
|---|---|---|
| **PayPhone** | Muy usado en Ecuador, cobro con tarjeta y por enlace | Comisión y suscripciones |
| **Kushki** | Pasarela regional, suscripciones | Requisitos de alta |
| **Transferencia o depósito** | Lo que la gente ya usa | Conciliación manual al inicio |
| **Código de imprenta** | Ya existe el flujo de paquetes | Comisión a la imprenta |

**Cuidado con Android:** si se vende la suscripción **dentro de la APK** de Play Store, Google exige su
propio sistema de cobro (Google Play Billing) para bienes digitales. Lo habitual es cobrar en la web
(o con código de imprenta) y que la app solo muestre el plan activo. Revisar la política vigente de
Google Play antes de publicar.

**También necesitas facturar tú:** cada cobro a un cliente requiere tu propia factura electrónica.
Talonario Amigo puede emitirla con tu RUC (usamos nuestro propio producto).

## 5. Lo que falta construir
1. Modelo de datos de planes y suscripciones; límites por plan (`dev-backend`).
2. Medidor, pantalla de planes y candados amables (`interfaz-minimalista`).
3. Integración con la pasarela elegida, con webhooks y pruebas (`dev-backend`, con aprobación del dueño).
4. Eventos `PlanPagado` para medir qué anuncio trae clientes que pagan (ver `PROCESO_META.md`).
5. Revisión legal de términos de suscripción y devoluciones (`cumplimiento-seguridad` + abogado).
