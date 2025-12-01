// app/composables/useGlobalDataStore.ts
import { createSharedComposable } from '@vueuse/core'
import { ref } from 'vue'
import { invoke } from '@tauri-apps/api/core' // Importamos invoke
import type { GlobalDataset } from '~/types/globalData'

const _useGlobalDataStore = () => {

    const datasets = ref<GlobalDataset[]>([])
    const isLoading = ref(false)
    const error = ref<any>(null)

    /**
     * Carga inicial de datos desde el backend Rust (Tauri)
     */
    const inicializarDatos = async () => {
        isLoading.value = true
        error.value = null // Reseteamos error antes de cargar

        try {
            // Reemplazamos useFetch por invoke
            // 'get_global_datasets' debe coincidir con el nombre de función en lib.rs
            const data = await invoke<GlobalDataset[]>('get_global_datasets')

            if (data) {
                datasets.value = data
                console.log(`Cargados ${data.length} datasets globales desde Rust.`)
            }
        } catch (e) {
            console.error('Excepción al cargar datos globales desde Rust:', e)
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