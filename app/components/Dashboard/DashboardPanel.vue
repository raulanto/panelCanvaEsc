<template>
    <div
        :style="panelStyle"
        class="panel-flotante absolute"
        :class="[
      panel.arrastrando ? 'cursor-grabbing' : '',
      panel.redimensionando ? 'select-none' : ''
    ]"
    >
        <UCard
            :ui="{
        base: 'h-full',
        ring: panel.activo ? 'ring-2 ring-primary' : 'ring-1 ring-gray-200 dark:ring-gray-800',
        body: { padding: 'p-0' }
      }"
        >
            <template #header>
                <div
                    class="flex justify-between items-start cursor-grab active:cursor-grabbing select-none"
                    @mousedown="$emit('drag-start', $event)"
                >
                    <div class="flex-1 pointer-events-none">
                        <h3 class="text-base font-semibold text-gray-900 dark:text-white">{{ panel.titulo }}</h3>
                        <div class="flex items-center gap-2 mt-1">
                            <UBadge :label="obtenerEtiquetaTipo(panel.tipo)" size="xs" color="primary"
                                    variant="subtle"/>
                        </div>
                    </div>
                    <div class="flex gap-1">
                        <UTooltip text="Duplicar panel">
                            <UButton
                                icon="i-heroicons-document-duplicate"
                                size="xs"
                                color="gray"
                                variant="ghost"
                                @click.stop="$emit('duplicate')"
                            />
                        </UTooltip>
                        <UTooltip text="Eliminar panel">
                            <UButton
                                icon="i-heroicons-trash"
                                size="xs"
                                color="red"
                                variant="ghost"
                                @click.stop="$emit('delete')"
                            />
                        </UTooltip>
                    </div>
                </div>
            </template>

            <div
                class="p-4 overflow-auto"
                :style="{ height: `calc(${panel.tamaño.height}px - 80px)` }"
            >
                <!-- Estadística -->
                <div v-if="panel.tipo === 'estadistica'" class="flex flex-col items-center justify-center h-full">
                    <div
                        class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-3">
                        {{ panel.data.valor }}
                    </div>
                    <UBadge :label="panel.data.subtitulo" size="md" color="gray" variant="subtle"/>
                </div>

                <!-- Gráfico -->
                <div v-else-if="panel.tipo === 'grafico'" class="space-y-3">
                    <div v-for="(item, idx) in panel.data.datos" :key="idx">
                        <div class="flex items-center justify-between mb-1">
                            <span class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ item.label }}</span>
                            <UBadge :label="`${item.valor}%`" size="xs" color="primary" variant="subtle"/>
                        </div>
                        <UProgress :value="item.valor" color="primary"/>
                    </div>
                </div>

                <!-- Lista -->
                <div v-else-if="panel.tipo === 'lista'" class="space-y-2">
                    <UCard
                        v-for="item in panel.data.items"
                        :key="item.id"
                        :ui="{ body: { padding: 'p-2' } }"
                    >
                        <div class="flex items-center gap-3">
                            <UAvatar
                                :text="item.id.toString()"
                                size="sm"
                                color="primary"
                            />
                            <div class="flex-1 min-w-0">
                                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {{ item.titulo }}
                                </p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">
                                    {{ item.estado }}
                                </p>
                            </div>
                            <UBadge
                                :label="item.estado"
                                size="xs"
                                :color="item.estado === 'Completado' ? 'success' : item.estado === 'En progreso' ? 'warning' : 'gray'"
                                variant="subtle"
                            />
                        </div>
                    </UCard>
                </div>

                <!-- Tabla -->
                <div v-else-if="panel.tipo === 'tabla'" class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                        <thead class="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th
                                v-for="col in panel.data.columnas"
                                :key="col"
                                class="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                            >
                                {{ col }}
                            </th>
                        </tr>
                        </thead>
                        <tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                        <tr
                            v-for="(fila, idx) in panel.data.filas"
                            :key="idx"
                            class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            <td
                                v-for="(celda, cellIdx) in fila"
                                :key="cellIdx"
                                class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
                            >
                                <UBadge
                                    v-if="cellIdx === 2"
                                    :label="celda"
                                    size="xs"
                                    :color="celda === 'Activo' ? 'green' : 'gray'"
                                    variant="subtle"
                                />
                                <span v-else>{{ celda }}</span>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Calendario -->
                <div v-else-if="panel.tipo === 'calendario'"
                     class="h-full flex flex-col items-center justify-center text-center">
                    <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 text-primary mb-4"/>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Calendario</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Próximamente disponible</p>
                </div>

                <!-- Mapa -->
                <div v-else-if="panel.tipo === 'mapa'"
                     class="h-full flex flex-col items-center justify-center text-center">
                    <UIcon name="i-heroicons-map" class="w-16 h-16 text-primary mb-4"/>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Mapa</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">Próximamente disponible</p>
                </div>

                <!-- Notas -->
                <div v-else-if="panel.tipo === 'notas'" class="h-full">
                    <UTextarea
                        placeholder="Escribe tus notas aquí..."
                        :rows="10"
                        autoresize
                        variant="none"
                        :ui="{ base: 'resize-none' }"
                    />
                </div>

                <!-- Default -->
                <div v-else class="h-full flex flex-col items-center justify-center text-center">
                    <UIcon name="i-heroicons-document-chart-bar"
                           class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4"/>
                    <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Panel de información</h4>
                    <UBadge :label="`Tipo: ${panel.tipo}`" size="sm" color="gray" variant="subtle"/>
                </div>
            </div>
        </UCard>

        <!-- Handle para redimensionar -->
        <div
            class="resize-handle absolute bottom-1 right-1 w-5 h-5 cursor-nwse-resize opacity-50 hover:opacity-100 transition-opacity rounded-sm bg-primary/20 flex items-center justify-center"
            @mousedown.stop="$emit('resize-start', $event)"
        >
            <UIcon name="i-heroicons-arrows-pointing-out" class="w-3 h-3 text-primary"/>
        </div>
    </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'
import type {Panel} from '~/types/panel'

interface Props {
    panel: Panel
}

const props = defineProps<Props>()

defineEmits<{
    'drag-start': [event: MouseEvent]
    'resize-start': [event: MouseEvent]
    'delete': []
    'duplicate': []
}>()

const panelStyle = computed(() => ({
    left: `${props.panel.posicion.x}px`,
    top: `${props.panel.posicion.y}px`,
    width: `${props.panel.tamaño.width}px`,
    height: `${props.panel.tamaño.height}px`,
    zIndex: props.panel.zIndex
}))

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
</script>

<style scoped>
.panel-flotante {
    user-select: none;
    will-change: transform;
}
</style>