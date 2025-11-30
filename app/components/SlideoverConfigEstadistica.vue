<template>
    <USlideover
        v-model:open="isOpen"
        v-bind:ui="{ width: 'max-w-md' }"
        title="Configurar Estadística"
        description="Define un valor manual o calcúlalo desde un dataset global."
    >
        <template #body>
            <div class="space-y-6 p-4">

                <!-- Sección: Datos Globales (Cálculo Automático) -->
                <div>
                    <h4 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <UIcon name="i-heroicons-calculator" class="w-4 h-4"/>
                        Cálculo desde Datos Globales
                    </h4>

                    <div class="space-y-3 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg border border-neutral-200 dark:border-neutral-700">
                        <!-- 1. Selector de Dataset -->
                        <UFormField label="Fuente de Datos" size="xs">
                            <USelectMenu
                                v-model="datasetSeleccionado"
                                :items="datasets"
                                placeholder="Seleccionar Dataset..."
                                value-key="id"
                                label-key="nombre"
                                @update:model-value="onDatasetChange"
                            >
                                <template #item="{ item }">
                                    <span class="truncate">{{ item.nombre }} ({{ item.tipo }})</span>
                                </template>
                            </USelectMenu>
                        </UFormField>

                        <!-- Controles de Cálculo (Solo visibles si hay dataset) -->
                        <div v-if="datasetSeleccionado" class="space-y-3 transition-all duration-300">
                            <!-- 2. Selector de Columna -->
                            <UFormField label="Columna a analizar" size="xs">
                                <USelectMenu
                                    v-model="columnaSeleccionada"
                                    :items="columnasDisponibles"
                                    placeholder="Seleccionar Columna..."
                                    @update:model-value="calcularResultado"
                                />
                            </UFormField>

                            <!-- 3. Selector de Operación -->
                            <UFormField label="Operación" size="xs">
                                <USelect
                                    v-model="operacionSeleccionada"
                                    :items="operacionesDisponibles"
                                    placeholder="Operación..."
                                    @update:model-value="calcularResultado"
                                />
                            </UFormField>

                            <!-- Resultado Previo -->
                            <div v-if="resultadoCalculado !== null" class="mt-2 text-center">
                                <span class="text-xs text-neutral-500 uppercase font-bold tracking-wider">Resultado Calculado</span>
                                <div class="text-xl font-bold text-primary-600 dark:text-primary-400">
                                    {{ resultadoCalculado }}
                                </div>
                                <UButton
                                    size="xs"
                                    variant="soft"
                                    block
                                    class="mt-2"
                                    icon="i-heroicons-arrow-down"
                                    label="Usar este valor"
                                    @click="aplicarCalculo"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <UDivider />

                <!-- Configuración General (Manual) -->
                <div>
                    <h4 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4"/>
                        Configuración del Panel
                    </h4>

                    <div class="space-y-4">
                        <!-- Valor -->
                        <UFormField label="Valor a Mostrar" name="valor" help="Puedes escribir un valor manual o usar el calculado arriba">
                            <UInput
                                v-model="formData.valor"
                                placeholder="Ej: 1,234"
                            />
                        </UFormField>

                        <!-- Subtítulo -->
                        <UFormField label="Subtítulo" name="subtitulo">
                            <UInput
                                v-model="formData.subtitulo"
                                placeholder="Ej: Usuarios Activos"
                            />
                        </UFormField>
                    </div>
                </div>
            </div>
        </template>

        <!-- Footer con acciones -->
        <template #footer>
            <div class="flex items-center justify-between gap-3">
                <UButton
                    color="error"
                    variant="ghost"
                    @click="cerrar"
                >
                    Cancelar
                </UButton>
                <div class="flex gap-2">
                    <UButton
                        color="warning"
                        variant="ghost"
                        @click="resetear"
                    >
                        Limpiar
                    </UButton>
                    <UButton
                        color="primary"
                        @click="guardar"
                    >
                        Guardar Cambios
                    </UButton>
                </div>
            </div>
        </template>
    </USlideover>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { EstadisticaData } from '~/types/panel'
import { useGlobalDataStore } from '~/composables/useGlobalDataStore'

interface Props {
    modelValue: boolean
    data: EstadisticaData
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': [data: EstadisticaData]
}>()

// --- COMPOSABLES ---
const { datasets, obtenerDatasetPorId } = useGlobalDataStore()
const toast = useToast()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

// --- ESTADO ---
const formData = ref<EstadisticaData>({
    valor: '',
    subtitulo: ''
})

// Estado para la calculadora de datasets
const datasetSeleccionado = ref<string | undefined>(undefined)
const columnaSeleccionada = ref<string | undefined>(undefined)
const operacionSeleccionada = ref<string>('count')
const resultadoCalculado = ref<string | number | null>(null)

// --- COMPUTED ---
const columnasDisponibles = computed(() => {
    if (!datasetSeleccionado.value) return []
    const dataset = obtenerDatasetPorId(datasetSeleccionado.value)
    return dataset ? dataset.columnas : []
})

const operacionesDisponibles = [
    { label: 'Recuento (Filas)', value: 'count' },
    { label: 'Suma (Total)', value: 'sum' },
    { label: 'Promedio', value: 'avg' },
    { label: 'Mínimo', value: 'min' },
    { label: 'Máximo', value: 'max' }
]

// --- MÉTODOS DE CÁLCULO ---

const onDatasetChange = () => {
    columnaSeleccionada.value = undefined
    resultadoCalculado.value = null
    // Si seleccionamos un dataset, intentamos preseleccionar una columna numérica si existe
    if (datasetSeleccionado.value) {
        calcularResultado()
    }
}

const calcularResultado = () => {
    if (!datasetSeleccionado.value) return

    const dataset = obtenerDatasetPorId(datasetSeleccionado.value)
    if (!dataset || !dataset.datos) return

    const datos = dataset.datos
    const op = operacionSeleccionada.value
    const col = columnaSeleccionada.value

    // Operación: Recuento (No necesita columna específica)
    if (op === 'count') {
        resultadoCalculado.value = datos.length
        return
    }

    // Para el resto de operaciones, necesitamos una columna seleccionada
    if (!col) {
        resultadoCalculado.value = null
        return
    }

    // Extraer valores numéricos de la columna
    const valores = datos.map(d => {
        const val = d[col]
        // Intentar limpiar strings de moneda o texto (ej: "$ 1,200" -> 1200)
        if (typeof val === 'string') {
            return parseFloat(val.replace(/[^0-9.-]+/g, ''))
        }
        return Number(val)
    }).filter(n => !isNaN(n)) // Filtrar inválidos

    if (valores.length === 0) {
        resultadoCalculado.value = 0
        return
    }

    let res: number = 0

    switch (op) {
        case 'sum':
            res = valores.reduce((a, b) => a + b, 0)
            break
        case 'avg':
            res = valores.reduce((a, b) => a + b, 0) / valores.length
            // Redondear a 2 decimales
            res = Math.round(res * 100) / 100
            break
        case 'min':
            res = Math.min(...valores)
            break
        case 'max':
            res = Math.max(...valores)
            break
    }

    // Formatear si es muy grande
    resultadoCalculado.value = res.toLocaleString('es-ES')
}

const aplicarCalculo = () => {
    if (resultadoCalculado.value !== null) {
        formData.value.valor = resultadoCalculado.value

        // Generar un subtítulo sugerido
        const dataset = obtenerDatasetPorId(datasetSeleccionado.value!)
        const opLabel = operacionesDisponibles.find(o => o.value === operacionSeleccionada.value)?.label

        let sub = ''
        if (operacionSeleccionada.value === 'count') {
            sub = `Total en ${dataset?.nombre}`
        } else {
            sub = `${opLabel} de ${columnaSeleccionada.value}`
        }
        formData.value.subtitulo = sub

        toast.add({ title: 'Valor aplicado', icon: 'i-heroicons-check-circle' })
    }
}

// --- CARGA Y GUARDADO ---

const cargarDatos = () => {
    formData.value = {
        valor: props.data.valor || '',
        subtitulo: props.data.subtitulo || ''
    }
    // Resetear calculadora al abrir
    datasetSeleccionado.value = undefined
    columnaSeleccionada.value = undefined
    resultadoCalculado.value = null
}

const guardar = () => {
    emit('save', JSON.parse(JSON.stringify(formData.value)))
    cerrar()
}

const resetear = () => {
    formData.value = { valor: '', subtitulo: '' }
    datasetSeleccionado.value = undefined
    columnaSeleccionada.value = undefined
    resultadoCalculado.value = null
}

const cerrar = () => {
    emit('update:modelValue', false)
}

// Cargar datos cuando se abre el slideover
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        cargarDatos()
    }
}, { immediate: true })
</script>