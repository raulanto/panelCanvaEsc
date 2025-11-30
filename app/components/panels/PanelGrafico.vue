<template>
    <div v-if="data" class="h-full flex flex-col">
        <!-- Encabezado con botón de configuración -->
        <div
            class="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200 dark:border-neutral-700"
        >
            <div class="flex flex-col items-start gap-1">
                <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-chart-bar" class="w-4 h-4 text-primary" />
                    <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {{ data.titulo || "Gráfico" }}
            </span>
                </div>
                <!-- Badge de Dataset: Muestra nombre si existe, o alerta si no -->
                <UBadge
                    v-if="data.datasetId"
                    :label="labelFuente"
                    size="xs"
                    :color="globalDataset ? 'primary' : 'error'"
                    :variant="globalDataset ? 'subtle' : 'solid'"
                />
            </div>

            <UButton
                icon="i-heroicons-cog-6-tooth"
                size="xs"
                color="neutral"
                variant="ghost"
                @click="$emit('open-config')"
            >
                Configurar
            </UButton>
        </div>

        <!-- Gráfico -->
        <div class="flex-1 min-h-0">
            <client-only>
                <AreaChart
                    v-if="finalChartData.length > 0"
                    :data="finalChartData"
                    :height="chartHeight"
                    :categories="finalCategories"
                    :y-grid-line="true"
                    :x-formatter="xFormatter"
                    :curve-type="curveType"
                    :legend-position="legendPosition"
                    :hide-legend="false"
                />
                <div
                    v-else
                    class="h-full flex flex-col items-center justify-center text-center p-4"
                >
                    <UIcon
                        name="i-heroicons-chart-bar-square"
                        class="w-12 h-12 text-neutral-400 dark:text-neutral-600 mb-3"
                    />
                    <p class="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                        {{ data.datasetId && !globalDataset ? 'Dataset no encontrado (ID inválido)' : 'No hay datos para mostrar' }}
                    </p>
                    <UButton
                        icon="i-heroicons-plus"
                        size="sm"
                        color="primary"
                        @click="$emit('open-config')"
                    >
                        {{ data.datasetId ? 'Revisar Dataset' : 'Agregar Datos' }}
                    </UButton>
                </div>
            </client-only>
        </div>
    </div>
    <div v-else>
        <p class="text-sm text-neutral-600 dark:text-neutral-400 p-4">
            No hay datos para mostrar
        </p>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ComputedRef } from "vue";
import { useGlobalDataStore } from '~/composables/useGlobalDataStore';
import type { GraficoData, GraficoDataPoint } from "~/types/panel";


interface Props {
    data: GraficoData;
}

const props = defineProps<Props>();

defineEmits<{
    "open-config": [];
}>();

// Importamos datasets directamente para reactividad total
const { datasets } = useGlobalDataStore();

// Dataset global reactivo
// IMPORTANTE: Buscamos directamente en datasets.value dentro del computed
// Esto asegura que si 'datasets' cambia (al guardar/editar), esto se recalcula automáticamente.
const globalDataset = computed(() => {
    if (!props.data.datasetId) return undefined;
    return datasets.value.find(d => d.id === props.data.datasetId);
});

const labelFuente = computed(() => {
    if (!props.data.datasetId) return '';
    if (globalDataset.value) {
        return `Fuente: ${globalDataset.value.nombre}`;
    }
    return `Error: Dataset no hallado`;
});

// Datos finales del gráfico
const finalChartData = computed<GraficoDataPoint[]>(() => {
    if (globalDataset.value) {
        // Mapeamos los datos globales. Si están vacíos, devolvemos array vacío.
        return (globalDataset.value.datos as GraficoDataPoint[]) || [];
    }
    // Si no hay dataset global, usamos los datos locales
    return props.data.datos || [];
});

// Categorías/Series finales del gráfico
const finalCategories: ComputedRef<Record<string, BulletLegendItemInterface>> = computed(() => {
    // Si hay dataset global, generamos las categorías basadas en sus columnas
    if (globalDataset.value) {
        const categories: Record<string, BulletLegendItemInterface> = {};
        // Asumimos que 'date' o 'fecha' es el eje X, el resto son series
        const seriesKeys = globalDataset.value.columnas.filter(c => c.toLowerCase() !== 'date' && c.toLowerCase() !== 'fecha');

        const coloresBase = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899'];

        seriesKeys.forEach((key, index) => {
            // Intentamos mantener la configuración de color local si existe para esa llave
            const localSerieConfig = props.data.series?.find(s => s.key === key);

            categories[key] = {
                name: localSerieConfig?.name || key,
                color: localSerieConfig?.color || coloresBase[index % coloresBase.length]
            };
        });
        return categories;
    }

    // Comportamiento local (Legacy)
    const cats: Record<string, BulletLegendItemInterface> = {};
    if (props.data.series && props.data.series.length > 0) {
        props.data.series.forEach((serie) => {
            cats[serie.key] = {
                name: serie.name,
                color: serie.color,
            };
        });
    }
    return cats;
});

// Altura dinámica
const chartHeight = computed(() => 250);

// Tipo de curva
const curveType = computed(() => {
    const type = props.data.curveType || "monotoneX";
    // Mapeo seguro al enum o valor por defecto
    return CurveType[type as keyof typeof CurveType] || CurveType.MonotoneX;
});

// Posición de la leyenda
const legendPosition = computed(() => {
    const position = props.data.legendPosition || "top";
    return (
        LegendPosition[position as keyof typeof LegendPosition] ||
        LegendPosition.Top
    );
});

// Formateador del eje X
const xFormatter = (tick: number): string => {
    const dataArray = finalChartData.value;
    if (!dataArray || dataArray.length === 0) return "";

    const item = dataArray[tick];
    if (!item) return "";

    // Intentar encontrar la llave de fecha
    const dateKey = Object.keys(item).find(k => k.toLowerCase() === 'date' || k.toLowerCase() === 'fecha') || 'date';
    const val = item[dateKey];

    // Formatear fecha si es válida
    if (val) {
        try {
            const date = new Date(val as string);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                });
            }
        } catch (e) {
            // Ignorar error
        }
        return String(val);
    }
    return "";
};
</script>