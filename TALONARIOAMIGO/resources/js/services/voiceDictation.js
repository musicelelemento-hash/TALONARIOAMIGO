/**
 * Servicio: Dictado por Voz Inteligente (Web Speech Recognition API)
 * Principio 9 del Producto: "Onda sonora viva sobre el renglón"
 * Reconoce con precisión ecuatoriana:
 * 1. Cédula (10 dígitos) o RUC (13 dígitos)
 * 2. Nombre completo / Razón Social
 * 3. Dirección
 * 4. Teléfono / Celular (09xxxxxxxx)
 * 5. Correo electrónico (convirtiendo "arroba" a @ y "punto" a .)
 * 6. Renglón de productos (Cantidad + Descripción + Precio)
 */

const DIGIT_WORDS = {
    'cero': '0', 'uno': '1', 'un': '1', 'una': '1', 'dos': '2', 'tres': '3',
    'cuatro': '4', 'cinco': '5', 'seis': '6', 'siete': '7', 'ocho': '8', 'nueve': '9'
};

const COMPOUND_NUMBERS = {
    'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
    'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
    'veinte': 20, 'veintiuno': 21, 'veintidós': 22, 'veintitrés': 23, 'veinticuatro': 24,
    'veinticinco': 25, 'veintiséis': 26, 'veintisiete': 27, 'veintiocho': 28, 'veintinueve': 29,
    'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60,
    'setenta': 70, 'ochenta': 80, 'noventa': 90, 'cien': 100, 'ciento': 100
};

class VoiceDictationService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.initRecognition();
    }

    initRecognition() {
        if (typeof window === 'undefined') return;
        const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRec) {
            console.warn('SpeechRecognition API no soportada en este navegador.');
            return;
        }
        this.recognition = new SpeechRec();
        this.recognition.lang = 'es-EC';
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;
    }

    isSupported() {
        return !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));
    }

    start({ onStart, onTranscript, onParsed, onError, onEnd }) {
        if (!this.recognition) {
            this.initRecognition();
        }
        if (!this.recognition) {
            if (onError) onError(new Error('Reconocimiento de voz no soportado en este dispositivo.'));
            return false;
        }

        if (this.isListening) {
            try {
                this.recognition.stop();
            } catch (_e) {
                // ignore recognition stop error
            }
        }

        this.recognition.onstart = () => {
            this.isListening = true;
            if (onStart) onStart();
        };

        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            const transcript = result[0].transcript.trim();
            const isFinal = result.isFinal;

            if (onTranscript) {
                onTranscript(transcript, isFinal);
            }

            if (isFinal) {
                const parsed = this.parseComprehensiveSpeech(transcript);
                if (onParsed) onParsed(parsed, transcript);
            }
        };

        this.recognition.onerror = (event) => {
            console.warn('Speech recognition error:', event.error);
            this.isListening = false;
            if (onError) onError(event);
        };

        this.recognition.onend = () => {
            this.isListening = false;
            if (onEnd) onEnd();
        };

        try {
            this.recognition.start();
            return true;
        } catch (e) {
            console.error('Failed to start voice recognition', e);
            this.isListening = false;
            if (onError) onError(e);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (_e) {
                // ignore recognition stop error
            }
        }
        this.isListening = false;
    }

    /**
     * Convierte palabras numéricas habladas en dígitos continuos
     * Ejemplo: "cero nueve veintiocho tres siete" -> "092837"
     */
    wordsToDigits(str) {
        if (!str) return '';
        let words = str.toLowerCase().replace(/[-_,.]/g, ' ').split(/\s+/);
        let digits = '';
        for (const w of words) {
            if (/^\d+$/.test(w)) {
                digits += w;
            } else if (DIGIT_WORDS[w] !== undefined) {
                digits += DIGIT_WORDS[w];
            } else if (COMPOUND_NUMBERS[w] !== undefined) {
                digits += String(COMPOUND_NUMBERS[w]);
            }
        }
        return digits;
    }

    /**
     * Normaliza correos dictados por voz
     * Ejemplo: "carlos punto mendoza arroba gmail punto com" -> "carlos.mendoza@gmail.com"
     */
    normalizeSpokenEmail(str) {
        if (!str) return '';
        let clean = str.toLowerCase()
            .replace(/\s*(?:arroba|at)\s*/gi, '@')
            .replace(/\s*(?:punto|dot)\s*/gi, '.')
            .replace(/\s*(?:guion\s*bajo|underscore)\s*/gi, '_')
            .replace(/\s*(?:guion|dash)\s*/gi, '-')
            .replace(/\s+/g, '');
        
        const emailMatch = clean.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        return emailMatch ? emailMatch[0] : '';
    }

    /**
     * Parsea de forma inteligente cualquier frase hablada.
     * Puede contener:
     * - Datos del cliente (Cédula, RUC, Nombre, Dirección, Teléfono, Correo)
     * - Renglón de productos ("2 sacos de maíz a dieciocho con cincuenta")
     * - Frases combinadas
     */
    parseComprehensiveSpeech(phrase) {
        const raw = phrase.trim();
        const textLower = raw.toLowerCase();

        const result = {
            isClient: false,
            isProduct: false,
            cliente: {},
            items: [],
            raw: raw,
            detectedTags: []
        };

        // 1. Detección de Cédula o RUC
        // Buscar menciones como "cédula...", "ruc...", "identificación..." o dígitos continuos de 10/13
        const idMatches = textLower.match(/(?:c[eé]dula|ruc|identificaci[oó]n|ci)\s+(?:n[uú]mero\s+)?([a-z0-9\s]{8,35})/i);
        
        let foundId = '';
        if (idMatches && idMatches[1]) {
            const digits = this.wordsToDigits(idMatches[1]);
            if (digits.length >= 10) {
                foundId = digits.slice(0, 13);
            }
        }

        // Si no se encontró con prefijo pero hay una secuencia de 10 o 13 dígitos
        if (!foundId) {
            const standaloneDigits = raw.match(/\b\d{10}(?:001)?\b/);
            if (standaloneDigits) {
                foundId = standaloneDigits[0];
            } else {
                // Probar convirtiendo todas las palabras numéricas aisladas
                const fullDigits = this.wordsToDigits(raw);
                if (fullDigits.length === 10 || fullDigits.length === 13) {
                    foundId = fullDigits;
                }
            }
        }

        if (foundId) {
            result.cliente.identificacion = foundId;
            result.isClient = true;
            result.detectedTags.push(`ID: ${foundId}`);
        }

        // 2. Detección de Teléfono / Celular (Ecuador: 09xxxxxxxx o 7-9 dígitos)
        const telMatch = textLower.match(/(?:tel[eé]fono|celular|m[oó]vil|contacto|whatsapp)\s*:?\s*([a-z0-9\s]{8,30})/i);
        if (telMatch && telMatch[1]) {
            const telDigits = this.wordsToDigits(telMatch[1]);
            if (telDigits.length >= 7) {
                const formattedTel = telDigits.startsWith('593') ? '0' + telDigits.slice(3) : telDigits;
                result.cliente.telefono = formattedTel.slice(0, 10);
                result.isClient = true;
                result.detectedTags.push(`Tel: ${result.cliente.telefono}`);
            }
        } else {
            const standaloneTel = raw.match(/\b(09\d{8}|\+593\s*9\d{8})\b/);
            if (standaloneTel) {
                result.cliente.telefono = standaloneTel[0].replace(/\s+/g, '');
                result.isClient = true;
                result.detectedTags.push(`Tel: ${result.cliente.telefono}`);
            }
        }

        // 3. Detección de Correo Electrónico
        const emailMatch = textLower.match(/(?:correo|email|mail|electr[oó]nico)\s*:?\s*([a-z0-9\s._@-]+)/i);
        let normalizedEmail = '';
        if (emailMatch && emailMatch[1]) {
            normalizedEmail = this.normalizeSpokenEmail(emailMatch[1]);
        } else if (textLower.includes('arroba') || textLower.includes('@')) {
            normalizedEmail = this.normalizeSpokenEmail(raw);
        }

        if (normalizedEmail) {
            result.cliente.email = normalizedEmail;
            result.isClient = true;
            result.detectedTags.push(`Email: ${normalizedEmail}`);
        }

        // 4. Detección de Dirección
        const dirMatch = textLower.match(/(?:direcci[oó]n|domicilio|ubicado en|vive en|en la calle|sector|barrio)\s*:?\s*([^,;]+?)(?=\s+(?:tel[eé]fono|celular|correo|email|c[eé]dula|ruc|y\s+\d|$))/i);
        if (dirMatch && dirMatch[1]) {
            let dir = dirMatch[1].trim();
            // Capitalizar
            dir = dir.charAt(0).toUpperCase() + dir.slice(1);
            result.cliente.direccion = dir;
            result.isClient = true;
            result.detectedTags.push(`Dir: ${dir}`);
        }

        // 5. Detección de Nombre / Razón Social
        const nameMatch = textLower.match(/(?:nombre|cliente|se[ñn]or(?:a)?|sr\b|a nombre de|raz[oó]n social)\s*:?\s*([^,;]+?)(?=\s+(?:con\s+c[eé]dula|c[eé]dula|ruc|direcci[oó]n|tel[eé]fono|celular|correo|email|y\s+\d|$))/i);
        if (nameMatch && nameMatch[1]) {
            let nombre = nameMatch[1].trim();
            // Capitalizar palabras
            nombre = nombre.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            result.cliente.nombre = nombre;
            result.isClient = true;
            result.detectedTags.push(`Cliente: ${nombre}`);
        }

        // 6. Detección de Producto si contiene precio o estructura de ítem
        // Ejemplo: "2 quintales de cacao a 65 dólares" o "tres sacos de arroz a 22.50"
        const productParsed = this.parseSpokenItem(raw);
        if (productParsed && productParsed.precioUnitario > 0 && !result.isClient) {
            result.isProduct = true;
            result.items.push(productParsed);
            result.detectedTags.push(` ${productParsed.cantidad}x ${productParsed.descripcion} ($${productParsed.precioUnitario.toFixed(2)})`);
        } else if (result.isClient && productParsed && productParsed.precioUnitario > 0) {
            // Caso híbrido: dictó cliente y además un producto al final
            result.isProduct = true;
            result.items.push(productParsed);
            result.detectedTags.push(` ${productParsed.cantidad}x ${productParsed.descripcion} ($${productParsed.precioUnitario.toFixed(2)})`);
        } else if (!result.isClient && !result.isProduct) {
            // Si no tiene prefijos pero no se reconoció nada formal:
            // Si parece un nombre propio simple (2 a 4 palabras sin números)
            if (/^[a-záéíóúñ\s]{4,40}$/i.test(raw) && raw.split(/\s+/).length >= 2 && !raw.includes('a ')) {
                const words = raw.split(/\s+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                result.cliente.nombre = words;
                result.isClient = true;
                result.detectedTags.push(`Nombre: ${words}`);
            } else {
                // Asumir producto genérico
                result.isProduct = true;
                result.items.push(productParsed);
            }
        }

        return result;
    }

    /**
     * Parsea frases de productos como:
     * - "Dos quintales de cacao fino a sesenta dólares"
     * - "3 sacos de arroz a 22.50"
     */
    parseSpokenItem(phrase) {
        let text = phrase.toLowerCase().trim();
        let cantidad = 1;
        let precio = 0;
        let descripcion = phrase;

        // 1. Extraer cantidad al inicio
        const words = text.split(/\s+/);
        if (words.length > 0) {
            const firstWord = words[0];
            if (/^\d+$/.test(firstWord)) {
                cantidad = parseInt(firstWord, 10);
                words.shift();
            } else if (DIGIT_WORDS[firstWord] !== undefined) {
                cantidad = parseInt(DIGIT_WORDS[firstWord], 10);
                words.shift();
            } else if (COMPOUND_NUMBERS[firstWord] !== undefined) {
                cantidad = COMPOUND_NUMBERS[firstWord];
                words.shift();
            }
        }

        text = words.join(' ');

        // 2. Extraer precio al final: "a X dólares" / "a X con Y" / "a X.Y"
        const priceRegex = /\ba\s+(\d+(?:[.,]\d+)?|\w+)(?:\s*(?:con|punto)\s*(\d+|\w+))?(?:\s*(?:d[oó]lares|centavos|ctvs))?$/i;
        const match = text.match(priceRegex);

        if (match) {
            const basePart = match[1];
            const decimalPart = match[2];
            let baseNum = parseFloat(basePart.replace(',', '.'));
            if (isNaN(baseNum) && (DIGIT_WORDS[basePart] !== undefined || COMPOUND_NUMBERS[basePart] !== undefined)) {
                baseNum = DIGIT_WORDS[basePart] ? parseInt(DIGIT_WORDS[basePart], 10) : COMPOUND_NUMBERS[basePart];
            }

            let decNum = 0;
            if (decimalPart) {
                let parsedDec = parseFloat(decimalPart);
                if (isNaN(parsedDec) && (DIGIT_WORDS[decimalPart] !== undefined || COMPOUND_NUMBERS[decimalPart] !== undefined)) {
                    parsedDec = DIGIT_WORDS[decimalPart] ? parseInt(DIGIT_WORDS[decimalPart], 10) : COMPOUND_NUMBERS[decimalPart];
                }
                if (!isNaN(parsedDec)) {
                    decNum = parsedDec < 10 ? parsedDec * 10 : parsedDec;
                }
            }

            if (!isNaN(baseNum)) {
                precio = parseFloat(`${baseNum}.${decNum}`);
                const descIndex = text.indexOf(match[0]);
                if (descIndex > 0) {
                    descripcion = text.substring(0, descIndex).trim();
                }
            }
        } else {
            descripcion = text;
        }

        // Limpiar descripción de palabras accesorias al inicio
        descripcion = descripcion.replace(/^(de|del|para)\s+/i, '');
        // Capitalizar primera letra
        if (descripcion.length > 0) {
            descripcion = descripcion.charAt(0).toUpperCase() + descripcion.slice(1);
        } else {
            descripcion = phrase;
        }

        return {
            cantidad: isNaN(cantidad) || cantidad <= 0 ? 1 : cantidad,
            descripcion: descripcion || 'Producto general',
            precioUnitario: isNaN(precio) || precio < 0 ? 0.00 : precio
        };
    }
}

export const voiceDictation = new VoiceDictationService();
