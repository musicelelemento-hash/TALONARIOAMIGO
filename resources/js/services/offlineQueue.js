/**
 * Servicio: Cola de Contingencia Offline Rural (Talonario Sin Señal)
 * Garantiza la emisión continua en ferias, mercados o fincas sin cobertura celular.
 * Guarda localmente y sincroniza automáticamente al recuperar conexión a internet.
 */

class OfflineQueueService {
    constructor() {
        this.storageKey = 'ta_offline_invoices_queue';
        this.listeners = [];
        this.initAutoSync();
    }

    isOnline() {
        return typeof navigator !== 'undefined' ? navigator.onLine : true;
    }

    getQueue() {
        try {
            const raw = localStorage.getItem(this.storageKey);
            return raw ? JSON.parse(raw) : [];
        } catch (_e) {
            return [];
        }
    }

    saveQueue(queue) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(queue));
            this.notifyListeners(queue.length);
        } catch (e) {
            console.warn('Error saving offline queue', e);
        }
    }

    enqueue(receiptPayload) {
        const queue = this.getQueue();
        const queuedItem = {
            ...receiptPayload,
            offline_timestamp: new Date().toISOString(),
            id: 'offline-' + Date.now()
        };
        queue.push(queuedItem);
        this.saveQueue(queue);
        return queuedItem;
    }

    getPendingCount() {
        return this.getQueue().length;
    }

    onQueueChange(fn) {
        this.listeners.push(fn);
    }

    notifyListeners(count) {
        this.listeners.forEach((fn) => {
            try {
                fn(count);
            } catch (_e) {
                // listener error ignored
            }
        });
    }

    initAutoSync() {
        if (typeof window === 'undefined') return;
        window.addEventListener('online', () => {
            console.log('📡 Red detectada: Intentando sincronizar cola offline de Talonario Amigo...');
            this.syncQueue();
        });
    }

    async syncQueue(apiService) {
        const queue = this.getQueue();
        if (!queue.length) return { synced: 0, failed: 0 };

        let syncedCount = 0;
        const remaining = [];

        for (const item of queue) {
            try {
                if (apiService && typeof apiService.emitirFactura === 'function') {
                    await apiService.emitirFactura(item);
                }
                syncedCount++;
            } catch (e) {
                console.warn('Reintento fallido para comprobante offline', e);
                remaining.push(item);
            }
        }

        this.saveQueue(remaining);
        return { synced: syncedCount, remaining: remaining.length };
    }
}

export const offlineQueue = new OfflineQueueService();
