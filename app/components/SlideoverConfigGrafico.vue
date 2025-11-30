<template>
    <USlideover v-model:open="isOpen" :ui="{ width: 'max-w-2xl' }" title="Configurar Gráfico"
                description="Personaliza tu gráfico de área">

        <template #body>
            <div class="space-y-6 p-4">
                <!-- Selector de Dataset Global -->
                <div>
                    <h4 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <UIcon name="i-heroicons-server" class="w-4 h-4"/>
                        Datos Globales
                    </h4>
                    <USelectMenu
                        v-model="datasetSeleccionado"
                        :items="opcionesDatasetGlobal"
                        placeholder="Seleccionar Dataset Global"
                        value-key="id"
                        option-attribute="nombre"
                        @update:model-value="cargarDatasetGlobal"
                        class="mb-3 w-full"
                    >
                        <template #label>
                            <span v-if="datasetSeleccionado">{{ obtenerNombreDataset(datasetSeleccionado) }}</span>
                            <span v-else>Seleccionar Dataset Global</span>
                        </template>
                        <template #item="{ item }">
                            <span class="truncate">{{ item.nombre }} ({{ item.tipo }})</span>
                        </template>
                    </USelectMenu>

                    <UButton
                        v-if="formData.datos.length > 0 && !datasetSeleccionado"
                        icon="i-heroicons-arrow-down-tray"
                        label="Guardar datos actuales como nuevo Dataset"
                        size="xs"
                        color="primary"
                        variant="soft"
                        block
                        @click="abrirGuardarDatasetModal"
                    />
                </div>
                <UDivider />

                <!-- Configuración General -->
                <div>
                    <h4 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4"/>
                        Configuración Local
                    </h4>

                    <div class="space-y-4">
                        <!-- Título del gráfico -->
                        <UFormField  label="Título del Gráfico" name="titulo">
                            <UInput
                                v-model="formData.titulo"
                                placeholder="Ej: Ventas Mensuales"
                            />
                        </UFormField >

                        <!-- Tipo de curva -->
                        <UFormField  label="Tipo de Curva" name="curveType">
                            <USelect
                                v-model="formData.curveType"
                                :items="curveTypeOptions"
                            />
                        </UFormField >

                        <!-- Posición de leyenda -->
                        <UFormField  label="Posición de Leyenda" name="legendPosition">
                            <USelect
                                v-model="formData.legendPosition"
                                :items="legendPositionOptions"
                            />
                        </UFormField >
                    </div>
                </div>

                <!-- Series -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <UIcon name="i-heroicons-rectangle-stack" class="w-4 h-4"/>
                            Series de Datos
                        </h4>
                        <UButton
                            icon="i-heroicons-plus"
                            size="xs"
                            color="primary"
                            :disabled="!!datasetSeleccionado"
                            @click="agregarSerie"
                        >
                            Agregar Serie
                        </UButton>
                    </div>

                    <div class="space-y-3">
                        <UCard
                            v-for="(serie, index) in formData.series"
                            :key="index"
                            :ui="{ body: { padding: 'p-3' } }"
                        >
                            <div class="flex items-start gap-3">
                                <div class="flex-1 space-y-3">
                                    <div class="grid grid-cols-2 gap-3">
                                        <UFormField  label="Clave" size="xs">
                                            <UInput
                                                v-model="serie.key"
                                                placeholder="Ej: ventas"
                                                size="sm"
                                                :disabled="!!datasetSeleccionado"
                                            />
                                        </UFormField >
                                        <UFormField  label="Nombre" size="xs">
                                            <UInput
                                                v-model="serie.name"
                                                placeholder="Ej: Ventas"
                                                size="sm"
                                                :disabled="!!datasetSeleccionado"
                                            />
                                        </UFormField >
                                    </div>

                                    <UFormField  label="Color" size="xs">
                                        <div class="flex gap-2">
                                            <UPopover>
                                                <UButton label="Color" color="neutral" variant="outline" :disabled="!!datasetSeleccionado">
                                                    <template #leading>
                                                        <span :style="{ backgroundColor: serie.color }" class="size-3 rounded-full" />
                                                    </template>
                                                </UButton>

                                                <template #content>
                                                    <UColorPicker v-model="serie.color" class="p-2" />
                                                </template>
                                            </UPopover>
                                            <UInput
                                                v-model="serie.color"
                                                placeholder="#3b82f6"
                                                size="sm"
                                                class="flex-1"
                                                :disabled="!!datasetSeleccionado"
                                            />
                                        </div>
                                    </UFormField >
                                </div>

                                <UButton
                                    icon="i-heroicons-trash"
                                    color="error"
                                    variant="ghost"
                                    size="xs"
                                    :disabled="!!datasetSeleccionado"
                                    @click="eliminarSerie(index)"
                                />
                            </div>
                        </UCard>

                        <div
                            v-if="formData.series.length === 0"
                            class="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm"
                        >
                            No hay series. Agrega al menos una serie para comenzar.
                        </div>
                    </div>
                </div>

                <!-- Datos -->
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                            <UIcon name="i-heroicons-table-cells" class="w-4 h-4"/>
                            Datos del Gráfico
                        </h4>
                        <UButton
                            icon="i-heroicons-plus"
                            size="xs"
                            color="primary"
                            :disabled="!!datasetSeleccionado"
                            @click="agregarDato"
                        >
                            Agregar Dato
                        </UButton>
                    </div>

                    <div class="space-y-3">
                        <UCard
                            v-for="(dato, index) in formData.datos"
                            :key="index"
                            :ui="{ body: { padding: 'p-3' } }"
                        >
                            <div class="flex items-start gap-3">
                                <div class="flex-1 space-y-3">
                                    <!-- Fecha -->
                                    <UFormField  label="Fecha" size="xs">
                                        <UInput
                                            v-model="dato.date"
                                            type="date"
                                            size="sm"
                                            :disabled="!!datasetSeleccionado"
                                        />
                                    </UFormField >

                                    <!-- Valores para cada serie -->
                                    <div class="grid grid-cols-2 gap-3">
                                        <UFormField
                                            v-for="serie in formData.series"
                                            :key="serie.key"
                                            :label="serie.name"
                                            size="xs"
                                        >
                                            <UInput
                                                v-model.number="dato[serie.key]"
                                                type="number"
                                                :placeholder="`Valor para ${serie.name}`"
                                                size="sm"
                                                :disabled="!!datasetSeleccionado"
                                            />
                                        </UFormField >
                                    </div>
                                </div>

                                <UButton
                                    icon="i-heroicons-trash"
                                    color="error"
                                    variant="ghost"
                                    size="xs"
                                    :disabled="!!datasetSeleccionado"
                                    @click="eliminarDato(index)"
                                />
                            </div>
                        </UCard>

                        <div
                            v-if="formData.datos.length === 0"
                            class="text-center py-8 text-neutral-500 dark:text-neutral-400 text-sm"
                        >
                            No hay datos. Agrega puntos de datos para visualizar el gráfico.
                        </div>
                    </div>
                </div>

                <!-- Vista previa -->
                <div v-if="formData.datos.length > 0 && formData.series.length > 0">
                    <h4 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <UIcon name="i-heroicons-eye" class="w-4 h-4"/>
                        Vista Previa
                    </h4>

                    <div class="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4">
                        <client-only>
                            <AreaChart
                                :data="formData.datos"
                                :height="200"
                                :categories="previewCategories"
                                :y-grid-line="true"
                                :curve-type="getCurveType(formData.curveType)"
                                :legend-position="getLegendPosition(formData.legendPosition)"
                            />
                        </client-only>
                    </div>
                </div>
            </div>
        </template>
        <!-- Contenido del formulario -->


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
                        variant="outline"
                        @click="resetear"
                    >
                        Resetear
                    </UButton>
                    <UButton
                        color="primary"
                        :disabled="!puedeGuardar"
                        @click="guardar"
                    >
                        Guardar Cambios
                    </UButton>
                </div>
            </div>
        </template>
    </USlideover>

    <!-- Modal para guardar nuevo dataset -->
    <UModal v-model:open="mostrarModalGuardarDataset" title="Guardar Dataset Global">
        <template #body>
            <div class="p-4 space-y-4">
                <UFormField label="Nombre del Dataset" name="nombreDataset">
                    <UInput
                        v-model="nombreNuevoDataset"
                        placeholder="Ej: Datos de Ventas Trimestrales"
                    />
                </UFormField>
                <div class="flex justify-end gap-2">
                    <UButton color="neutral" variant="ghost" @click="mostrarModalGuardarDataset = false">
                        Cancelar
                    </UButton>
                    <UButton color="primary" :disabled="!nombreNuevoDataset" @click="guardarNuevoDataset">
                        Guardar
                    </UButton>
                </div>
            </div>
        </template>

    </UModal>
</template>

<script setup lang="ts">
import {computed, type ComputedRef, ref, watch} from 'vue'

import { useGlobalDataStore } from '~/composables/useGlobalDataStore';
import { generatePanelId } from '~/utils/panelHelpers';
import type { GlobalDataset } from '~/types/globalData';
import type { GraficoData, GraficoDataPoint } from "~/types/panel";


// --- PROPS & EMITS ---

interface Props {
    modelValue: boolean
    data: GraficoData
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': [data: GraficoData]
}>()

// --- ESTADO LOCAL Y GLOBAL ---

const { datasets, agregarDataset } = useGlobalDataStore()
const toast = useToast()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const formData = ref<GraficoData>({
    titulo: '',
    datasetId: undefined, // Nuevo campo para ligar al dataset global
    datos: [],
    series: [],
    curveType: 'monotoneX',
    legendPosition: 'top'
})

const datasetSeleccionado = ref<string | undefined>(undefined)
const mostrarModalGuardarDataset = ref(false)
const nombreNuevoDataset = ref('')

// --- COMPUTED / OPTIONS ---

// Opciones de Dataset Global filtradas por tipo 'grafico'
const opcionesDatasetGlobal = computed(() => {
    return datasets.value.filter(d => d.tipo === 'grafico')
})

const obtenerNombreDataset = (id: string) => {
    const ds = datasets.value.find(d => String(d.id) === String(id));
    return ds ? ds.nombre : 'Seleccionar Dataset';
}

// Opciones de configuración
const curveTypeOptions = [
    {label: 'Monotone X', value: 'monotoneX'},
    {label: 'Linear', value: 'linear'},
    {label: 'Natural', value: 'natural'},
    {label: 'Step', value: 'step'}
]

const legendPositionOptions = [
    {label: 'Superior', value: 'top'},
    {label: 'Inferior', value: 'bottom'},
    {label: 'Derecha', value: 'right'},
    {label: 'Izquierda', value: 'left'}
]

// Vista previa
const previewCategories: ComputedRef<Record<string, BulletLegendItemInterface>> = computed(() => {
    const cats: Record<string, BulletLegendItemInterface> = {}

    formData.value.series.forEach(serie => {
        cats[serie.key] = {
            name: serie.name,
            color: serie.color
        }
    })

    return cats
})

// Validación
const puedeGuardar = computed(() => {
    return formData.value.series.length > 0 && formData.value.datos.length > 0
})

// --- MÉTODOS DE DATOS Y ESTADO ---

const cargarDatos = () => {
    datasetSeleccionado.value = props.data.datasetId

    if (props.data.datasetId) {
        // Búsqueda robusta por ID (string vs number)
        const globalData = datasets.value.find(d => String(d.id) === String(props.data.datasetId))

        if (globalData) {
            cargarDatasetLocal(globalData)
        } else {
            // Si el ID no existe (fue eliminado), resetear a datos locales
            cargarDatosLocalesIniciales()
        }
    } else {
        // Si no hay datasetId, cargar datos locales
        cargarDatosLocalesIniciales()
    }

    // Cargar configuraciones de visualización locales
    formData.value.titulo = props.data.titulo || 'Gráfico de Área'
    formData.value.curveType = props.data.curveType || 'monotoneX'
    formData.value.legendPosition = props.data.legendPosition || 'top'
}

const cargarDatosLocalesIniciales = () => {
    // Si estamos usando un dataset global, los datos y series locales del panel son ignorados,
    // pero si el panel no tiene ID, cargamos los datos y series de sus props.
    // Usar los valores de props.data como valor inicial local (si existen)
    formData.value.datos = JSON.parse(JSON.stringify(props.data.datos || [
        { date: '2024-04-01', ValorA: 222},
        { date: '2024-04-02', ValorA: 180},
        { date: '2024-04-03', ValorA: 167 },
        { date: '2024-04-04', ValorA: 260 },
        { date: '2024-04-05', ValorA: 240 },
    ]))
    formData.value.series = JSON.parse(JSON.stringify(props.data.series || [
        { key: 'ValorA', name: 'Valor A', color: '#3b82f6' }
    ]))
    formData.value.datasetId = undefined // Asegurar que no esté ligado a nada
    datasetSeleccionado.value = undefined
}

const cargarDatasetGlobal = (datasetId?: string) => {
    if (!datasetId) {
        // Deseleccionado, volver a los datos locales si los hay
        datasetSeleccionado.value = undefined
        cargarDatosLocalesIniciales()
        return
    }

    // Búsqueda robusta: Convertir a string para comparar
    const globalData = datasets.value.find(d => String(d.id) === String(datasetId))

    if (globalData && globalData.tipo === 'grafico') {
        cargarDatasetLocal(globalData)
    } else if (globalData && globalData.tipo !== 'grafico') {
        toast.add({
            title: 'Error',
            description: `El dataset "${globalData.nombre}" no es de tipo Gráfico.`,
            icon: 'i-heroicons-exclamation-triangle',
            color: 'error'
        })
        datasetSeleccionado.value = undefined
    } else {
        toast.add({
            title: 'Error',
            description: 'Dataset no encontrado.',
            icon: 'i-heroicons-exclamation-triangle',
            color: 'error'
        })
        datasetSeleccionado.value = undefined
    }
}

const cargarDatasetLocal = (dataset: GlobalDataset) => {
    datasetSeleccionado.value = dataset.id
    formData.value.datasetId = dataset.id
    // Los datos y series del formulario se actualizan para la previsualización, pero se ignorarán al guardar
    formData.value.datos = dataset.datos as GraficoDataPoint[]

    // Reconstruir series a partir de las columnas, excluyendo 'date'
    const seriesKeys = dataset.columnas.filter(c => c !== 'date')
    // Mantenemos colores si ya existen, si no, asignamos por defecto
    const coloresBase = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899']

    formData.value.series = seriesKeys.map((key, index) => {
        // Intentar mantener la configuración de color si ya existe una serie con esa key
        const existingSerie = props.data.series?.find(s => s.key === key)
        return {
            key: key,
            name: key, // Usar la clave como nombre por defecto
            color: existingSerie ? existingSerie.color : coloresBase[index % coloresBase.length]
        }
    })

    toast.add({
        title: 'Dataset Cargado',
        description: `Datos cargados desde el dataset "${dataset.nombre}". La configuración de Series y Datos está bloqueada.`,
        icon: 'i-heroicons-check-circle'
    })
}

// --- MÉTODOS DE ACCIÓN ---

const agregarSerie = () => {
    if (formData.value.datasetId) return // Bloquear si usa dataset global

    const colores = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b', '#8b5cf6', '#ec4899']
    const newIndex = formData.value.series.length + 1
    const newKey = `serie${newIndex}`
    const color = colores[formData.value.series.length % colores.length]

    formData.value.series.push({
        key: newKey,
        name: `Serie ${newIndex}`,
        color
    })

    // Asegurar que los datos existentes tengan el nuevo campo
    formData.value.datos.forEach(dato => {
        if (!(newKey in dato)) {
            dato[newKey] = 0
        }
    })
}

const eliminarSerie = (index: number) => {
    if (formData.value.datasetId) return // Bloquear si usa dataset global

    const serieKey = formData.value.series[index].key
    formData.value.series.splice(index, 1)

    // Eliminar valores de esta serie en todos los datos
    formData.value.datos.forEach(dato => {
        delete dato[serieKey]
    })
}

const agregarDato = () => {
    if (formData.value.datasetId) return // Bloquear si usa dataset global

    const nuevoDato: GraficoDataPoint = {
        date: new Date().toISOString().split('T')[0]
    }

    // Agregar campos para cada serie con valor 0
    formData.value.series.forEach(serie => {
        nuevoDato[serie.key] = 0
    })

    formData.value.datos.push(nuevoDato)
}

const eliminarDato = (index: number) => {
    if (formData.value.datasetId) return // Bloquear si usa dataset global
    formData.value.datos.splice(index, 1)
}

const getCurveType = (type: string) => {
    return CurveType[type as keyof typeof CurveType] || CurveType.MonotoneX
}

const getLegendPosition = (position: string) => {
    return LegendPosition[position as keyof typeof LegendPosition] || LegendPosition.Top
}

const guardar = () => {
    if (!puedeGuardar.value) return

    // Clonar los datos del formulario
    const dataToSave: GraficoData = JSON.parse(JSON.stringify(formData.value))

    // Si está ligado a un dataset global, limpiamos los datos locales para no duplicar
    // PERO mantenemos el datasetId que es lo más importante
    if (dataToSave.datasetId) {
        dataToSave.datos = []
        dataToSave.series = dataToSave.series.map(s => ({
            key: s.key,
            name: s.name,
            color: s.color
        })) // Solo guardamos la configuración de visualización (colores, nombres)
    }

    emit('save', dataToSave)
    cerrar()
}

const cerrar = () => {
    emit('update:modelValue', false)
}

const resetear = () => {
    // Restablecer a los datos iniciales (los que tenía el panel antes de abrir el slideover)
    cargarDatosLocalesIniciales()

    // Restablecer configuraciones de visualización locales
    formData.value.titulo = props.data.titulo || 'Gráfico de Área'
    formData.value.curveType = props.data.curveType || 'monotoneX'
    formData.value.legendPosition = props.data.legendPosition || 'top'

    // Desligar del dataset global si lo había
    formData.value.datasetId = undefined
    datasetSeleccionado.value = undefined
    toast.add({
        title: 'Formulario Reseteado',
        description: 'Se restableció la configuración local del gráfico.',
        icon: 'i-heroicons-arrow-path',
        color: 'warning'
    })
}

// --- MÉTODOS DE DATASET GLOBAL ---

const abrirGuardarDatasetModal = () => {
    nombreNuevoDataset.value = formData.value.titulo || `Dataset Gráfico ${datasets.value.length + 1}`
    mostrarModalGuardarDataset.value = true
}

const guardarNuevoDataset = () => {
    if (!nombreNuevoDataset.value) return

    // 1. Crear la lista de columnas (date + keys de las series)
    const columns = ['date', ...formData.value.series.map(s => s.key)]

    // 2. Crear el nuevo dataset
    const newDataset: GlobalDataset = {
        id: generatePanelId(), // Usamos la misma función para generar un ID único
        nombre: nombreNuevoDataset.value,
        tipo: 'grafico',
        columnas: columns,
        // Convertir datos a objetos simples sin referencias a propiedades de vue
        datos: JSON.parse(JSON.stringify(formData.value.datos))
    }

    // 3. Guardar en el store global
    agregarDataset(newDataset)

    // 4. Ligar el panel a este nuevo dataset y guardarlo en el panel
    formData.value.datasetId = newDataset.id
    datasetSeleccionado.value = newDataset.id
    guardar() // Guardar los cambios en el panel también

    mostrarModalGuardarDataset.value = false
}

// --- LIFECYCLE ---

watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        cargarDatos()
    }
}, { immediate: true })
</script>