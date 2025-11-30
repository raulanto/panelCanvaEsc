<template>
    <div class="flex flex-col h-full relative">
        <!-- Loader superpuesto mientras carga -->
        <div v-if="cargandoTablero" class="absolute inset-0 z-[100] bg-white/80 dark:bg-neutral-950/80 flex flex-col items-center justify-center backdrop-blur-sm">
            <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-primary animate-spin mb-3" />
            <p class="text-sm text-gray-600 dark:text-gray-300 font-medium">Cargando tablero...</p>
        </div>

        <div class="flex flex-col flex-1 max-w-screen mx-auto w-full">
            <!-- Contenedor del Canvas -->
            <div
                ref="contenedorRef"
                class="relative overflow-hidden border flex-1 transition-colors"
                :class="[
                  modoPanActivo
                    ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-950/20'
                    : '',
                  modoDragActivo
                    ? 'border-green-400 bg-green-50/50 dark:bg-green-950/20'
                    : '',
                ]"
                @mousedown="handleMouseDown"
                @mousemove="handleMouseMove"
                @mouseup="handleMouseUp"
                @mouseleave="handleMouseLeave"
                @wheel.prevent="handleWheel"
            >
                <!-- Canvas transformable -->
                <div
                    class="canvas-wrapper absolute inset-0"
                    :style="canvasStyle"
                    :class="obtenerCursorClase"
                >
                    <!-- Grid de fondo infinito -->
                    <div class="absolute pointer-events-none" :style="gridStyle"></div>

                    <!-- CAPA DE GUÍAS -->

                    <!-- 1. Guías de Alineación (Rojas - Snap) -->
                    <template v-for="(guia, i) in alignmentGuides" :key="`align-${i}`">
                        <div
                            class="absolute bg-red-500 z-40 pointer-events-none"
                            :style="{
                                left: guia.type === 'vertical' ? `${guia.pos}px` : `${guia.start}px`,
                                top: guia.type === 'horizontal' ? `${guia.pos}px` : `${guia.start}px`,
                                width: guia.type === 'vertical' ? '1px' : `${guia.length}px`,
                                height: guia.type === 'horizontal' ? '1px' : `${guia.length}px`
                            }"
                        ></div>
                    </template>

                    <!-- 2. Guías de Medición (Azules - Margen) -->
                    <template v-for="(measure, i) in measurementGuides" :key="`measure-${i}`">
                        <div
                            class="absolute flex items-center justify-center z-50 pointer-events-none"
                            :class="measure.type === 'horizontal' ? 'flex-row' : 'flex-col'"
                            :style="{
                                left: `${measure.x}px`,
                                top: `${measure.y}px`,
                                width: measure.type === 'horizontal' ? `${measure.length}px` : '1px',
                                height: measure.type === 'vertical' ? `${measure.length}px` : '1px'
                            }"
                        >
                            <!-- Línea punteada -->
                            <div class="absolute bg-blue-500/50"
                                 :class="measure.type === 'horizontal' ? 'h-px w-full' : 'w-px h-full'"
                            ></div>

                            <!-- Etiqueta de valor -->
                            <div class="relative bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-sm z-10 whitespace-nowrap">
                                {{ measure.value }}px
                            </div>
                        </div>
                    </template>

                    <!-- Paneles -->
                    <Panel
                        v-for="panel in paneles"
                        :key="panel.id"
                        :panel="panel"
                        :drag-enabled="modoDragActivo"
                        @drag-start="(e) => iniciarArrastrePanel(panel, e)"
                        @resize-start="(e) => iniciarRedimensionPanel(panel, e)"
                        @delete="eliminarPanel(panel.id)"
                        @duplicate="duplicarPanel(panel.id)"
                        @update:data="actualizarDataPanel(panel.id, $event)"
                        @open-config="abrirConfigPanel(panel)"
                    />
                </div>

                <!-- Indicador de coordenadas y modos -->
                <div class="absolute bottom-4 left-4 space-y-2 pointer-events-none">
                    <!-- Info del canvas -->
                    <div
                        class="px-3 py-2 bg-black/50 text-white text-xs rounded-lg font-mono"
                    >
                        <div>
                            Canvas: X: {{ Math.round(canvas.x) }}, Y:
                            {{ Math.round(canvas.y) }}
                        </div>
                        <div>Zoom: {{ Math.round(canvas.scale * 100) }}%</div>
                        <div>Paneles: {{ totalPaneles }}</div>
                    </div>

                    <!-- Indicadores de modo -->
                    <div class="flex gap-2">
                        <div
                            v-if="modoPanActivo"
                            class="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-lg font-medium flex items-center gap-1.5 animate-pulse"
                        >
                            <UIcon name="i-heroicons-hand-raised" class="w-4 h-4" />
                            Modo Pan Activo
                        </div>
                        <div
                            v-if="modoDragActivo"
                            class="px-3 py-1.5 bg-green-500 text-white text-xs rounded-lg font-medium flex items-center gap-1.5 animate-pulse"
                        >
                            <UIcon name="i-heroicons-arrows-pointing-out" class="w-4 h-4" />
                            Modo Drag Activo
                        </div>
                    </div>
                </div>

                <div
                    class="p-2 w-fit -mt-2 absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-10 bg-neutral-100/80 dark:bg-neutral-950 rounded-md shadow-md"
                >


                    <DashboardControls
                        :total-paneles="totalPaneles"
                        :zoom="canvas.scale"
                        :modo-pan-activo="modoPanActivo"
                        :modo-drag-activo="modoDragActivo"
                        :mapa-visible="mapaVisible"
                        @add-panel="handleAgregarPanel"
                        @reset-view="resetearVista"
                        @zoom-in="zoomIn"
                        @zoom-out="zoomOut"
                        @clear-all="confirmarLimpiar"
                        @auto-organize="autoOrganizar"
                        @auto-organize-masonry="autoOrganizarPanelesMansory"
                        @toggle-pan="toggleModoPan"
                        @toggle-drag="toggleModoDrag"
                        @toggle-map="toggleMapa"
                    />
                </div>
            </div>
        </div>

        <!-- Minimapa -->
        <MiniMap
            v-if="contenedorRef"
            :paneles="paneles"
            :canvas-x="canvas.x"
            :canvas-y="canvas.y"
            :canvas-scale="canvas.scale"
            :container-width="contenedorRef?.clientWidth || 0"
            :container-height="contenedorRef?.clientHeight || 0"
            :visible="mapaVisible"
            @navigate="navegarDesdeMapa"
            @toggle="toggleMapa"
            @fit-view="ajustarVistaGlobal"
        />

        <!-- Slideovers de configuración -->
        <SlideoverConfigGrafico
            v-if="panelConfigurando?.tipo === 'grafico'"
            v-model="slideoverGraficoAbierto"
            :data="panelConfigurando.data as GraficoData"
            @save="guardarConfigPanel"
        />
        <SlideoverConfigEstadistica
            v-if="panelConfigurando?.tipo === 'estadistica'"
            v-model="slideoverEstadisticaAbierto"
            :data="panelConfigurando.data as EstadisticaData"
            @save="guardarConfigPanel"
        />
        <SlideoverConfigTabla
            v-if="panelConfigurando?.tipo === 'tabla'"
            v-model="slideoverTablaAbierto"
            :data="panelConfigurando.data as TablaData"
            @save="guardarConfigPanel"
        />
    </div>
</template>

<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from "vue";
import {useRoute} from 'vue-router'; // Importar useRoute para leer la URL
import type {
    EstadisticaData,
    GraficoData,
    Panel as PanelInterface,
    PanelData,
    PanelType,
    TablaData
} from "~/types/panel";

import {usePanelManager} from "~/composables/usePanelManager";
import {usePanelDrag} from "~/composables/usePanelDrag";
import {usePanelResize} from "~/composables/usePanelResize";
import {useCanvasPan} from "~/composables/useCanvasPan";
import {usePanelAlignment} from "~/composables/usePanelAlignment";

import Panel from "~/components/Panel.vue";
import DashboardControls from "~/components/Dashboard/DashboardControls.vue";
import MiniMap from "~/components/MiniMap.vue";

import SlideoverConfigGrafico from "~/components/SlideoverConfigGrafico.vue";
import SlideoverConfigEstadistica from "~/components/SlideoverConfigEstadistica.vue";
import SlideoverConfigTabla from "~/components/SlideoverConfigTabla.vue";

const route = useRoute(); // Hook para acceder a la ruta actual
const contenedorRef = ref<HTMLElement | null>(null);
const mapaVisible = ref(true);
const cargandoTablero = ref(false); // Estado de carga

const modoPanActivo = ref(true);
const modoDragActivo = ref(true);

const panelConfigurando = ref<PanelInterface | null>(null);
const slideoverGraficoAbierto = ref(false);
const slideoverEstadisticaAbierto = ref(false);
const slideoverTablaAbierto = ref(false);

const {
    paneles,
    totalPaneles,
    agregarPanel,
    eliminarPanel,
    duplicarPanel,
    actualizarPanel,
    desactivarTodos,
    limpiarTodos,
    autoOrganizarPaneles,
    autoOrganizarMasonry,
    activarPanel,
    importarPaneles // Necesitaremos esta función si existe, o asignamos directamente
} = usePanelManager();

const {
    isDragging,
    iniciarArrastre,
    moverPanel: moverPanelDrag,
    soltarPanel,
} = usePanelDrag();

const {
    isResizing,
    iniciarRedimension,
    redimensionarPanel,
    finalizarRedimension,
} = usePanelResize();

const {
    canvas,
    isPanning,
    iniciarPan,
    moverCanvas,
    detenerPan,
    hacerZoom,
    resetearCanvas,
    ajustarZoomATodos
} = useCanvasPan();

// Nuevo composable de alineación y medición
const {
    alignmentGuides,
    measurementGuides,
    verificarAlineacion,
    limpiarGuias
} = usePanelAlignment();

const canvasStyle = computed(() => ({
    transform: `translate(${canvas.value.x}px, ${canvas.value.y}px) scale(${canvas.value.scale})`,
    transformOrigin: "0 0",
    transition:
        canvas.value.panning || isDragging.value || isResizing.value
            ? "none"
            : "transform 0.3s ease-out",
}));

const gridStyle = computed(() => {
    const size = 50 * canvas.value.scale;
    const offsetX = canvas.value.x % size;
    const offsetY = canvas.value.y % size;

    return {
        backgroundImage: `
            linear-gradient(to right, rgba(200, 200, 200, 0.2) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(200, 200, 200, 0.2) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        width: "10000px",
        height: "10000px",
        left: "-5000px",
        top: "-5000px",
    };
});

const obtenerCursorClase = computed(() => {
    if (canvas.value.panning) return "cursor-grabbing";
    if (isDragging.value || isResizing.value) return "";
    if (modoPanActivo.value && !modoDragActivo.value) return "cursor-grab";
    if (!modoPanActivo.value && modoDragActivo.value) return "cursor-move";
    if (modoPanActivo.value && modoDragActivo.value) return "cursor-grab";
    return "cursor-default";
});

const toggleModoPan = () => {
    modoPanActivo.value = !modoPanActivo.value;
    if (!modoPanActivo.value && canvas.value.panning) {
        detenerPan();
    }
};

const toggleModoDrag = () => {
    modoDragActivo.value = !modoDragActivo.value;
    if (!modoDragActivo.value && isDragging.value) {
        soltarPanel();
    }
};

const toggleMapa = () => {
    mapaVisible.value = !mapaVisible.value;
};

const navegarDesdeMapa = (x: number, y: number) => {
    canvas.value.x = x;
    canvas.value.y = y;
};

const ajustarVistaGlobal = () => {
    if (paneles.value.length === 0 || !contenedorRef.value) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    paneles.value.forEach(p => {
        if (p.posicion.x < minX) minX = p.posicion.x;
        if (p.posicion.y < minY) minY = p.posicion.y;
        if (p.posicion.x + p.tamaño.width > maxX) maxX = p.posicion.x + p.tamaño.width;
        if (p.posicion.y + p.tamaño.height > maxY) maxY = p.posicion.y + p.tamaño.height;
    });
    if (minX === Infinity) return;
    ajustarZoomATodos(minX, minY, maxX, maxY, contenedorRef.value.clientWidth, contenedorRef.value.clientHeight, 50);
};

const cargarTableroDesdeUrl = async () => {
    const boardId = route.query.id as string;

    if (boardId) {
        cargandoTablero.value = true;
        try {

            const { data, error } = await useFetch('/api/myBoards');

            if (data.value && Array.isArray(data.value)) {

                const tableroEncontrado = data.value.find((b: any) => b.id === boardId);

                if (tableroEncontrado && tableroEncontrado.panels) {

                    paneles.value = JSON.parse(JSON.stringify(tableroEncontrado.panels));

                    // Ajustar vista después de cargar
                    setTimeout(() => {
                        ajustarVistaGlobal();
                    }, 100);

                    const toast = useToast();
                    toast.add({
                        title: 'Tablero Cargado',
                        description: `Se cargó "${tableroEncontrado.title}" correctamente.`,
                        icon: 'i-heroicons-check-circle'
                    });
                } else {
                    console.warn(`Tablero con ID ${boardId} no encontrado o sin paneles.`);
                }
            }
        } catch (e) {
            console.error("Error al cargar el tablero:", e);
            const toast = useToast();
            toast.add({
                title: 'Error',
                description: 'No se pudo cargar el tablero.',
                color: 'error',
                icon: 'i-heroicons-exclamation-circle'
            });
        } finally {
            cargandoTablero.value = false;
        }
    } else {

        limpiarTodos();
    }
};

// Event Handlers
const handleMouseDown = (event: MouseEvent) => {
    if (modoPanActivo.value && (event.shiftKey || event.button === 1)) {
        iniciarPan(event);
        return;
    }
    if (modoPanActivo.value && !modoDragActivo.value && event.button === 0) {
        iniciarPan(event);
        return;
    }
    const targetElement = event.target as HTMLElement;
    if (targetElement === contenedorRef.value || targetElement.classList.contains('canvas-wrapper')) {
        if (!isDragging.value && !isResizing.value) {
            desactivarTodos();
        }
    }
};

const handleMouseMove = (event: MouseEvent) => {
    if (canvas.value.panning && modoPanActivo.value) {
        moverCanvas(event);
    } else if (isDragging.value && modoDragActivo.value) {
        // 1. Mover el panel
        moverPanelDrag(event, canvas.value.x, canvas.value.y, canvas.value.scale);

        // 2. Calcular alineación y distancia
        const panelActivo = paneles.value.find(p => p.arrastrando);
        if (panelActivo) {
            const { snapX, snapY } = verificarAlineacion(panelActivo, paneles.value);
            if (snapX !== null) panelActivo.posicion.x = snapX;
            if (snapY !== null) panelActivo.posicion.y = snapY;
        }

    } else if (isResizing.value) {
        redimensionarPanel(event, canvas.value.x, canvas.value.y, canvas.value.scale);
    }
};

const handleMouseUp = () => {
    if (canvas.value.panning) {
        detenerPan();
    } else if (isDragging.value) {
        soltarPanel();
        limpiarGuias(); // Limpiar guías al soltar
    } else if (isResizing.value) {
        finalizarRedimension();
    }
};

const handleMouseLeave = () => {
    handleMouseUp();
};

const handleWheel = (event: WheelEvent) => {
    if (!contenedorRef.value) return;
    const rect = contenedorRef.value.getBoundingClientRect();
    const centerX = event.clientX - rect.left;
    const centerY = event.clientY - rect.top;
    hacerZoom(event.deltaY, centerX, centerY);
};

const iniciarArrastrePanel = (panel: PanelInterface, event: MouseEvent) => {
    if (!modoDragActivo.value) return;
    activarPanel(panel.id);
    iniciarArrastre(panel, event, canvas.value.x, canvas.value.y, canvas.value.scale);
};

const iniciarRedimensionPanel = (panel: PanelInterface, event: MouseEvent) => {
    iniciarRedimension(panel, event, canvas.value.x, canvas.value.y, canvas.value.scale);
    activarPanel(panel.id);
};

const actualizarDataPanel = (panelId: string, nuevaData: PanelData) => {
    const panel = paneles.value.find((p) => p.id === panelId);
    if (panel) {
        actualizarPanel(panelId, { data: nuevaData });
    }
};

const abrirConfigPanel = (panel: PanelInterface) => {
    panelConfigurando.value = panel;
    switch (panel.tipo) {
        case 'grafico': slideoverGraficoAbierto.value = true; break;
        case 'estadistica': slideoverEstadisticaAbierto.value = true; break;
        case 'tabla': slideoverTablaAbierto.value = true; break;
    }
};

const guardarConfigPanel = (nuevaData: PanelData) => {
    if (panelConfigurando.value) {
        actualizarDataPanel(panelConfigurando.value.id, nuevaData);
        panelConfigurando.value = null;
    }
}

const handleAgregarPanel = (tipo: PanelType) => {
    if (!contenedorRef.value) return;
    const rect = contenedorRef.value.getBoundingClientRect();
    const nuevoPanel = agregarPanel(tipo, rect.width, rect.height, canvas.value.x, canvas.value.y);
    if ((tipo === 'grafico' || tipo === 'tabla' || tipo === 'estadistica') && nuevoPanel) {
        setTimeout(() => abrirConfigPanel(nuevoPanel), 100);
    }
};

const zoomIn = () => {
    if (!contenedorRef.value) return;
    const rect = contenedorRef.value.getBoundingClientRect();
    hacerZoom(-100, rect.width / 2, rect.height / 2);
};

const zoomOut = () => {
    if (!contenedorRef.value) return;
    const rect = contenedorRef.value.getBoundingClientRect();
    hacerZoom(100, rect.width / 2, rect.height / 2);
};

const resetearVista = () => resetearCanvas();
const confirmarLimpiar = () => limpiarTodos();
const autoOrganizar = () => { autoOrganizarPaneles(); resetearCanvas(); };
const autoOrganizarPanelesMansory = () => { autoOrganizarMasonry(); resetearCanvas(); };

onMounted(() => {
    // Intentar cargar tablero si hay ID en la URL
    cargarTableroDesdeUrl();

    document.addEventListener("mousedown", (e) => {
        if (e.button === 1) e.preventDefault();
    });
});

onBeforeUnmount(() => {
    handleMouseUp();
});
</script>

<style scoped>
.canvas-wrapper {
    will-change: transform;
}
.canvas-wrapper * {
    user-select: none;
    -webkit-user-select: none;
}
@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
}
.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>