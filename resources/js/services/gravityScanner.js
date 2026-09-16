/**
 * Servicio: Escaneo por Gravedad (Gravity Drop Scanner)
 * Principio 10 del Producto: "Los datos 'caen' asentándose sobre las líneas"
 * Permite subir una foto, proforma o certificado y ver cómo los datos caen con física de gravedad
 * sobre las líneas del talonario impreso.
 */

export class GravityScannerService {
    /**
     * Procesa un archivo de proforma o documento escaneado
     * @param {File} file
     * @returns {Promise<object>} Datos extraídos listos para caer con gravedad
     */
    async scanDocument(file) {
        // Simulación de escaneo OCR inteligente con retardo de escaneo de 1.2 segundos
        await new Promise((resolve) => setTimeout(resolve, 1200));

        const fileName = (file?.name || '').toLowerCase();

        // Si el archivo menciona café o cacao
        if (fileName.includes('cacao') || fileName.includes('cafe')) {
            return {
                cliente: {
                    nombre: 'Agropecuaria El Porvenir Cía. Ltda.',
                    identificacion: '0791726354001',
                    direccion: 'Vía Principal Santa Rosa - El Oro'
                },
                items: [
                    { cantidad: 25, descripcion: 'Quintales de Cacao Fino de Aroma Nacional', precioUnitario: 62.50 },
                    { cantidad: 10, descripcion: 'Sacos de Café Arábigo Seleccionado', precioUnitario: 48.00 }
                ]
            };
        }

        // Por defecto: Proforma comercial típica ecuatoriana
        return {
            cliente: {
                nombre: 'Distribuidora Agrícola San Francisco S.A.',
                identificacion: '1792837465001',
                direccion: 'Av. 25 de Junio y Pasaje, El Guabo'
            },
            items: [
                { cantidad: 30, descripcion: 'Cajas de Banano Calidad Exportación 22XU', precioUnitario: 6.85 },
                { cantidad: 12, descripcion: 'Quintales de Maíz Amarillo Seleccionado', precioUnitario: 18.50 },
                { cantidad: 5, descripcion: 'Bidones de Fertilizante Foliar Bio', precioUnitario: 32.00 }
            ]
        };
    }

    /**
     * Aplica la animación física de caída por gravedad a los campos del talonario
     */
    applyGravityDropAnimation() {
        const targets = [
            document.getElementById('cliente-nombre-input'),
            document.getElementById('cliente-direccion-input'),
            document.getElementById('cliente-ruc-input'),
            document.querySelector('#realista-items-body')
        ];

        targets.forEach((el, index) => {
            if (!el) return;
            el.classList.remove('gravity-drop-anim');
            void el.offsetWidth; // Reflow
            setTimeout(() => {
                el.classList.add('gravity-drop-anim');
            }, index * 80);
        });
    }
}

export const gravityScanner = new GravityScannerService();
