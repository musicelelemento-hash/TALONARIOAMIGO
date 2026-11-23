/**
 * Componente: Talonario3DExperience
 * -------------------------------------------------------------
 * Motor WebGL 3D (Three.js) para el Talonario de Papel Físico Autocopiativo.
 * Cumple con el Principio 3.6 de VISION_MAESTRA.md:
 * "El momento 3D / realismo: donde el talonario se puede girar, abrir
 *  y despegar el autocopiativo con física táctil a 60 FPS."
 */

import * as THREE from 'three';
import { soundFx } from '../services/soundFx.js';

export class Talonario3DExperience {
    constructor(containerElement, options = {}) {
        this.container = containerElement;
        this.options = {
            docNumber: options.docNumber || '000000126',
            nombreEmisor: options.nombreEmisor || 'ABARROTES & BODEGA CENTRAL',
            rucEmisor: options.rucEmisor || '0706482023001',
            regimen: options.regimen || 'CONTRIBUYENTE NEGOCIO POPULAR - RÉGIMEN RIMPE',
            clienteNombre: options.clienteNombre || 'CONSUMIDOR FINAL',
            total: options.total || '$12.50',
            onTearComplete: options.onTearComplete || null,
            ...options
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.blocGroup = null;
        this.topSheetMesh = null;
        this.blueCopyMesh = null;
        this.baseStackMesh = null;
        this.animationId = null;

        // Interaction state
        this.isDragging = false;
        this.previousPointerPosition = { x: 0, y: 0 };
        this.targetRotation = { x: 0.18, y: -0.15 };
        this.currentRotation = { x: 0.18, y: -0.15 };
        this.isTorn = false;
        this.isTearing = false;
        this.tearProgress = 0;

        this.init();
    }

    init() {
        if (!this.container) return;

        // Clean any existing canvas
        this.container.innerHTML = '';

        const width = this.container.clientWidth || 600;
        const height = this.container.clientHeight || 520;

        // 1. Scene
        this.scene = new THREE.Scene();

        // 2. Camera
        this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 5.2);

        // 3. Renderer with ACES Filmic Tone Mapping
        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.25;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);

        // 4. Lighting (Warm Stationery Desk Setup)
        this.setupLighting();

        // 5. Build 3D Physical Bloc
        this.buildTalonarioBloc();

        // 6. Event Listeners
        this.setupInteractions();

        // 7. Start Render Loop
        this.animate = this.animate.bind(this);
        this.animate();
    }

    setupLighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xfff6ea, 0.85);
        this.scene.add(ambientLight);

        // Key Light (Warm desk lamp from top-right)
        const keyLight = new THREE.DirectionalLight(0xfffaed, 2.0);
        keyLight.position.set(4, 5, 4);
        keyLight.castShadow = true;
        keyLight.shadow.mapSize.width = 1024;
        keyLight.shadow.mapSize.height = 1024;
        keyLight.shadow.bias = -0.0005;
        this.scene.add(keyLight);

        // Fill Light (Soft cool navy bounce from bottom-left)
        const fillLight = new THREE.DirectionalLight(0xbfdbfe, 0.6);
        fillLight.position.set(-4, -2, 2);
        this.scene.add(fillLight);

        // Subtle Gold Accent Light
        const goldAccent = new THREE.PointLight(0xc9a96e, 8, 12);
        goldAccent.position.set(0, 2.5, 2);
        this.scene.add(goldAccent);
    }

    // ─── TEXTURE GENERATOR: PROCEDURAL INVOICE CANVAS ────────────────────────
    createPaperTexture(isBlueCopy = false) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        const bgColor = isBlueCopy ? '#EBF3FF' : '#FCFBF6';
        const inkColor = isBlueCopy ? '#1D4ED8' : '#1B2D4F';
        const lineRuleColor = isBlueCopy ? '#BFDBFE' : '#E2E8F0';

        // 1. Base Paper Color
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Subtle Paper Fiber Grain
        ctx.fillStyle = isBlueCopy ? 'rgba(29, 78, 216, 0.02)' : 'rgba(0, 0, 0, 0.02)';
        for (let i = 0; i < 4000; i++) {
            const rx = Math.random() * canvas.width;
            const ry = Math.random() * canvas.height;
            ctx.fillRect(rx, ry, Math.random() * 2 + 1, 1);
        }

        // 3. Brown Gummed Top Spine (Lomo Engomado)
        ctx.fillStyle = '#4A2E1B';
        ctx.fillRect(0, 0, canvas.width, 90);

        // Stitching / Perforation line
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.setLineDash([12, 10]);
        ctx.beginPath();
        ctx.moveTo(30, 95);
        ctx.lineTo(canvas.width - 30, 95);
        ctx.stroke();
        ctx.setLineDash([]);

        // 4. Header Section
        ctx.fillStyle = inkColor;
        ctx.font = 'bold 34px "Outfit", sans-serif';
        ctx.fillText(this.options.nombreEmisor.toUpperCase(), 50, 160);

        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.fillStyle = isBlueCopy ? '#2563EB' : '#16A34A';
        ctx.fillText(this.options.regimen, 50, 195);

        // RUC & Document Box (Right side)
        ctx.strokeStyle = inkColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(620, 120, 350, 140);

        ctx.font = 'bold 22px "JetBrains Mono", monospace';
        ctx.fillStyle = inkColor;
        ctx.fillText(`R.U.C. ${this.options.rucEmisor}`, 640, 160);

        ctx.fillStyle = isBlueCopy ? '#1D4ED8' : '#0F172A';
        ctx.fillRect(620, 175, 350, 36);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 18px "Outfit", sans-serif';
        ctx.fillText(isBlueCopy ? 'TU COPIA' : 'FACTURA ELECTRÓNICA', 645, 200);

        ctx.font = 'bold 28px "JetBrains Mono", monospace';
        ctx.fillStyle = '#D62828';
        ctx.fillText(`N° ${this.options.docNumber}`, 640, 246);

        // 5. Client Information Fields
        ctx.font = 'bold 20px "Outfit", sans-serif';
        ctx.fillStyle = inkColor;
        ctx.fillText('CLIENTE: ' + this.options.clienteNombre, 50, 310);
        ctx.fillText('FECHA: ' + new Date().toLocaleDateString('es-EC'), 50, 350);

        // Blue rule lines
        ctx.strokeStyle = lineRuleColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(50, 320);
        ctx.lineTo(970, 320);
        ctx.moveTo(50, 360);
        ctx.lineTo(970, 360);
        ctx.stroke();

        // 6. Items Table Lines
        const tableY = 410;
        ctx.fillStyle = isBlueCopy ? '#DBEAFE' : '#F1F5F9';
        ctx.fillRect(50, tableY, 920, 40);

        ctx.fillStyle = inkColor;
        ctx.font = 'bold 18px "Outfit", sans-serif';
        ctx.fillText('CANT.', 70, tableY + 26);
        ctx.fillText('DESCRIPCIÓN', 200, tableY + 26);
        ctx.fillText('P. UNIT.', 720, tableY + 26);
        ctx.fillText('TOTAL', 860, tableY + 26);

        // Simulated Lines
        for (let row = 0; row < 8; row++) {
            const y = tableY + 80 + row * 60;
            ctx.strokeStyle = lineRuleColor;
            ctx.strokeRect(50, y - 35, 920, 50);

            if (row === 0) {
                ctx.font = '26px "Caveat", cursive';
                ctx.fillStyle = inkColor;
                ctx.fillText('1', 85, y);
                ctx.fillText('Productos de Tienda & Consumo', 200, y);
                ctx.fillText('12.50', 740, y);
                ctx.fillText('12.50', 870, y);
            }
        }

        // 7. Total Box
        const bottomY = 1100;
        ctx.fillStyle = inkColor;
        ctx.font = 'bold 24px "JetBrains Mono", monospace';
        ctx.fillText('TOTAL A PAGAR:', 580, bottomY);
        ctx.font = 'bold 36px "JetBrains Mono", monospace';
        ctx.fillStyle = isBlueCopy ? '#1E40AF' : '#16A34A';
        ctx.fillText(this.options.total, 820, bottomY);

        // 8. Watermark on Blue Copy
        if (isBlueCopy) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2 + 100);
            ctx.rotate(-Math.PI / 6);
            ctx.font = 'bold 72px "Outfit", sans-serif';
            ctx.fillStyle = 'rgba(29, 78, 216, 0.12)';
            ctx.textAlign = 'center';
            ctx.fillText('DUPLICADO — EMISOR', 0, 0);
            ctx.restore();

            // Official Authorized SRI Stamp (Green rubber stamp)
            ctx.save();
            ctx.translate(720, 920);
            ctx.rotate(0.08);
            ctx.strokeStyle = '#16A34A';
            ctx.lineWidth = 5;
            ctx.strokeRect(-180, -45, 360, 90);
            ctx.font = 'bold 28px "Special Elite", monospace';
            ctx.fillStyle = '#16A34A';
            ctx.textAlign = 'center';
            ctx.fillText('✓ AUTORIZADO SRI', 0, -8);
            ctx.font = '16px "JetBrains Mono", monospace';
            ctx.fillText('CLAVE: 2807202601...', 0, 24);
            ctx.restore();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        return texture;
    }

    buildTalonarioBloc() {
        this.blocGroup = new THREE.Group();

        const sheetWidth = 2.4;
        const sheetHeight = 3.35;
        const stackThickness = 0.18; // Grosor de 50 hojas apiladas

        // A. Base Cardboard Backing (Cartón Kraft Base del Talonario)
        const baseGeometry = new THREE.BoxGeometry(sheetWidth + 0.04, sheetHeight + 0.04, 0.03);
        const baseMaterial = new THREE.MeshStandardMaterial({
            color: 0x6e5d4f,
            roughness: 0.9,
            metalness: 0.05
        });
        const baseBacking = new THREE.Mesh(baseGeometry, baseMaterial);
        baseBacking.position.z = -stackThickness / 2 - 0.015;
        baseBacking.receiveShadow = true;
        this.blocGroup.add(baseBacking);

        // B. Stack Sides (Estratificación de 50 hojas apiladas)
        const stackGeometry = new THREE.BoxGeometry(sheetWidth, sheetHeight, stackThickness);
        const stackMaterial = new THREE.MeshStandardMaterial({
            color: 0xf5f3eb,
            roughness: 0.85,
            metalness: 0.02
        });
        this.baseStackMesh = new THREE.Mesh(stackGeometry, stackMaterial);
        this.baseStackMesh.castShadow = true;
        this.baseStackMesh.receiveShadow = true;
        this.blocGroup.add(this.baseStackMesh);

        // C. Hoja Azul Autocopiativa (Directamente debajo de la hoja superior)
        const blueTexture = this.createPaperTexture(true);
        const blueGeometry = new THREE.PlaneGeometry(sheetWidth, sheetHeight, 16, 16);
        const blueMaterial = new THREE.MeshStandardMaterial({
            map: blueTexture,
            roughness: 0.75,
            metalness: 0.05,
            side: THREE.DoubleSide
        });
        this.blueCopyMesh = new THREE.Mesh(blueGeometry, blueMaterial);
        this.blueCopyMesh.position.z = stackThickness / 2 + 0.002;
        this.blueCopyMesh.receiveShadow = true;
        this.blocGroup.add(this.blueCopyMesh);

        // D. Hoja Superior Marfil Protagonista (Con deformación física de desprendimiento)
        const ivoryTexture = this.createPaperTexture(false);
        const ivoryGeometry = new THREE.PlaneGeometry(sheetWidth, sheetHeight, 32, 32);
        const ivoryMaterial = new THREE.MeshStandardMaterial({
            map: ivoryTexture,
            roughness: 0.8,
            metalness: 0.03,
            side: THREE.DoubleSide
        });
        this.topSheetMesh = new THREE.Mesh(ivoryGeometry, ivoryMaterial);
        this.topSheetMesh.position.z = stackThickness / 2 + 0.005;
        this.topSheetMesh.castShadow = true;
        this.topSheetMesh.receiveShadow = true;
        this.blocGroup.add(this.topSheetMesh);

        // E. Lomo Engomado Café Superior 3D (Cinta de encuadernado)
        const spineGeo = new THREE.BoxGeometry(sheetWidth + 0.02, 0.28, stackThickness + 0.03);
        const spineMat = new THREE.MeshStandardMaterial({
            color: 0x4a2e1b,
            roughness: 0.6,
            metalness: 0.1
        });
        const spineMesh = new THREE.Mesh(spineGeo, spineMat);
        spineMesh.position.set(0, sheetHeight / 2 - 0.12, 0);
        spineMesh.castShadow = true;
        this.blocGroup.add(spineMesh);

        this.scene.add(this.blocGroup);
    }

    setupInteractions() {
        const dom = this.renderer.domElement;

        const onPointerDown = (e) => {
            this.isDragging = true;
            this.previousPointerPosition = {
                x: e.clientX || (e.touches && e.touches[0].clientX) || 0,
                y: e.clientY || (e.touches && e.touches[0].clientY) || 0
            };
        };

        const onPointerMove = (e) => {
            if (!this.isDragging) return;

            const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;

            const deltaX = clientX - this.previousPointerPosition.x;
            const deltaY = clientY - this.previousPointerPosition.y;

            this.targetRotation.y += deltaX * 0.008;
            this.targetRotation.x += deltaY * 0.008;

            // Clamping vertical tilt so the bloc stays readable
            this.targetRotation.x = Math.max(-0.6, Math.min(0.6, this.targetRotation.x));
            this.targetRotation.y = Math.max(-1.2, Math.min(1.2, this.targetRotation.y));

            this.previousPointerPosition = { x: clientX, y: clientY };
        };

        const onPointerUp = () => {
            this.isDragging = false;
        };

        dom.addEventListener('mousedown', onPointerDown);
        window.addEventListener('mousemove', onPointerMove);
        window.addEventListener('mouseup', onPointerUp);

        dom.addEventListener('touchstart', onPointerDown, { passive: true });
        window.addEventListener('touchmove', onPointerMove, { passive: true });
        window.addEventListener('touchend', onPointerUp);

        // Window resize handler
        window.addEventListener('resize', () => {
            if (!this.container || !this.renderer || !this.camera) return;
            const w = this.container.clientWidth;
            const h = this.container.clientHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
        });
    }

    // ─── ACCIÓN: DESPRENDIMIENTO FÍSICO 3D (TEAR & CURL ANIMATION) ───────────
    tearSheet() {
        if (this.isTearing || this.isTorn) return;
        this.isTearing = true;
        this.tearProgress = 0;

        // Sonido de rasgado analógico Web Audio
        soundFx.playPaperTear();

        const startTime = performance.now();
        const duration = 1200; // 1.2 segundos de animación fluida

        const animateTear = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            this.tearProgress = progress;

            // Deformación física de la hoja marfil (Curl hacia arriba y rotación)
            if (this.topSheetMesh) {
                // Elevación en Z y desplazamiento hacia la derecha
                this.topSheetMesh.position.z = 0.09 + progress * 0.8;
                this.topSheetMesh.position.x = progress * 0.45;
                this.topSheetMesh.position.y = -progress * 0.25;

                // Rotación de giro como una hoja al vuelo
                this.topSheetMesh.rotation.z = -progress * 0.45;
                this.topSheetMesh.rotation.y = -progress * 0.6;
                this.topSheetMesh.rotation.x = progress * 0.35;

                // Reducción de opacidad al final
                if (progress > 0.75) {
                    this.topSheetMesh.material.opacity = 1 - (progress - 0.75) * 4;
                    this.topSheetMesh.material.transparent = true;
                }
            }

            if (progress < 1) {
                requestAnimationFrame(animateTear);
            } else {
                this.isTearing = false;
                this.isTorn = true;
                if (this.topSheetMesh) {
                    this.topSheetMesh.visible = false;
                }

                // Sello de autorización SRI estampado con sonido CLACK
                soundFx.playStamp();

                if (this.options.onTearComplete) {
                    this.options.onTearComplete();
                }
            }
        };

        requestAnimationFrame(animateTear);
    }

    // ─── ACCIÓN: PASAR A NUEVA HOJA ──────────────────────────────────────────
    resetSheet(nextDocNumber = null) {
        if (nextDocNumber) {
            this.options.docNumber = nextDocNumber;
        }

        if (this.topSheetMesh) {
            this.topSheetMesh.position.set(0, 0, 0.095);
            this.topSheetMesh.rotation.set(0, 0, 0);
            this.topSheetMesh.material.opacity = 1.0;
            this.topSheetMesh.material.transparent = false;
            this.topSheetMesh.material.map = this.createPaperTexture(false);
            this.topSheetMesh.visible = true;
        }

        this.isTorn = false;
        this.isTearing = false;
        this.tearProgress = 0;

        soundFx.playPaperSlide();
    }

    // ─── CENTRAR VISTA FRONTAL ───────────────────────────────────────────────
    resetCamera() {
        this.targetRotation = { x: 0.18, y: -0.15 };
    }

    animate() {
        this.animationId = requestAnimationFrame(this.animate);

        // LERP Smooth Rotation
        this.currentRotation.x += (this.targetRotation.x - this.currentRotation.x) * 0.08;
        this.currentRotation.y += (this.targetRotation.y - this.currentRotation.y) * 0.08;

        if (this.blocGroup) {
            this.blocGroup.rotation.x = this.currentRotation.x;
            this.blocGroup.rotation.y = this.currentRotation.y;
        }

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
            this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
        }
    }
}
