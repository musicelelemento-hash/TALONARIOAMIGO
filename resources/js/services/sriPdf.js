/**
 * Servicio: extracción de datos desde el Certificado de RUC del SRI (PDF).
 * Adaptado de santiagocordova-main/services/pdfExtraction.ts
 * Se usa para CONFIGURAR EL FACTURADOR (emisor): al subir el certificado oficial
 * se autocompletan RUC, razón social, dirección, régimen (RIMPE) y establecimientos.
 */
import * as pdfjsLib from 'pdfjs-dist';

const pdfjsVersion = pdfjsLib.version || '5.4.530';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.mjs`;

/**
 * @param {File} file - Certificado de RUC (PDF del SRI)
 * @returns {Promise<object>} SriExtractionResult
 */
export async function extractDataFromSriPdf(file) {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        let fullText = '';
        const maxPages = Math.min(pdf.numPages, 2);
        for (let i = 1; i <= maxPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' | ');
            fullText += pageText + ' | ';
        }

        const cleanText = fullText.toUpperCase().replace(/\s+/g, ' ').replace(/\|\s*\|/g, '|');
        const textOnly = cleanText.replace(/\|/g, ' ').replace(/\s+/g, ' ');

        // 1. RUC
        const rucMatch = cleanText.match(/N[ÚU]MERO RUC\s*[:|]?\s*(\d{13})/) || cleanText.match(/\b(\d{10}001)\b/);
        const ruc = rucMatch ? rucMatch[1] : '';

        // 2. Nombre (búsqueda inversa de tokens previos al RUC)
        let nombres = '';
        const parts = cleanText.split('|').map((p) => p.trim()).filter((p) => p.length > 0);
        const rucIndex = parts.findIndex((p) => p.includes(ruc));
        if (rucIndex > 0) {
            const nameParts = [];
            for (let i = 1; i <= 6; i++) {
                const candidate = parts[rucIndex - i];
                if (!candidate) continue;
                const isLabel = candidate.includes('NÚMERO') || candidate.includes('APELLIDOS') ||
                    candidate.includes('NOMBRES') || candidate.includes('CERTIFICADO') ||
                    candidate.includes('REGISTRO') || candidate.includes('IDENTIFICACIÓN') ||
                    candidate.length < 3;
                if (!isLabel) nameParts.unshift(candidate);
                else if (nameParts.length > 0) break;
            }
            nombres = nameParts.join(' ');
        }

        // 3. Dirección / Ubicación
        const provinciaM = textOnly.match(/PROVINCIA:\s*([^:]+?)(?=\s*(?:CANT[ÓO]N|PARROQUIA|DIRECCI|UBICACI|REFERENCIA|MEDIOS))/);
        const cantonM = textOnly.match(/CANT[ÓO]N:\s*([^:]+?)(?=\s*(?:PROVINCIA|PARROQUIA|DIRECCI|UBICACI|REFERENCIA|MEDIOS))/);
        const parroquiaM = textOnly.match(/PARROQUIA:\s*([^:]+?)(?=\s*(?:PROVINCIA|CANT[ÓO]N|DIRECCI|UBICACI|REFERENCIA|MEDIOS))/);
        const referenciaM = textOnly.match(/REFERENCIA:\s*([^:]+?)(?=\s*(?:DIRECCI[ÓO]N|UBICACI[ÓO]N|MEDIOS|EMAIL|CELULAR|ACTIVIDADES|ESTABLECIMIENTOS|$))/);
        const geoParts = [];
        if (provinciaM && provinciaM[1].trim()) geoParts.push(provinciaM[1].trim());
        if (cantonM && cantonM[1].trim()) geoParts.push(cantonM[1].trim());
        if (parroquiaM && parroquiaM[1].trim()) geoParts.push(parroquiaM[1].trim());
        const direccionFinal = [
            geoParts.length > 0 ? `Ubicación: ${geoParts.join(' / ')}` : '',
            (referenciaM && referenciaM[1].trim()) ? `Ref: ${referenciaM[1].trim()}` : '',
        ].filter(Boolean).join(' - ');

        // 4. Contactos
        const emailMatch = cleanText.match(/[\w\.-]+@[\w\.-]+\.\w{2,}/g);
        const validEmail = emailMatch ? emailMatch.find((e) => !e.includes('sri.gob.ec')) : '';
        const phoneMatch = textOnly.match(/(?:CELULAR|TELEFONO|TELF)[^0-9]*(\d{9,10})/);
        const validPhone = phoneMatch ? phoneMatch[1] : (textOnly.match(/\b09\d{8}\b/) ? textOnly.match(/\b09\d{8}\b/)[0] : '');

        // 5. Régimen / Obligaciones
        let regimen = 'General';
        if (textOnly.includes('NEGOCIO POPULAR')) regimen = 'RIMPE Negocio Popular';
        else if (textOnly.includes('RIMPE') && textOnly.includes('EMPRENDEDOR')) regimen = 'RIMPE Emprendedor';
        const listaObligaciones = [];
        if (textOnly.includes('DECLARACION DE IVA')) listaObligaciones.push('IVA');
        if (textOnly.includes('RENTA')) listaObligaciones.push('Impuesto a la Renta');

        // 6. Actividad / artesano / establecimientos
        const actividad = textOnly.match(/ACTIVIDADES ECONÓMICAS\s*([^:]+?)(?=\s*(?:ESTABLECIMIENTOS|OBLIGACIONES|$))/)?.[1]?.trim() || '';
        const esArtesano = textOnly.includes('ARTESANO') && !textOnly.includes('NO REGISTRA');
        const cantidadEstablecimientos = parseInt(textOnly.match(/ESTABLECIMIENTOS\s*ABIERTOS\s*(\d+)/)?.[1] || '1', 10);
        const isCertificate = textOnly.includes('CERTIFICADO DE RUC') ||
            textOnly.includes('REGISTRO UNICO DE CONTRIBUYENTES') ||
            textOnly.includes('REGISTRO ÚNICO DE CONTRIBUYENTES') ||
            (ruc.length === 13 && textOnly.includes('OBLIGACIONES TRIBUTARIAS'));

        return {
            apellidos_nombres: nombres || 'CONTRIBUYENTE',
            ruc,
            direccion: direccionFinal || 'Dirección no detectada',
            contacto: { email: validEmail || '', celular: validPhone || '' },
            regimen,
            obligaciones_tributarias: textOnly.includes('SEMESTRAL') ? 'semestral' : 'mensual',
            lista_obligaciones: listaObligaciones,
            actividad_economica: actividad,
            es_artesano: esArtesano,
            cantidad_establecimientos,
            isCertificate,
        };
    } catch (error) {
        console.error('Error en extracción PDF:', error);
        throw new Error('No se pudo procesar el PDF.');
    }
}
