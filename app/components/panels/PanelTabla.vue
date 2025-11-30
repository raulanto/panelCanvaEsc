<template>
    <div class="overflow-x-auto h-full flex flex-col">
        <!-- Header con indicador de fuente -->
        <div v-if="data.datasetId" class="mb-2 px-1 flex justify-between items-center">
            <UBadge
                :label="labelFuente"
                size="xs"
                :color="globalDataset ? 'primary' : 'red'"
                :variant="globalDataset ? 'subtle' : 'solid'"
            />
            <UButton
                v-if="!globalDataset"
                icon="i-heroicons-arrow-path"
                size="2xs"
                variant="ghost"
                color="red"
                label="Reintentar"
                @click="$emit('refresh')"
            />
        </div>

        <div v-if="finalColumnas.length === 0" class="flex-1 flex items-center justify-center text-neutral-500 dark:text-neutral-400 text-sm">
            {{ data.datasetId && !globalDataset ? 'El dataset vinculado no existe.' : 'No hay datos definidos.' }}
        </div>

        <div v-else class="flex-1 overflow-auto">
            <table class="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead class="bg-neutral-50 dark:bg-neutral-800 sticky top-0 z-10">
                <tr>
                    <th
                        v-for="col in finalColumnas"
                        :key="col"
                        class="px-3 py-2 text-left text-xs font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider"
                    >
                        {{ col }}
                    </th>
                </tr>
                </thead>
                <tbody class="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-800">
                <tr
                    v-for="(fila, idx) in finalFilas"
                    :key="idx"
                    class="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                    <!-- Mostrar cada celda -->
                    <td
                        v-for="(celda, cellIdx) in fila"
                        :key="cellIdx"
                        class="px-3 py-2 text-sm text-neutral-900 dark:text-neutral-100 whitespace-nowrap"
                    >
                        <UBadge
                            v-if="esColumnaEstado(cellIdx, celda)"
                            :label="String(celda)"
                            size="xs"
                            :color="obtenerColorEstado(String(celda))"
                            variant="subtle"
                        />
                        <span v-else>{{ celda }}</span>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useGlobalDataStore } from '~/composables/useGlobalDataStore';
import type { TablaData } from '~/types/panel';

interface Props {
    data: TablaData
}

const props = defineProps<Props>()
defineEmits(['refresh'])

// Usamos datasets directamente del store para reactividad
const { datasets } = useGlobalDataStore();

// Dataset global reactivo conectado directamente al array datasets
const globalDataset = computed(() => {
    if (!props.data.datasetId) return undefined;
    return datasets.value.find(d => d.id === props.data.datasetId);
});

const labelFuente = computed(() => {
    if (globalDataset.value) return `Fuente: ${globalDataset.value.nombre}`;
    return 'Error: Dataset no encontrado';
});

// Columnas finales
const finalColumnas = computed<string[]>(() => {
    if (globalDataset.value) {
        return globalDataset.value.columnas || [];
    }
    return props.data.columnas || [];
});

// Filas finales
const finalFilas = computed<(string | number)[][]>(() => {
    if (globalDataset.value) {
        const dataset = globalDataset.value;
        // Transformar array de objetos a array de arrays (filas)
        // para que coincida con la estructura esperada por la tabla simple
        return dataset.datos.map(row =>
            dataset.columnas.map(colKey => row[colKey] as (string | number))
        );
    }
    return props.data.filas || [];
});

const esColumnaEstado = (cellIdx: number, celda: string | number): boolean => {
    const columnName = finalColumnas.value[cellIdx]?.toLowerCase() || '';
    const valor = String(celda).toLowerCase();

    // Detección automática de columnas tipo estado
    const nombresEstado = ['estado', 'status', 'situacion', 'condicion'];
    const valoresEstado = ['activo', 'inactivo', 'completado', 'pendiente', 'en progreso', 'error', 'exito'];

    return nombresEstado.includes(columnName) || valoresEstado.includes(valor);
}

const obtenerColorEstado = (valor: string): string => {
    const v = valor.toLowerCase();
    if (v === 'activo' || v === 'completado' || v === 'exito') return 'green';
    if (v === 'inactivo' || v === 'error' || v === 'cancelado') return 'red';
    if (v === 'pendiente' || v === 'en progreso' || v === 'cargando') return 'yellow';
    return 'gray';
}
</script>