# 🎨 Sistema de diseño — Talonario Amigo

> Un solo sistema visual para la app, la landing y los materiales comerciales.
> Estética: **"Realismo Táctil Moderno"** (Apple + Linear + Stripe), con el papel como protagonista.

## Principios

1. **Realismo en el objeto, minimalismo en la interfaz.** El talonario es de papel (marfil, copia azul, lomo engomado); la UI alrededor es plana y limpia.
2. **Un solo foco de luz por escena.** Sombra suave y difusa; nunca múltiples glows.
3. **Los metales/brillos son acento, no fondo.** Máximo 1 por pantalla.
4. **Aire.** Mucho espaciado; el papel respira y la UI también.
5. **Prohibido el look "hacker de los 90"**: sin cian neón `#00D4FF`, sin dorados de fondo, sin scanlines.

## Tokens de color (design system v2)

| Token | Valor | Uso |
|---|---|---|
| `--ds-bg` | `#0B1220` | Fondo de app (navy profundo) |
| `--ds-surface` | `#131C2E` | Paneles |
| `--ds-surface-2` | `#1B2540` | Elevada |
| `--ds-paper` | `#FFFFFF` | Papel/documento |
| `--ds-accent` | `#2563EB` | Acción primaria (azul marca) |
| `--ds-success` | `#16A34A` | Éxito / firma activa |
| `--ds-danger` | `#DC2626` | Alertas |
| `--ds-text` | `#0B1220` | Texto sobre papel |
| `--ds-text-onDark` | `#F1F5F9` | Texto sobre fondo |
| `--ds-border` | `#E2E8F0` | Bordes claros |
| `--ds-border-onDark` | `#26314D` | Bordes sobre navy |

### Paleta del talonario (solo el objeto)
| Elemento | Color |
|---|---|
| Papel Marfil | `#FCFBF6` |
| Copia azul | `#EBF3FF` / `#1D4ED8` |
| Lomo engomado | `#4A2E1B` / `#3A2312` |
| Tinta | `#1B2D4F` |
| Folio rojo | `#D62828` |

## Tipografía (2 familias)

- **Outfit** (`--ds-font`) — UI y etiquetas.
- **JetBrains Mono** (`--ds-font-mono`) — valores contables, folio, claves.
- (Landing) **Playfair Display** para titulares serif y **Caveat** para el renglón manuscrito del mock.

Escala: 11 / 13 / 15 / 18 / 24 / 32 / 44 px.

## Espaciado, radios y elevación

- Espaciado base 4 px (4, 8, 12, 16, 24, 32, 48, 64).
- Radios: 6 (sm) · 10 (base) · 16 (lg) · 999 (full).
- Sombras: 3 niveles sutiles (`--ds-shadow-sm|--ds-shadow|--ds-shadow-lg`).
- Movimiento: `--ds-dur` 180 ms, `--ds-ease` cubic-bezier(0.4, 0, 0.2, 1).

## Componentes

- **CTA primario**: fondo navy/azul, texto blanco, sombra sutil.
- **Botón "stamp"**: navy `#0F172A`, texto blanco, radio 10.
- **Inputs**: borde `#E2E8F0` → focus `#1D4ED8` con halo suave.
- **Badges**: pill, fondo suave + borde translúcido.
- **Estados**: success verde sobrio; danger rojo contenido.

## Dónde vive

- App: `TALONARIOAMIGO/resources/js/style.css` — `:root` (líneas ~4-72, "DESIGN SYSTEM v2") y capa "SKIN MODERNO Realismo Táctil" (líneas ~2703+) que remapea los tokens legacy.
- Landing: `docs/landing.html` (mismos tokens, fuentes Playfair/Caveat).

## Reglas de implementación

1. **Nunca** usar `#00D4FF`, `#D4AF37`/`#C5A059` como fondos ni glows de fondo.
2. Una acción primaria por pantalla (azul `#2563EB`).
3. Cualquier nuevo componente debe usar los tokens `--ds-*`, no hex sueltos.
4. Mantener el papel como el único elemento con textura.

> Este documento es la fuente de coherencia: ajustes visuales deben partir de aquí.
