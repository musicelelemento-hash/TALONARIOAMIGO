/**
 * Servicio: invoiceValidator
 * Especialista en validación pre-flight en cliente, diagnóstico de inconsistencias y traducción de errores SRI.
 * Principio: Cero errores crípticos para el comerciante.
 */

export const invoiceValidator = {
    /**
     * Valida el payload de la factura antes de enviarlo al servidor
     * @param {Object} payload - { cliente: { nombre, identificacion, direccion, telefono, email }, items: [] }
     * @param {Object} emisorState - Estado actual del emisor (isDemoMode, hasSignature, isConfigured)
     * @returns {Object} { valid: boolean, code?: string, title?: string, message?: string, solution?: string }
     */
    validatePreFlight(payload, emisorState = {}) {
        const isDemo = !!emisorState.isDemoMode;

        // 1. Validación de Modo Real vs Firma y Configuración
        if (!isDemo) {
            if (!emisorState.isConfigured) {
                return {
                    valid: false,
                    code: 'MISSING_CONFIG_REAL_MODE',
                    title: 'Falta Configuración Tributaria (Modo Real)',
                    message: 'Estás en Modo Real. Debes configurar tus datos tributarios (RUC, razón social) antes de emitir ante el SRI.',
                    solution: 'Toca la barra roja superior para configurar tu talonario en 30 segundos.'
                };
            }
            if (!emisorState.hasSignature) {
                return {
                    valid: false,
                    code: 'MISSING_SIGNATURE_REAL_MODE',
                    title: 'Falta Firma Electrónica (.p12) en Modo Real',
                    message: 'El SRI exige que todo comprobante real esté firmado digitalmente con tu archivo .p12.',
                    solution: 'Toca la barra roja superior para seleccionar tu archivo .p12 e ingresar tu contraseña.'
                };
            }
        }

        // 2. Validación de Datos del Cliente
        const cliente = payload?.cliente || {};
        const nombre = (cliente.nombre || '').trim();
        const id = (cliente.identificacion || '').trim().replace(/[^0-9A-Za-z]/g, '');

        if (!nombre) {
            return {
                valid: false,
                code: 'CLIENT_NAME_EMPTY',
                title: 'Nombre de Cliente Vacío',
                message: 'Por favor ingresa el nombre o razón social del comprador en el renglón correspondiente.',
                solution: 'Escribe el nombre del cliente o díctalo tocando el micrófono.'
            };
        }

        if (!id) {
            return {
                valid: false,
                code: 'CLIENT_ID_EMPTY',
                title: 'Identificación Vacía',
                message: 'Ingresa la cédula, RUC o presiona "Consumidor Final" (9999999999999).',
                solution: 'Coloca el número de identificación o escanea la cédula con la cámara.'
            };
        }

        // Validación Módulo 10 de Cédula si tiene 10 dígitos numéricos y no es consumidor final
        if (id.length === 10 && /^\d+$/.test(id) && id !== '9999999999') {
            if (!this.validarCedulaEcuador(id)) {
                return {
                    valid: false,
                    code: 'INVALID_CEDULA',
                    title: 'Cédula Ecuatoriana Inválida',
                    message: `El número ${id} no corresponde a una cédula válida según el algoritmo de Módulo 10 del Registro Civil.`,
                    solution: 'Verifica los 10 dígitos de la cédula del comprador.'
                };
            }
        }

        // Validación de RUC si tiene 13 dígitos
        if (id.length === 13 && /^\d+$/.test(id) && id !== '9999999999999') {
            if (!id.endsWith('001')) {
                return {
                    valid: false,
                    code: 'INVALID_RUC_ESTABLECIMIENTO',
                    title: 'RUC con Establecimiento Inválido',
                    message: `El RUC ${id} debe terminar en 001 u otro código de establecimiento válido de 3 dígitos.`,
                    solution: 'Verifica los 13 dígitos del RUC.'
                };
            }
        }

        // 3. Validación de Productos / Renglones
        const items = payload?.items || [];
        if (!items.length) {
            return {
                valid: false,
                code: 'NO_ITEMS',
                title: 'Factura Sin Productos',
                message: 'Agrega al menos un renglón con producto, cantidad y precio unitario.',
                solution: 'Toca uno de los iconos rápidos (🌽 Maíz, ☕ Café, etc.) o escribe un producto.'
            };
        }

        let totalCalculado = 0;
        for (let i = 0; i < items.length; i++) {
            const it = items[i];
            const cant = parseFloat(it.cantidad);
            const precio = parseFloat(it.precioUnitario);
            const desc = (it.descripcion || '').trim();

            if (!desc) {
                return {
                    valid: false,
                    code: 'ITEM_DESC_EMPTY',
                    title: `Renglón #${i + 1} Sin Descripción`,
                    message: `Ingresa el nombre del producto en el renglón #${i + 1}.`,
                    solution: 'Escribe la descripción del producto o servicio vendido.'
                };
            }

            if (isNaN(cant) || cant <= 0) {
                return {
                    valid: false,
                    code: 'ITEM_CANT_INVALID',
                    title: `Cantidad Inválida en Renglón #${i + 1}`,
                    message: `La cantidad de '${desc}' debe ser un número mayor a cero.`,
                    solution: 'Ingresa una cantidad válida (ej: 1, 5, 2.5).'
                };
            }

            if (isNaN(precio) || precio < 0) {
                return {
                    valid: false,
                    code: 'ITEM_PRECIO_INVALID',
                    title: `Precio Inválido en Renglón #${i + 1}`,
                    message: `El precio unitario de '${desc}' no puede ser negativo ni estar vacío.`,
                    solution: 'Ingresa el precio de venta en dólares.'
                };
            }

            totalCalculado += Math.round(cant * precio * 100) / 100;
        }

        // 4. Regla Legal SRI: Consumidor Final límite de $50 USD
        if (id === '9999999999999' && totalCalculado > 50.00) {
            return {
                valid: false,
                code: 'CONSUMIDOR_FINAL_EXCEEDED',
                title: 'Límite de Consumidor Final Superado ($50.00)',
                message: `El total de la factura es de \$${totalCalculado.toFixed(2)}. Según la resolución SRI NAC-DGERCGC22-00000024, toda venta superior a \$50.00 no puede emitirse a Consumidor Final.`,
                solution: 'Solicita el nombre y número de cédula o RUC del comprador para poder emitir.'
            };
        }

        return { valid: true };
    },

    /**
     * Algoritmo de validación de Cédula de Identidad de Ecuador (Módulo 10)
     */
    validarCedulaEcuador(cedula) {
        if (!/^\d{10}$/.test(cedula)) return false;
        
        const provincia = parseInt(cedula.substring(0, 2), 10);
        if ((provincia < 1 || provincia > 24) && provincia !== 30) return false;

        const tercerDigito = parseInt(cedula.charAt(2), 10);
        if (tercerDigito >= 6) return false;

        const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
        let suma = 0;

        for (let i = 0; i < 9; i++) {
            let valor = parseInt(cedula.charAt(i), 10) * coeficientes[i];
            if (valor >= 10) valor -= 9;
            suma += valor;
        }

        const digitoVerificadorCalculado = (10 - (suma % 10)) % 10;
        const digitoVerificadorReal = parseInt(cedula.charAt(9), 10);

        return digitoVerificadorCalculado === digitoVerificadorReal;
    },

    /**
     * Diagnostica cualquier error devuelto por la API o SRI y lo traduce a lenguaje humano
     */
    diagnosticarError(error) {
        const msg = error?.message || String(error || '');
        const code = error?.code || '';
        const titulo = error?.titulo || 'Atención al Emitir Comprobante';
        const solucion = error?.solucion || '';

        // Si ya viene con diagnóstico estructurado del backend
        if (error?.diagnostico) {
            return {
                titulo: error.diagnostico.titulo || titulo,
                mensaje: error.diagnostico.mensajeHumano || msg,
                solucion: error.diagnostico.solucion || solucion,
                isSignatureError: false
            };
        }

        if (code === 'MISSING_SIGNATURE' || msg.includes('firma electrónica') || msg.includes('.p12')) {
            return {
                titulo: 'Falta Firma Electrónica (.p12)',
                mensaje: 'No tienes una firma electrónica vinculada para firmar digitalmente este comprobante en Modo Real.',
                solucion: 'Toca la barra roja superior para cargar tu archivo .p12 con tu contraseña.',
                isSignatureError: true
            };
        }

        if (code === 'PENDING_ONBOARDING' || msg.includes('datos tributarios')) {
            return {
                titulo: 'Faltan Datos Tributarios',
                mensaje: 'Debes completar tu RUC, razón social y dirección antes de emitir en modo real.',
                solucion: 'Toca la barra roja superior para completar tus datos.',
                isSignatureError: true
            };
        }

        if (msg.includes('CLAVE ACCESO REGISTRADA') || msg.includes('43')) {
            return {
                titulo: 'Clave de Acceso Duplicada en SRI',
                mensaje: 'El SRI reportó que este número de comprobante ya fue emitido.',
                solucion: 'El talonario avanzará automáticamente a la siguiente hoja.',
                isSignatureError: false
            };
        }

        if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
            return {
                titulo: 'Sin Conexión con el Servidor',
                mensaje: 'Se perdió la señal a internet mientras se transmitía el comprobante.',
                solucion: 'Tu comprobante quedó guardado en tu talonario local y se sincronizará automáticamente al recuperar señal.',
                isSignatureError: false
            };
        }

        return {
            titulo: titulo,
            mensaje: msg,
            solucion: solucion || 'Revisa los campos del talonario y vuelve a intentarlo.',
            isSignatureError: false
        };
    }
};
