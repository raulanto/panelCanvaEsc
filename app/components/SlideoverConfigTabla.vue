<template>
    <USlideover v-model:open="isOpen" :ui="{ width: 'max-w-2xl' }" title="Configurar Tabla"
                description="Define columnas, filas o selecciona un dataset global.">
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
                        <template #item="{ item }">
                            <span class="truncate">{{ item.nombre }} ({{ item.tipo }})</span>
                        </template>
                    </USelectMenu>

                    <UButton
                        v-if="formData.filas.length > 0 && formData.columnas.length > 0 && !datasetSeleccionado"
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

                <!-- Configuración Local -->
                <div>
                    <h4 class="text-sm font-semibold text-neutral-900 dark:text-white mb-3 flex items-center gap-2">
                        <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4"/>
                        Configuración Local
                    </h4>

                    <!-- Columnas -->
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h5 class="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                <UIcon name="i-heroicons-view-columns" class="w-4 h-4"/>
                                Columnas
                            </h5>
                            <UButton
                                icon="i-heroicons-plus"
                                size="xs"
                                color="primary"
                                :disabled="!!datasetSeleccionado"
                                @click="agregarColumna"
                            >
                                Agregar Columna
                            </UButton>
                        </div>
                        <div class="space-y-2">
                            <div v-for="(columna, index) in formData.columnas" :key="index" class="flex items-center gap-2">
                                <UInput
                                    v-model="formData.columnas[index]"
                                    placeholder="Nombre de Columna"
                                    class="flex-1"
                                    size="sm"
                                    :disabled="!!datasetSeleccionado"
                                />
                                <UButton
                                    icon="i-heroicons-trash"
                                    color="error"
                                    variant="ghost"
                                    size="xs"
                                    :disabled="!!datasetSeleccionado"
                                    @click="eliminarColumna(index)"
                                />
                            </div>
                            <div v-if="formData.columnas.length === 0" class="text-center text-xs text-neutral-500 py-2">
                                Agrega al menos una columna.
                            </div>
                        </div>
                    </div>

                    <UDivider class="my-4"/>

                    <!-- Filas -->
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <h5 class="text-sm font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                                <UIcon name="i-heroicons-bars-3-bottom-left" class="w-4 h-4"/>
                                Filas
                            </h5>
                            <UButton
                                icon="i-heroicons-plus"
                                size="xs"
                                color="primary"
                                :disabled="!!datasetSeleccionado || formData.columnas.length === 0"
                                @click="agregarFila"
                            >
                                Agregar Fila
                            </UButton>
                        </div>
                        <div class="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            <UCard v-for="(fila, rowIndex) in formData.filas" :key="rowIndex" :ui="{ body: { padding: 'p-3' } }">
                                <div class="flex items-start gap-3">
                                    <div class="flex-1 grid gap-3" :style="{ gridTemplateColumns: `repeat(${formData.columnas.length}, minmax(0, 1fr))` }">
                                        <UFormField v-for="(columna, colIndex) in formData.columnas" :key="colIndex" :label="columna" size="xs">
                                            <UInput
                                                v-model="formData.filas[rowIndex][colIndex]"
                                                :placeholder="`Valor para ${columna}`"
                                                size="sm"
                                                :disabled="!!datasetSeleccionado"
                                            />
                                        </UFormField>
                                    </div>
                                    <UButton
                                        icon="i-heroicons-trash"
                                        color="error"
                                        variant="ghost"
                                        size="xs"
                                        :disabled="!!datasetSeleccionado"
                                        @click="eliminarFila(rowIndex)"
                                    />
                                </div>
                            </UCard>
                            <div v-if="formData.filas.length === 0" class="text-center text-xs text-neutral-500 py-4">
                                Agrega filas de datos.
                            </div>
                        </div>
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
                        placeholder="Ej: Datos de Inventario"
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
import { ref, watch, computed } from 'vue'
import type { TablaData } from '~/types/panel'
import type { GlobalDataset } from '~/types/globalData'
import { useGlobalDataStore } from '~/composables/useGlobalDataStore';
import { generatePanelId } from '~/utils/panelHelpers';

// --- PROPS & EMITS ---
interface Props {
    modelValue: boolean
    data: TablaData
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:modelValue': [value: boolean]
    'save': [data: TablaData]
}>()

// --- ESTADO LOCAL Y GLOBAL ---
const { datasets, agregarDataset } = useGlobalDataStore()
const toast = useToast()

const isOpen = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value)
})

const formData = ref<TablaData>({
    datasetId: undefined,
    columnas: [],
    filas: []
})

const datasetSeleccionado = ref<string | undefined>(undefined)
const mostrarModalGuardarDataset = ref(false)
const nombreNuevoDataset = ref('')

// --- COMPUTED / OPTIONS ---
const opcionesDatasetGlobal = computed(() => {
    return datasets.value.filter(d => d.tipo === 'tabla')
})

const puedeGuardar = computed(() => {
    return formData.value.columnas.length > 0 && (formData.value.filas.length > 0 || !!formData.value.datasetId)
})

// --- MÉTODOS DE DATOS Y ESTADO ---
const cargarDatos = () => {
    datasetSeleccionado.value = props.data.datasetId

    if (props.data.datasetId) {
        // Búsqueda robusta por ID
        const globalData = datasets.value.find(d => String(d.id) === String(props.data.datasetId))

        if (globalData && globalData.tipo === 'tabla') {
            cargarDatasetLocal(globalData)
        } else {
            cargarDatosLocalesIniciales() // Fallback a datos locales si el ID no es válido o no es tabla
        }
    } else {
        cargarDatosLocalesIniciales()
    }
}

const cargarDatosLocalesIniciales = () => {
    formData.value.columnas = [...(props.data.columnas || ['Columna 1', 'Columna 2'])]
    formData.value.filas = JSON.parse(JSON.stringify(props.data.filas || []))
    formData.value.datasetId = undefined
    datasetSeleccionado.value = undefined
}

const cargarDatasetGlobal = (datasetId?: string) => {
    if (!datasetId) {
        datasetSeleccionado.value = undefined
        cargarDatosLocalesIniciales()
        return
    }

    // Búsqueda robusta por ID
    const globalData = datasets.value.find(d => String(d.id) === String(datasetId))

    if (globalData && globalData.tipo === 'tabla') {
        cargarDatasetLocal(globalData)
    } else if (globalData && globalData.tipo !== 'tabla') {
        toast.add({ title: 'Error', description: `El dataset "${globalData.nombre}" no es de tipo Tabla.`, icon: 'i-heroicons-exclamation-triangle', color: 'error' })
        datasetSeleccionado.value = undefined // Deseleccionar
    } else {
        toast.add({ title: 'Error', description: 'Dataset no encontrado.', icon: 'i-heroicons-exclamation-triangle', color: 'error' })
        datasetSeleccionado.value = undefined // Deseleccionar
    }
}

const cargarDatasetLocal = (dataset: GlobalDataset) => {
    datasetSeleccionado.value = dataset.id
    formData.value.datasetId = dataset.id
    // Actualizar form local para previsualización (se ignorará al guardar si datasetId está presente)
    formData.value.columnas = [...dataset.columnas]
    formData.value.filas = dataset.datos.map(d => dataset.columnas.map(col => d[col] ?? ''))

    toast.add({
        title: 'Dataset Cargado',
        description: `Datos cargados desde "${dataset.nombre}". La edición está bloqueada.`,
        icon: 'i-heroicons-check-circle'
    })
}

// --- MÉTODOS DE EDICIÓN LOCAL ---
const agregarColumna = () => {
    if (formData.value.datasetId) return
    const nuevaColumna = `Columna ${formData.value.columnas.length + 1}`
    formData.value.columnas.push(nuevaColumna)
    // Añadir valor vacío a cada fila para la nueva columna
    formData.value.filas.forEach(fila => fila.push(''))
}

const eliminarColumna = (index: number) => {
    if (formData.value.datasetId) return
    formData.value.columnas.splice(index, 1)
    // Eliminar el valor correspondiente de cada fila
    formData.value.filas.forEach(fila => fila.splice(index, 1))
}

const agregarFila = () => {
    if (formData.value.datasetId) return
    // Crear una fila nueva con valores vacíos para cada columna
    const nuevaFila = formData.value.columnas.map(() => '')
    formData.value.filas.push(nuevaFila)
}

const eliminarFila = (index: number) => {
    if (formData.value.datasetId) return
    formData.value.filas.splice(index, 1)
}

// --- ACCIONES PRINCIPALES ---
const guardar = () => {
    if (!puedeGuardar.value) return

    const dataToSave: TablaData = {
        datasetId: formData.value.datasetId,
        // Si hay datasetId, solo guardamos eso, si no, guardamos los datos locales
        columnas: formData.value.datasetId ? [] : [...formData.value.columnas],
        filas: formData.value.datasetId ? [] : JSON.parse(JSON.stringify(formData.value.filas))
    }

    emit('save', dataToSave)
    cerrar()
}

const cerrar = () => {
    emit('update:modelValue', false)
}

const resetear = () => {
    cargarDatosLocalesIniciales() // Vuelve a los datos locales originales del panel
    datasetSeleccionado.value = undefined // Desvincula del dataset global
    toast.add({
        title: 'Formulario Reseteado',
        description: 'Se restableció la configuración local de la tabla.',
        icon: 'i-heroicons-arrow-path',
        color: 'warning'
    })
}

// --- MÉTODOS DE DATASET GLOBAL ---
const abrirGuardarDatasetModal = () => {
    nombreNuevoDataset.value = `Dataset Tabla ${datasets.value.length + 1}`
    mostrarModalGuardarDataset.value = true
}

const guardarNuevoDataset = () => {
    if (!nombreNuevoDataset.value) return

    // Convertir filas (arrays) a objetos usando las columnas como keys
    const datosComoObjetos = formData.value.filas.map(fila => {
        const obj: Record<string, string | number> = {};
        formData.value.columnas.forEach((col, index) => {
            obj[col] = fila[index];
        });
        return obj;
    });

    const newDataset: GlobalDataset = {
        id: generatePanelId(),
        nombre: nombreNuevoDataset.value,
        tipo: 'tabla',
        columnas: [...formData.value.columnas],
        datos: datosComoObjetos
    }

    agregarDataset(newDataset) // Guardar en el store global

    // Notificar al usuario (aquí sí usamos useToast porque estamos en un componente Vue)
    toast.add({
        title: 'Datos Guardados',
        description: `El dataset "${newDataset.nombre}" ha sido guardado globalmente.`,
        icon: 'i-heroicons-server-stack'
    })

    // Ligar el panel actual a este nuevo dataset y guardarlo
    formData.value.datasetId = newDataset.id
    datasetSeleccionado.value = newDataset.id
    guardar() // Guardar los cambios en el panel

    mostrarModalGuardarDataset.value = false
}


// --- LIFECYCLE ---
watch(() => props.modelValue, (newValue) => {
    if (newValue) {
        cargarDatos()
    }
}, { immediate: true })
</script>