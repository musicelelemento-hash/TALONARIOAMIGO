# Conexiones pendientes

> Lista para que el dueño conecte todo de una vez. Cada fila dice qué agente la usa y para qué.
> Las llaves nunca se pegan en el chat: se guardan con el formulario seguro del entorno o directamente
> en Render.

| # | Conexión | Agente que la usa | Para qué | Cómo se conecta | Estado |
|---|---|---|---|---|---|
| 1 | **Repositorio de producción** (GitHub de la otra cuenta, o decidir que produzca este) | `infra-operaciones`, `dev-backend` | Llevar los arreglos a producción | Dar acceso a la app de Claude en GitHub a ese repo, o cambiar el repo en Render | ⏳ El dueño confirma cuál es el actual |
| 2 | **Render** (cuenta Talonario) | `infra-operaciones` | Logs, salud, variables | Network secret `api.render.com` | ✅ Conectado (rotar la llave escrita en el chat) |
| 3 | **Supabase** (cuenta Talonario) | `infra-operaciones`, `dev-backend` | Base de datos, migraciones, advisors | Network secret `api.supabase.com` | ✅ Conectado |
| 4 | **Cloudflare** (cuenta Talonario) | `infra-operaciones` | Keep-alive, dominio, landing | API token → network secret `api.cloudflare.com` | ⏳ Pendiente |
| 5 | **Meta Business** (Facebook e Instagram de Talonario) | `marketing-contenido`, `crecimiento-negocio` | Publicar, anuncios, métricas | Cuenta de Meta Business + página + cuenta publicitaria; luego token para leer métricas | ⏳ Pendiente |
| 6 | **WhatsApp Business (Cloud API)** | `dev-backend` | Factura por WhatsApp y botón Ayúdame | Las 5 variables de `docs/WHATSAPP_SETUP.md` en Render | ⏳ Pendiente |
| 7 | **Generador de video con IA** | `marketing-contenido` | Producir los videos de `PROMPTS_VIDEO.md` | El generador de Meta en Ads Manager, o una cuenta de Veo, Kling o Runway | ⏳ Elegir herramienta |
| 8 | **ElevenLabs** (voz en off) | `marketing-contenido` | Voces en español para los videos | Ya hay un conector en claude.ai; confirmar que es la cuenta correcta | ⚠️ Revisar cuenta |
| 9 | **Canva** (edición, texto y subtítulos) | `marketing-contenido` | Editar videos y artes | Ya hay un conector en claude.ai; confirmar cuenta | ⚠️ Revisar cuenta |
| 10 | **Pasarela de cobro** (PayPhone, Kushki u otra) | `dev-backend`, `crecimiento-negocio` | Cobrar los planes | Llave de pruebas (sandbox) primero → network secret | ⏳ Elegir pasarela |
| 11 | **Google Play Console** | `dev-backend` | Publicar la APK | Cuenta de desarrollador (USD 25, una vez) | ⏳ Pendiente |
| 12 | **Resend** (correo) | `dev-backend` | Enviar el RIDE al cliente | Ya configurado en Render | ✅ En producción |
| 13 | **Dominio** (talonarioamigo.com o similar) | `infra-operaciones`, `marketing-contenido` | Landing, correo, confianza | Registrar y apuntar en Cloudflare | ⏳ Confirmar si existe |
| 15 | **Respaldo FreeLLMAPI** (modelos gratuitos) | Todos, solo en emergencia | Seguir trabajando si no hay Claude | En tu PC: `docs/RESPALDO_FREELLMAPI.md` y `scripts/respaldo-claude.ps1` | ⏳ Preparar en la PC (rotar la llave escrita en el chat) |
| 14 | **Carpeta de la laptop** | Todos | Archivos que solo están en tu computadora | App de escritorio de Claude → Ajustes → Claude Code → Remote Control (puede no estar disponible en todas las cuentas); si no, subir al repo | ⏳ Pendiente |

**Notas:**
- Los conectores de Render y Vercel de claude.ai apuntan a tu cuenta personal (otro proyecto): no se usan
  para Talonario.
- Cualquier cambio en producción pide tu aprobación: hay un candado automático
  (`.claude/hooks/proteger-produccion.sh`).
