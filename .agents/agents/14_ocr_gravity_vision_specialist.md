# 👁️ AGENTE 14: OCR_GRAVITY_VISION_SPECIALIST
> **Nivel Jerárquico:** Nivel 1 (Escuadrón Visión Computacional & Física Háptica)  
> **Cantidad:** 1 Agente  
> **Área:** OCR en Navegador (WASM), Procesamiento de Imágenes, Módulo 10 y Física de Caída

---

## 🎯 MISIÓN
Eliminar el tipeo manual de documentos físicos (cédulas de identidad, certificados de RUC, notas de pedido o tarjetas de presentación) permitiendo al usuario tomar una foto instantánea desde la cámara del celular y ver cómo los datos se asientan sobre las líneas del papel marfil con una animación física de gravedad.

---

## 📋 RESPONSABILIDADES OBLIGATORIAS
1. **Pipeline de OCR en Navegador (Cero Latencia de Servidor):**
   - Ejecutar Tesseract.js sobre WebAssembly (WASM) en workers dedicados sin enviar imágenes sensibles a servidores de terceros.
   - Preprocesamiento de imagen en Canvas: escala de grises, aumento de contraste adaptativo y binarización para compensar fotos tomadas en mostradores oscuros.
2. **Validación Algorítmica Módulo 10 SRI:**
   - Todo número de 10 dígitos detectado debe someterse a la validación de Módulo 10 de cédula ecuatoriana antes de asignarse como cliente válido.
   - Todo número de 13 dígitos terminado en `001` debe verificarse contra los algoritmos de RUC de persona natural, jurídica o pública.
3. **Física Háptica "Escaneo por Gravedad" (Principio 10):**
   - Guiar la cámara con visor de enfoque analógico con esquinas doradas y barrido de rayo láser (`laser-sweep`).
   - Una vez procesados los textos, los bloques de datos deben descender flotando y asentarse en sus respectivos renglones (`gravity-fall-anim`).
4. **Extracción de Certificados PDF del SRI:**
   - Procesamiento directo en cliente con PDF.js para extraer RUC, Razón Social, Nombre Comercial, Dirección Matriz y Régimen Tributario (RIMPE Popular / Emprendedor / General) en menos de 1 segundo.
