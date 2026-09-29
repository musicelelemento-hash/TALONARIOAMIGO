# Talonario Amigo — Reglas, Objetivos, Misión y Design System

## 🎯 Misión Estratégica
> *"No vendemos facturación electrónica. Vendemos: La tranquilidad de seguir usando tu talonario de toda la vida."*

Transformar la transición tributaria de los pequeños comerciantes de Ecuador en una experiencia ultra simple, cálida y familiar, inspirada en los estándares de refinamiento de **Apple, Linear y Stripe**.

---

## 🎨 Los 5 Principios del Design System de Talonario Amigo

1. **El Papel es el Protagonista Único (80%-95% de Pantalla)**: Ningún elemento secundario ni marco debe competir visualmente con el papel marfil (`#FCFBF6`).
2. **Un Solo Color de Énfasis Principal por Vista**:
   - Acciones primarias: Azul Petróleo / Navy Institucional (`#1E293B` / `#0F172A`).
   - Estados de éxito y validación: Verde Esmeralda Unificado (`#16A34A`).
3. **Jerarquía Estricta de Bordes (Border-Radius Hierarchy)**:
   - Contenedores principales: `18px`
   - Tarjetas secundarias: `14px`
   - Botones y CTAs: `12px`
   - Campos de entrada: `10px`
   - Switches y Badges: `20px` / `Circular (50%)`
4. **Modo Comerciante Integrado**:
   - Una vez configurada la firma, la app oculta la carga técnica y saluda al usuario (*"Buenos días, Carlos. Tu talonario está listo."*), ofreciendo acceso directo con un único CTA estelar.
5. **Microinteracciones y Emoción**:
   - Reacción microtáctil del papel al enfocar (`scale(0.995)`).
   - Sello animado de hule **CLACK** (`✓ FIRMA VALIDADA`).
   - Revelado de la **copia azul autocopiativa** al emitir.

---

## 📜 Los 19 Principios de Producto

1. **La tranquilidad como experiencia**: Cero menús aburridos ni software ERP gris.
2. **Papel al 95% del Viewport**: El marco del teléfono desaparece.
3. **Imperfecciones Humanas (Physical Realism)**: Esquina doblada 3D (`leaf-corner-curl`), sombras y fibras de papel.
4. **Masa y Peso del Bloque**: Microdesplazamiento de `0.5px` al desprender una hoja.
5. **Paisaje Sonoro Orgánico**: Ruido de papel, lapicero, sello SRI y desprendimiento (`rrrrrip`).
6. **Contador Mecánico (Odometer Spin)**: El folio rota como tacómetro analógico.
7. **Deslizamiento Orgánico**: La hoja nueva entra desde abajo.
8. **Physical Affordance**: Luces y sombras que invitan al tacto.
9. **Dictado por Voz en Renglón**: Onda sonora viva (`audio-wave-anim`) sobre el renglón.
10. **Escaneo por Gravedad**: Los datos "caen" asentándose sobre las líneas.
11. **Total Cobro Estilo Apple Pay**: Enorme, con abundante aire y monospaced.
12. **Envío Sobrio & Copia Azul**: Desprendimiento 3D + revelado de la copia azul autocopiativa.
13. **Historial por Tomos Físicos**: `JULIO 📒 150 Hojas`, `AGOSTO 📒 83 Hojas`.
14. **Tarjetas de Clientes Frecuentes**: `Juan Pérez — Compró 14 veces — Última compra: ayer`.
15. **Productos Táctiles con Iconos Reales**: 🌽 Maíz, ☕ Café, 🥥 Cacao, 🍌 Banano.
16. **Carga por Hojas Apiladas**: Una hoja desciende encajando en el bloque (`□□□□□□□□□□`).
17. **Filosofía de Identidad**: *Siempre papel. Siempre tranquilo. Nunca ERP.*
18. **Anti-Formulario Gris**: Flujo analógico continuo.
19. **El Detalle Viral**: Duplicado azul tradicional autocopiativo del emisor.

---

## 🏛️ Sistema Multi-Agente Operativo (12 Agentes en 4 Niveles)
Consulta la arquitectura completa y contratos en [SISTEMA_MULTI_AGENTES.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/SISTEMA_MULTI_AGENTES.md) y las fichas en [.agents/agents/](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/):

- **NIVEL 0 (Comando Maestro):**
  - [01_orchestrator_master.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/01_orchestrator_master.md)
- **NIVEL 1 (Escuadrón Tributario & SRI):**
  - [02_sri_compliance_officer.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/02_sri_compliance_officer.md)
  - [03_p12_vault_security.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/03_p12_vault_security.md)
  - [04_soap_sri_pipeline.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/04_soap_sri_pipeline.md)
- **NIVEL 1 (Escuadrón Producto & Móvil):**
  - [05_tactile_design_system.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/05_tactile_design_system.md)
  - [06_frontend_spa_engineer.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/06_frontend_spa_engineer.md)
  - [07_mobile_capacitor_engineer.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/07_mobile_capacitor_engineer.md)
- **NIVEL 1 (Escuadrón B2B & Crecimiento):**
  - [08_b2b_reseller_director.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/08_b2b_reseller_director.md)
  - [09_viral_growth_marketer.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/09_viral_growth_marketer.md)
  - [10_metrics_retention_analyst.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/10_metrics_retention_analyst.md)
- **NIVEL 2 (Escuadrón Infraestructura & Calidad):**
  - [11_edge_infra_engineer.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/11_edge_infra_engineer.md)
  - [12_qa_test_guardian.md](file:///c:/Programacion/Aplicaciones/Talonario%20Amigo/.agents/agents/12_qa_test_guardian.md)

