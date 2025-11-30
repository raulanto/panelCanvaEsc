import { createSharedComposable } from '@vueuse/core'
import { ref, watch } from 'vue'
import type { GlobalDataset } from '~/types/globalData'

const _useGlobalDataStore = () => {

    const datasets = ref<GlobalDataset[]>([])
    const isLoading = ref(false)
    const error = ref<any>(null)

    /**
     * Carga inicial de datos desde el servidor
     */
    const inicializarDatos = async () => {
        isLoading.value = true
        try {

            const { data, error: fetchError } = await useFetch<GlobalDataset[]>('/api/dataGlobal')

            if (fetchError.value) {
                console.error('Error cargando datasets globales:', fetchError.value)
                error.value = fetchError.value
                return
            }

            if (data.value) {

                datasets.value = data.value
                console.log(`Cargados ${data.value.length} datasets globales desde el servidor.`)
            }
        } catch (e) {
            console.error('Excepción al cargar datos globales:', e)
            error.value = e
        } finally {
            isLoading.value = false
        }
    }

    // Ejecutar la carga inmediatamente al instanciar el store
    inicializarDatos()

    /**
     * Agrega o actualiza un dataset en el store (Localmente, post-carga)
     */
    const agregarDataset = (dataset: GlobalDataset) => {
        const index = datasets.value.findIndex(d => d.id === dataset.id)
        if (index !== -1) {
            datasets.value.splice(index, 1, { ...dataset })
        } else {
            datasets.value.push({ ...dataset })
        }
    }

    /**
     * Obtiene un dataset por su ID.
     */
    const obtenerDatasetPorId = (id: string): GlobalDataset | undefined => {
        return datasets.value.find(d => d.id === id)
    }

    /**
     * Obtiene un dataset por su nombre.
     */
    const obtenerDatasetPorNombre = (nombre: string): GlobalDataset | undefined => {
        return datasets.value.find(d => d.nombre === nombre)
    }

    /**
     * Elimina un dataset por su ID.
     */
    const eliminarDataset = (id: string) => {
        datasets.value = datasets.value.filter(d => d.id !== id)
    }

    return {
        datasets,
        isLoading,
        error,
        agregarDataset,
        obtenerDatasetPorId,
        obtenerDatasetPorNombre,
        eliminarDataset,
        recargarDatos: inicializarDatos
    }
}


export const useGlobalDataStore = createSharedComposable(_useGlobalDataStore)