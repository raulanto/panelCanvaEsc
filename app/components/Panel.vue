<template>
    <div
        :style="panelStyle"
        class="panel-flotante absolute   "
        :class="[
            panel.arrastrando ? 'cursor-grabbing' : '',
            panel.redimensionando ? 'select-none' : ''
            ]"
    >
        <UCard :ui="{
                root: 'rounded-lg overflow-hidden hover:shadow-lg transition-shadow h-full relative',
                header: 'p-2 sm:px-3',
                body: 'p-0 sm:p-0',
        }"
               @mousedown="handleDragStart"
               @mouseenter="mostrarControles = true"
               @mouseleave="mostrarControles = false"
               spotlight
               spotlight-color="primary"
        >


            <div
                class="p-4 overflow-auto"
                :style="{ height: `calc(${panel.tamaño.height}px)` }"
            >
                <!-- Renderizado dinámico de componentes -->
                <component
                    :is="componentePanel"
                    :data="panel.data"
                    @update:contenido="actualizarContenido"
                    @open-config="$emit('open-config')"
                />
            </div>
            <!-- Handle para redimensionar -->
            <div
                v-if="dragEnabled"
                class="resize-handle absolute bottom-1 right-1 w-6 h-6 cursor-nwse-resize transition-all rounded-sm flex items-center justify-center shadow-sm"
                :class="[panel.redimensionando ? 'opacity-100 scale-110' : 'opacity-50 hover:opacity-100',
                limites.enMaxWidth && limites.enMaxHeight ? 'bg-red-500/40 ring-2 ring-red-500' : limites.enMinWidth && limites.enMinHeight
                ? 'bg-yellow-500/40 ring-2 ring-yellow-500' : 'bg-primary/30 hover:bg-primary/50']"
                @mousedown.stop="$emit('resize-start', $event)"
            >
                <UIcon
                    name="i-heroicons-arrows-pointing-out"
                    class="w-3.5 h-3.5"
                    :class="[limites.enMaxWidth && limites.enMaxHeight ? 'text-red-600 dark:text-red-400'
                    : limites.enMinWidth && limites.enMinHeight
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-primary'
                    ]"
                />
            </div>
        </UCard>


        <transition name="slide-fade">
            <UFieldGroup
                orientation="vertical"
                @mouseenter="mostrarControles = true"
                @mouseleave="mostrarControles = false"
                v-if="mostrarControles && dragEnabled"
                class="controles-panel absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full mr-4 z-50"
            >

                    <UTooltip text="Configurar" placement="left">
                        <UButton @click.stop="$emit('open-config')" color="neutral" variant="outline">
                            <UIcon name="i-heroicons-cog-6-tooth" />
                        </UButton>
                    </UTooltip>

                    <UTooltip text="Duplicar" placement="left">
                        <UButton @click.stop="$emit('duplicate')" color="neutral" variant="outline">
                            <UIcon name="i-heroicons-document-duplicate"/>
                        </UButton>
                    </UTooltip>

                    <UTooltip text="Eliminar" placement="left">
                        <UButton @click.stop="$emit('delete')" color="error" variant="outline">
                            <UIcon name="i-heroicons-trash"/>
                        </UButton>
                    </UTooltip>

            </UFieldGroup>
        </transition>
        <!-- Indicadores de límite en los bordes -->
        <div
            v-if="panel.redimensionando"
            class="absolute inset-0 pointer-events-none"
        >
            <!-- Borde derecho (límite de ancho máximo) -->
            <div
                v-if="limites.enMaxWidth"
                class="absolute top-0 right-0 bottom-0 w-1 bg-red-500 animate-pulse-border"
            >
                <div class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                    <div class="px-2 py-1 bg-red-500 text-white text-xs rounded-r font-medium whitespace-nowrap">
                        Máx: {{ obtenerPreset().maxWidth }}px
                    </div>
                </div>
            </div>

            <!-- Borde izquierdo (límite de ancho mínimo) -->
            <div
                v-if="limites.enMinWidth"
                class="absolute top-0 left-0 bottom-0 w-1 bg-yellow-500 animate-pulse-border"
            >
                <div class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                    <div class="px-2 py-1 bg-yellow-500 text-white text-xs rounded-l font-medium whitespace-nowrap">
                        Mín: {{ obtenerPreset().minWidth }}px
                    </div>
                </div>
            </div>

            <!-- Borde inferior (límite de altura máxima) -->
            <div
                v-if="limites.enMaxHeight"
                class="absolute bottom-0 left-0 right-0 h-1 bg-red-500 animate-pulse-border"
            >
                <div class="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                    <div class="px-2 py-1 bg-red-500 text-white text-xs rounded-b font-medium whitespace-nowrap">
                        Máx: {{ obtenerPreset().maxHeight }}px
                    </div>
                </div>
            </div>

            <!-- Borde superior (límite de altura mínima) -->
            <div
                v-if="limites.enMinHeight"
                class="absolute top-0 left-0 right-0 h-1 bg-yellow-500 animate-pulse-border"
            >
                <div class="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                    <div class="px-2 py-1 bg-yellow-500 text-white text-xs rounded-t font-medium whitespace-nowrap">
                        Mín: {{ obtenerPreset().minHeight }}px
                    </div>
                </div>
            </div>
        </div>


    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {Panel} from '~/types/panel'
import {PANEL_SIZE_PRESETS} from '~/types/panel'
import PanelEstadistica from '~/components/panels/PanelEstadistica.vue'
import PanelGrafico from '~/components/panels/PanelGrafico.vue'
import PanelLista from '~/components/panels/PanelLista.vue'
import PanelTabla from '~/components/panels/PanelTabla.vue'
import PanelCalendario from '~/components/panels/PanelCalendario.vue'
import PanelMapa from '~/components/panels/PanelMapa.vue'
import PanelNotas from '~/components/panels/PanelNotas.vue'

interface Props {
    panel: Panel
    dragEnabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    dragEnabled: true
})
const mostrarControles = ref(false)

const emit = defineEmits<{
    'drag-start': [event: MouseEvent]
    'resize-start': [event: MouseEvent]
    'delete': []
    'duplicate': []
    'update:data': [data: any]
    'open-config': []
}>()

// Mapeo de tipos a componentes
const componentesMap: Record<string, any> = {
    estadistica: PanelEstadistica,
    grafico: PanelGrafico,
    lista: PanelLista,
    tabla: PanelTabla,
    calendario: PanelCalendario,
    mapa: PanelMapa,
    notas: PanelNotas
}

// Componente por defecto
const ComponenteDefault = {
    template: `
        <div class="h-full flex flex-col items-center justify-center text-center">
            <UIcon name="i-heroicons-document-chart-bar" class="w-16 h-16 text-neutral-400 dark:text-neutral-600 mb-4" />
            <h4 class="text-lg font-semibold text-neutral-900 dark:text-white mb-2">Panel de información</h4>
            <UBadge :label="'Tipo: ' + tipo" size="sm" color="neutral" variant="subtle" />
        </div>
    `,
    props: ['data', 'tipo']
}

const componentePanel = computed(() => {
    return componentesMap[props.panel.tipo] || ComponenteDefault
})

const panelStyle = computed(() => ({
    left: `${props.panel.posicion.x}px`,
    top: `${props.panel.posicion.y}px`,
    width: `${props.panel.tamaño.width}px`,
    height: `${props.panel.tamaño.height}px`,
    zIndex: props.panel.zIndex
}))

// Obtener preset del panel
const obtenerPreset = () => {
    return PANEL_SIZE_PRESETS[props.panel.tipo]
}

// Verificar límites
const limites = computed(() => {
    const preset = obtenerPreset()
    return {
        enMinWidth: props.panel.tamaño.width <= preset.minWidth,
        enMaxWidth: preset.maxWidth !== undefined && props.panel.tamaño.width >= preset.maxWidth,
        enMinHeight: props.panel.tamaño.height <= preset.minHeight,
        enMaxHeight: preset.maxHeight !== undefined && props.panel.tamaño.height >= preset.maxHeight,
        hasMaxWidth: preset.maxWidth !== undefined,
        hasMaxHeight: preset.maxHeight !== undefined
    }
})

const obtenerEtiquetaTipo = (tipo: string): string => {
    const etiquetas: Record<string, string> = {
        estadistica: 'Estadística',
        grafico: 'Gráfico',
        lista: 'Lista',
        tabla: 'Tabla',
        mapa: 'Mapa',
        calendario: 'Calendario',
        notas: 'Notas'
    }
    return etiquetas[tipo] || tipo
}

const actualizarContenido = (contenido: string) => {
    emit('update:data', { ...props.panel.data, contenido })
}

// Handler que respeta el estado de dragEnabled
const handleDragStart = (event: MouseEvent) => {
    if (!props.dragEnabled) {
        event.preventDefault()
        event.stopPropagation()
        return
    }
    emit('drag-start', event)
}
</script>

<style scoped>
.panel-flotante {
    user-select: none;
    will-change: transform;
}

/* Animación para los bordes de límite */
@keyframes pulse-border {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.animate-pulse-border {
    animation: pulse-border 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Estilo mejorado del handle */
.resize-handle {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.resize-handle:hover {
    transform: scale(1.1);
}

.resize-handle:active {
    transform: scale(1.2);
}
</style>