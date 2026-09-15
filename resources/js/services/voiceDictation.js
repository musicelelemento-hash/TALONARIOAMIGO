/**
 * Servicio: Dictado por Voz en Renglón (Web Speech Recognition API)
 * Principio 9 del Producto: "Onda sonora viva sobre el renglón"
 * Permite a los comerciantes dictar productos con manos libres:
 * Ejemplo: "Dos quintales de maíz a dieciocho con cincuenta" -> { cantidad: 2, descripcion: "Quintales de maíz", precio: 18.50 }
 */

const SPANISH_NUMBERS = {
    'un': 1, 'uno': 1, 'una': 1,
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
    'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9, 'diez': 10,
    'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
    'dieciséis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
    'veinte': 20, 'veintiuno': 21, 'veintidós': 22, 'veinticinco': 25,
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
            try { this.recognition.stop(); } catch (e) {}
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
                const parsed = this.parseSpokenItem(transcript);
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
            if (onError) onError(e);
            return false;
        }
    }

    stop() {
        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        this.isListening = false;
    }

    /**
     * Parsea frases como:
     * - "Dos quintales de cacao fino a sesenta dólares"
     * - "3 sacos de arroz a 22.50"
     * - "Cinco cajas de banano a seis con cincuenta"
     * - "Aceite la favorita a 2 con cincuenta"
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
            } else if (SPANISH_NUMBERS[firstWord] !== undefined) {
                cantidad = SPANISH_NUMBERS[firstWord];
                words.shift();
            }
        }

        text = words.join(' ');

        // 2. Extraer precio al final: "a X dólares" / "a X con Y" / "a X.Y"
        const priceRegex = /\ba\s+(\d+(?:[\.,]\d+)?|\w+)(?:\s*(?:con|punto)\s*(\d+|\w+))?(?:\s*(?:d[oó]lares|centavos|ctvs))?$/i;
        const match = text.match(priceRegex);

        if (match) {
            const basePart = match[1];
            const decimalPart = match[2];
            let baseNum = parseFloat(basePart.replace(',', '.'));
            if (isNaN(baseNum) && SPANISH_NUMBERS[basePart.toLowerCase()] !== undefined) {
                baseNum = SPANISH_NUMBERS[basePart.toLowerCase()];
            }

            let decNum = 0;
            if (decimalPart) {
                let parsedDec = parseFloat(decimalPart);
                if (isNaN(parsedDec) && SPANISH_NUMBERS[decimalPart.toLowerCase()] !== undefined) {
                    parsedDec = SPANISH_NUMBERS[decimalPart.toLowerCase()];
                }
                if (!isNaN(parsedDec)) {
                    decNum = parsedDec < 10 ? parsedDec * 10 : parsedDec;
                }
            }

            if (!isNaN(baseNum)) {
                precio = parseFloat(`${baseNum}.${decNum}`);
                // Recortar la parte del precio de la descripción
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
