# Proceso semanal: crear, publicar y elegir videos en Meta

> Cómo pasamos de un prompt a un anuncio ganador. Lo ejecuta el director con `marketing-contenido`
> y `crecimiento-negocio`. **Nada se publica ni se gasta dinero sin la aprobación del dueño.**

## El ciclo de cada semana
| Día | Qué pasa | Quién |
|---|---|---|
| Lunes | Proponer 5 a 8 ideas nuevas según lo que funcionó la semana anterior | `marketing-contenido` |
| Lunes | **El dueño elige 3 a 4 ideas** | Dueño |
| Martes | Generar el video (2 variantes por idea), la voz en off y la edición con texto | Dueño + Claude (prompts, guion, textos) |
| Miércoles | **El dueño aprueba las piezas finales** | Dueño |
| Miércoles–jueves | Publicar sin pagar: Reels de Facebook e Instagram, TikTok, estados de WhatsApp | Dueño |
| Viernes | Las 1 o 2 mejores en orgánico pasan a anuncio con presupuesto pequeño | Dueño aprueba el gasto |
| Lunes siguiente | Leer métricas, escalar ganadores, apagar perdedores, aprender | `crecimiento-negocio` |

## Cómo elegimos (tabla de puntaje)
Cada pieza se juzga con datos de al menos 3 días o 1.000 impresiones.

| Métrica | Qué significa | Señal verde (referencia inicial) |
|---|---|---|
| Gancho (vistas de 3 s ÷ impresiones) | ¿Detuvo el dedo? | 25 % o más |
| Retención (vistas al 50 %) | ¿Se quedó mirando? | 15 % o más |
| Clics (CTR del enlace) | ¿Le interesó? | 1 % o más |
| Costo por registro | ¿Cuánto cuesta un cliente? | Se fija con la primera semana; baja semana a semana |
| Registro → primera factura | ¿Era el público correcto? | 60 % o más |

**Reglas de decisión:**
- **Escalar:** verde en gancho y en costo por registro → subir el presupuesto un 20–30 % cada 3 días.
- **Corregir:** buen gancho pero pocos clics → cambiar la llamada a la acción o el cierre.
- **Apagar:** gancho bajo el 15 % después de 1.000 impresiones.
- **Aprender:** anotar en `PROMPTS_VIDEO.md` por qué ganó o perdió cada pieza.

Los umbrales son puntos de partida: se recalibran con los datos reales de Talonario Amigo.

## Estructura de anuncios en Meta (cuando haya cuenta)
- **Campaña:** objetivo "Clientes potenciales" o "Ventas o registros en la app", según lo que se mida.
- **Público:** Ecuador; mayores de 25; un conjunto amplio (que el algoritmo encuentre) y uno de "hijos
  que ayudan a sus padres".
- **Presupuesto de prueba:** pequeño y diario por conjunto (por ejemplo, entre 5 y 10 dólares). El
  dueño fija el tope total.
- **Creatividades:** 3 o 4 videos por conjunto; Meta reparte el gasto hacia el que mejor funciona.
- **Ubicaciones:** Reels de Facebook e Instagram, historias y estados.

## Lo que falta construir para medir bien (tarea de `dev-backend`)
1. **Píxel de Meta y API de Conversiones** en la landing y en la app, con los eventos `Registro`,
   `PrimeraFactura` y `PlanPagado`. Sin esto no se sabe qué video trae clientes que facturan.
2. **Enlaces con UTM** por pieza (`utm_source=meta&utm_content=doña-rosa-a`) guardados en el registro.
3. **Panel simple** en el panel del dueño: registros y primeras facturas por campaña.

## Etiquetas y políticas
- Si un anuncio muestra personas o escenas realistas creadas con IA, se marca como contenido generado
  con IA cuando Meta lo pida.
- Nada de afirmaciones engañosas ni de urgencia falsa ("¡última oportunidad antes de la multa!").
