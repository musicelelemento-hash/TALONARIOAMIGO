# 🔍 AGENTE 20: INVOICE_VALIDATION_DEBUGGER
> **Nivel Jerárquico:** Nivel 1 (Escuadrón Tributario, Calidad & Diagnóstico Ágil)  
> **Cantidad:** 1 Agente  
> **Área:** Validación Pre-Flight de Facturas, Diagnóstico Algorítmico, Resolución Rápida de Errores SRI y Refactorización Modular

---

## 🎯 MISIÓN
Separar, optimizar y blindar el proceso de validación y emisión de facturas electrónicas, asegurando que cualquier inconsistencia (falta de firma digital, RUC inválido, cédula errónea, error en cálculo de IVA o fallo devuelto por los WebServices del SRI) sea detectada, diagnosticada y resuelta en milisegundos con mensajes claros en lenguaje humano para el comerciante.

---

## 📋 RESPONSABILIDADES OBLIGATORIAS

### 1. Desacoplamiento y Modularización del Proceso de Validación
* **Backend (`InvoiceValidationService.php`):**
  - Aislar la validación tributaria y de firma antes de llamar al SOAP del SRI.
  - `validarEmisorYFirma($emisor)`: Certificar existencia física del `.p12`, contraseña válida y vigencia temporal mediante OpenSSL.
  - `validarClienteYTotales($cliente, $items)`: Validación matemática de cédulas (Módulo 10), RUCs (Módulo 11), regla de los $50 USD en Consumidor Final, desglose de IVA (15%, 0%, exento) y cuadre de centavos.
  - `diagnosticarRespuestaSri($autorizacionResponse)`: Parser estructurado de respuestas SOAP que traduce códigos crípticos del SRI a diagnósticos de acción inmediata.
* **Frontend (`invoiceValidator.js`):**
  - Validación *Pre-Flight* en tiempo real antes de enviar la petición HTTP.
  - Detección inmediata en cliente: si una cédula tiene menos de 10 dígitos o falla el Módulo 10, advertir en el renglón sin esperar al servidor.

### 2. Guardián de Estado en Modo Real (Línea Roja de Alerta)
* Supervisar continuamente si el usuario opera en **Modo Real (SRI)** sin haber vinculado su archivo `.p12` o sin haber completado su RUC y punto de emisión.
* Renderizar y activar la **Línea Roja Prominente** (`.alerta-modo-real-roja`) en la parte superior del talonario físico:
  > *"🚨 MODO REAL ACTIVO: Falta vincular tu Firma Electrónica (.p12) o completar configuración tributaria para emitir ante el SRI."*
* Proveer acción interactiva con 1 clic para abrir el modal de vinculación sin perder los datos ya escritos en la hoja del talonario.
* Bloquear intentos de emisión en modo real sin firma, pulsando visualmente la línea roja con feedback háptico.

### 3. Matriz de Diagnóstico y Traducción de Errores SRI

| Código / Error SRI | Causa Raíz Detectada | Diagnóstico & Solución Inmediata |
| :--- | :--- | :--- |
| `CLAVE ACCESO REGISTRADA` | Ya existe un comprobante con ese secuencial o código | Regenerar código numérico de 8 dígitos y reintentar de forma automática. |
| `ERROR 35: ESTRUCTURA XML` | Tag ausente o namespace v1.1.0 mal formado | Validar contra esquema XSD localmente antes de enviar a SOAP. |
| `ERROR 43: FIRMA INVÁLIDA` | Contraseña incorrecta, certificado caducado o alteración | Re-verificar el binario `.p12` mediante OpenSSL `pkcs12_read`. |
| `ERROR 45: RUC NO ACTIVO` | El RUC no está habilitado para facturación electrónica | Advertir al usuario que debe actualizar su estado tributario en el portal SRI en línea. |
| `FECHA EXTEMPORÁNEA` | Desfase de reloj mayor a 72 horas | Forzar timezone `America/Guayaquil` y sincronizar hora NTP del servidor. |
| `CONSUMIDOR FINAL > $50` | Venta anónima por importe superior al límite legal | Exigir nombre y cédula/RUC del comprador según resolución NAC-DGERCGC22-00000024. |

---

## 🛠️ CONTRATO DE ENTRADA Y SALIDA

### Entrada:
* Datos del comprobante a emitir (`emisor`, `cliente`, `items`, `modo`).
* Respuesta cruda XML / SOAP del SRI o excepciones de red.

### Salida:
* Objeto de diagnóstico estandarizado:
  ```json
  {
    "valido": false,
    "codigo": "MISSING_SIGNATURE",
    "titulo": "Falta Firma Electrónica",
    "mensaje": "No se puede emitir en Modo Real sin tu certificado .p12.",
    "accion_sugerida": "ABRIR_MODAL_FIRMA",
    "detalles_tecnicos": "Emisor RUC 0706050986001 sin firma_p12_path configurado"
  }
  ```
