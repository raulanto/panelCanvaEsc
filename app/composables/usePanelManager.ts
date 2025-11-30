import { ref, computed } from 'vue'
import type { Panel, PanelType, PanelData } from '~/types/panel'
import { PANEL_SIZE_PRESETS, type GraficoData, type TablaData } from '~/types/panel'
import { useGlobalDataStore } from './useGlobalDataStore' // Importar el nuevo store

const paneles = ref<Panel[]>([])
const maxZIndex = ref(1)

// Usar el store de datos globales
const { datasets } = useGlobalDataStore()


/**
 * Obtiene datos de ejemplo según el tipo de panel
 */
const obtenerDataEjemplo = (tipo: PanelType): PanelData => {
    // No longer automatically assigns global dataset ID here for 'grafico' or 'tabla'
    // It will start with local data, and the user can choose a global dataset in the config slideover.

    switch (tipo) {
        case 'estadistica':
            return {
                valor: Math.floor(Math.random() * 10000),
                subtitulo: 'Total de usuarios'
            }

        case 'grafico':
            // Datos de ejemplo predeterminados (local)
            return {
                titulo: 'Gráfico de Rendimiento',
                xAxisKey: 'date', // Default X-axis key
                datos: [
                    { date: '2024-07-01', ValorA: 50, ValorB: 30 },
                    { date: '2024-08-01', ValorA: 75, ValorB: 45 },
                    { date: '2024-09-01', ValorA: 60, ValorB: 55 },
                ],
                // Series now only stores configuration for *selected* series by default
                series: [
                    { key: 'ValorA', name: 'Valor A', color: '#3b82f6' },
                    // { key: 'ValorB', name: 'Valor B', color: '#22c55e' } // Example: Start with only one series selected
                ],
                curveType: 'monotoneX',
                legendPosition: 'top'
            }

        case 'lista':
            return {
                items: [
                    { id: 1, titulo: 'Implementar autenticación', estado: 'Completado' },
                    { id: 2, titulo: 'Diseñar dashboard', estado: 'En progreso' },
                    { id: 3, titulo: 'Optimizar base de datos', estado: 'Pendiente' },
                    { id: 4, titulo: 'Testing de integración', estado: 'Pendiente' }
                ]
            }

        case 'tabla':
            // Check if a global table dataset exists to use its structure, but don't link it automatically
            const globalTableExample = datasets.value.find(d => d.tipo === 'tabla')
            if (globalTableExample) {
                return {
                    columnas: [...globalTableExample.columnas],
                    // Provide one empty row matching the global structure as a starting point
                    filas: [globalTableExample.columnas.map(() => '')]
                }
            }
            // Datos de ejemplo predeterminados (local) si no hay global
            return {
                columnas: ['Nombre', 'Cargo', 'Estado'],
                filas: [
                    ['Juan Pérez', 'Desarrollador', 'Activo'],
                    ['María García', 'Diseñadora', 'Activo'],
                ]
            }

        case 'calendario':
            return { eventos: [] }

        case 'mapa':
            return { ubicaciones: [] }

        case 'notas':
            return { contenido: '' }

        default:
            // Asegurarse que siempre devuelva un objeto, aunque esté vacío
            return {} as PanelData;
    }
}

/**
 * Obtiene el título según el tipo de panel
 */
const obtenerTituloPanel = (tipo: PanelType): string => {
    const titulos: Record<PanelType, string> = {
        estadistica: 'Estadísticas',
        grafico: 'Gráfico de Rendimiento',
        lista: 'Tareas Pendientes',
        tabla: 'Tabla de Datos',
        calendario: 'Calendario',
        mapa: 'Mapa',
        notas: 'Notas'
    }
    return titulos[tipo] || 'Panel'
}

export const usePanelManager = () => {
    const totalPaneles = computed(() => paneles.value.length)

    /**
     * Genera una posición aleatoria dentro del viewport
     */
    const generarPosicionAleatoria = (
        anchoContenedor: number,
        altoContenedor: number,
        canvasX: number = 0,
        canvasY: number = 0
    ) => {
        const margen = 50
        const anchoPanel = 400
        const altoPanel = 300

        const x = Math.random() * (anchoContenedor - anchoPanel - margen * 2) + margen - canvasX
        const y = Math.random() * (altoContenedor - altoPanel - margen * 2) + margen - canvasY

        return { x, y }
    }

    /**
     * Agrega un nuevo panel al canvas
     */
    const agregarPanel = (
        tipo: PanelType,
        anchoContenedor: number = 1200,
        altoContenedor: number = 800,
        canvasX: number = 0,
        canvasY: number = 0
    ) => {
        const posicion = generarPosicionAleatoria(anchoContenedor, altoContenedor, canvasX, canvasY)

        // Obtener tamaño predefinido según el tipo de panel
        const sizePreset = PANEL_SIZE_PRESETS[tipo]

        const nuevoPanel: Panel = {
            id: `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            titulo: obtenerTituloPanel(tipo),
            tipo,
            posicion,
            tamaño: {
                width: sizePreset.width,
                height: sizePreset.height
            },
            data: obtenerDataEjemplo(tipo), // Get example data (won't auto-link global data anymore)
            zIndex: maxZIndex.value++,
            activo: false,
            arrastrando: false,
            redimensionando: false
        }

        paneles.value.push(nuevoPanel)
        return nuevoPanel
    }

    // ... rest of the composable (eliminarPanel, duplicarPanel, etc.) ...
    /**
     * Elimina un panel por su ID
     */
    const eliminarPanel = (id: string) => {
        const index = paneles.value.findIndex(p => p.id === id)
        if (index !== -1) {
            paneles.value.splice(index, 1)
        }
    }

    /**
     * Duplica un panel existente
     */
    const duplicarPanel = (id: string) => {
        const panelOriginal = paneles.value.find(p => p.id === id)
        if (!panelOriginal) return

        const offset = 30
        const nuevoPosicion = {
            x: panelOriginal.posicion.x + offset,
            y: panelOriginal.posicion.y + offset
        }

        const nuevoPanel: Panel = {
            ...panelOriginal,
            id: `panel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            posicion: nuevoPosicion,
            zIndex: maxZIndex.value++,
            activo: false,
            arrastrando: false,
            redimensionando: false,
            // Deep clone data to avoid shared references
            data: JSON.parse(JSON.stringify(panelOriginal.data))
        }

        paneles.value.push(nuevoPanel)
        return nuevoPanel
    }

    /**
     * Actualiza las propiedades de un panel
     */
    const actualizarPanel = (id: string, actualizaciones: Partial<Panel>) => {
        const panel = paneles.value.find(p => p.id === id)
        if (panel) {
            Object.assign(panel, actualizaciones)
            // If data is updated, ensure reactivity (Vue might not detect deep changes otherwise)
            if ('data' in actualizaciones) {
                panel.data = JSON.parse(JSON.stringify(actualizaciones.data));
            }
        }
    }

    /**
     * Actualiza la posición de un panel
     */
    const actualizarPosicion = (id: string, x: number, y: number) => {
        const panel = paneles.value.find(p => p.id === id)
        if (panel) {
            panel.posicion = { x, y }
        }
    }

    /**
     * Actualiza el tamaño de un panel
     */
    const actualizarTamano = (id: string, width: number, height: number) => {
        const panel = paneles.value.find(p => p.id === id)
        if (panel) {
            const preset = PANEL_SIZE_PRESETS[panel.tipo]

            // Apply minimum limits
            let newWidth = Math.max(width, preset.minWidth)
            let newHeight = Math.max(height, preset.minHeight)

            // Apply maximum limits if they exist
            if (preset.maxWidth !== undefined) {
                newWidth = Math.min(newWidth, preset.maxWidth)
            }
            if (preset.maxHeight !== undefined) {
                newHeight = Math.min(newHeight, preset.maxHeight)
            }

            panel.tamaño = {
                width: newWidth,
                height: newHeight
            }
        }
    }

    /**
     * Activa un panel y desactiva los demás
     */
    const activarPanel = (id: string) => {
        paneles.value.forEach(p => {
            p.activo = p.id === id
        })

        const panel = paneles.value.find(p => p.id === id)
        if (panel) {
            panel.zIndex = maxZIndex.value++
        }
    }

    /**
     * Desactiva todos los paneles
     */
    const desactivarTodos = () => {
        paneles.value.forEach(p => {
            p.activo = false
        })
    }

    /**
     * Limpia todos los paneles
     */
    const limpiarTodos = () => {
        paneles.value = []
        maxZIndex.value = 1
    }

    /**
     * Organiza los paneles en una cuadrícula inteligente
     * Respeta los tamaños actuales de cada panel y evita encimamientos
     */
    const autoOrganizarPaneles = () => {
        if (paneles.value.length === 0) return

        const padding = 20
        const margenInicial = 20
        const anchoTotalDisponible = 1400 // Ancho típico de viewport ajustado

        // Sort panels roughly by size (width * height) to attempt better packing
        const panelesOrdenados = [...paneles.value].sort((a, b) =>
            (a.tamaño.width * a.tamaño.height) - (b.tamaño.width * b.tamaño.height)
        );


        let columnas = 3; // Start with a default, adjust if needed
        const anchosColumna = Array(columnas).fill(margenInicial);
        const alturasColumna = Array(columnas).fill(margenInicial);


        panelesOrdenados.forEach((panel) => {
            // Find the column with the minimum height
            let colIndex = 0;
            let minAltura = alturasColumna[0];
            for (let i = 1; i < columnas; i++) {
                if (alturasColumna[i] < minAltura) {
                    minAltura = alturasColumna[i];
                    colIndex = i;
                }
            }

            // Calculate X position based on previous columns' max widths
            let xPos = margenInicial;
            for (let i = 0; i < colIndex; i++) {
                xPos += anchosColumna[i] + padding;
            }


            panel.posicion = {
                x: xPos,
                y: alturasColumna[colIndex]
            };

            // Update column height and max width for this column
            alturasColumna[colIndex] += panel.tamaño.height + padding;
            anchosColumna[colIndex] = Math.max(anchosColumna[colIndex], panel.tamaño.width);

        });

        // Re-assign sorted panel positions back to the original array to maintain reactivity order
        panelesOrdenados.forEach(sortedPanel => {
            const originalPanel = paneles.value.find(p => p.id === sortedPanel.id);
            if (originalPanel) {
                originalPanel.posicion = sortedPanel.posicion;
            }
        });

    }

    /**
     * Organiza los paneles en estilo Masonry (cascada) mejorado
     * Respeta los tamaños actuales y evita encimamientos
     */
    const autoOrganizarMasonry = () => {
        if (paneles.value.length === 0) return;

        const padding = 20;
        const margenInicial = 20;
        const anchoTotalDisponible = 1400; // Ancho típico ajustado

        // Determinar número de columnas basado en el ancho promedio
        const anchoProm = paneles.value.reduce((sum, p) => sum + p.tamaño.width, 0) / paneles.value.length;
        const numColumnas = Math.max(
            1,
            Math.min(4, Math.floor(anchoTotalDisponible / (anchoProm + padding)))
        );

        // Sort panels by height descending for a potentially better masonry fit
        const panelesOrdenados = [...paneles.value].sort((a, b) => b.tamaño.height - a.tamaño.height);


        interface ColumnaInfo {
            x: number;
            altura: number;
            anchoMax: number;
        }

        const columnas: ColumnaInfo[] = Array.from({ length: numColumnas }, (_, i) => ({
            x: 0, // Initial X, will be recalculated
            altura: margenInicial,
            anchoMax: 0,
        }));


        panelesOrdenados.forEach((panel) => {
            let colIndex = 0;
            let minAltura = columnas[0].altura;

            for (let i = 1; i < numColumnas; i++) {
                if (columnas[i].altura < minAltura) {
                    minAltura = columnas[i].altura;
                    colIndex = i;
                }
            }

            // Temporary position Y, X will be adjusted later
            panel.posicion = {
                x: colIndex, // Store column index temporarily in x
                y: columnas[colIndex].altura,
            };

            columnas[colIndex].altura += panel.tamaño.height + padding;
            columnas[colIndex].anchoMax = Math.max(columnas[colIndex].anchoMax, panel.tamaño.width);
        });

        // Calculate final X positions
        let xAcumulada = margenInicial;
        for(let i = 0; i < numColumnas; i++) {
            columnas[i].x = xAcumulada;
            xAcumulada += columnas[i].anchoMax + padding;
        }


        // Assign final X positions to panels
        panelesOrdenados.forEach((panel) => {
            const colIndex = panel.posicion.x; // Retrieve the stored column index
            panel.posicion.x = columnas[colIndex].x;

            // Update the original panel array
            const originalPanel = paneles.value.find(p => p.id === panel.id);
            if (originalPanel) {
                originalPanel.posicion = panel.posicion;
            }
        });
    }

    // ... (autoOrganizarCompacto remains the same) ...
    /**
     * Organiza los paneles en una cuadrícula compacta
     * Agrupa paneles similares en tamaño para mejor aprovechamiento del espacio
     */
    const autoOrganizarCompacto = () => {
        if (paneles.value.length === 0) return

        const padding = 20
        const margenInicial = 20

        // Ordenar paneles por altura (de menor a mayor) para mejor empaquetado
        const panelesOrdenados = [...paneles.value].sort(
            (a, b) => a.tamaño.height - b.tamaño.height
        )

        interface Fila {
            paneles: Panel[]
            y: number
            alturaMaxima: number
            anchoTotal: number
        }

        const filas: Fila[] = []
        const anchoMaximo = 1400

        panelesOrdenados.forEach((panel) => {
            let filaColocada = false

            // Intentar colocar en una fila existente
            for (const fila of filas) {
                const anchoNecesario = fila.anchoTotal + panel.tamaño.width + (fila.paneles.length > 0 ? padding : 0); // Add padding only if not the first element


                if (anchoNecesario <= anchoMaximo) {
                    fila.paneles.push(panel)
                    fila.anchoTotal = anchoNecesario
                    fila.alturaMaxima = Math.max(fila.alturaMaxima, panel.tamaño.height)
                    filaColocada = true
                    break
                }
            }

            // Si no cabe en ninguna fila, crear una nueva
            if (!filaColocada) {
                filas.push({
                    paneles: [panel],
                    y: 0, // Se calculará después
                    alturaMaxima: panel.tamaño.height,
                    anchoTotal: panel.tamaño.width
                })
            }
        })

        // Calcular posiciones Y de cada fila
        let yActual = margenInicial
        filas.forEach((fila) => {
            fila.y = yActual
            yActual += fila.alturaMaxima + padding
        })

        // Posicionar paneles dentro de sus filas
        filas.forEach((fila) => {
            let xActual = margenInicial

            fila.paneles.forEach((panel, index) => {
                // Centrar verticalmente en la fila (opcional, podrías alinear arriba también)
                const offsetY = (fila.alturaMaxima - panel.tamaño.height) / 2

                panel.posicion = {
                    x: xActual,
                    y: fila.y //+ offsetY // Align top for potentially cleaner look
                }

                // Update original panel
                const originalPanel = paneles.value.find(p => p.id === panel.id);
                if (originalPanel) {
                    originalPanel.posicion = panel.posicion;
                }


                xActual += panel.tamaño.width + padding
            })
        })
    }


    /**
     * Exporta la configuración de todos los paneles
     */
    const exportarPaneles = () => {
        return JSON.stringify(paneles.value, null, 2)
    }

    /**
     * Importa una configuración de paneles
     */
    const importarPaneles = (json: string) => {
        try {
            const panelesImportados = JSON.parse(json) as Panel[]
            // Basic validation (check if it's an array and has expected keys)
            if (!Array.isArray(panelesImportados) || (panelesImportados.length > 0 && !panelesImportados[0].id)) {
                throw new Error("Formato JSON inválido para importar paneles.");
            }

            paneles.value = panelesImportados

            const maxZ = Math.max(...panelesImportados.map(p => p.zIndex || 0), 0) // Ensure zIndex exists
            maxZIndex.value = maxZ + 1
            console.log('Paneles importados correctamente.');
        } catch (error) {
            console.error('Error al importar paneles:', error)
            // Consider using useToast() here if called from a Vue component context
        }
    }


    return {
        paneles,
        totalPaneles,
        agregarPanel,
        eliminarPanel,
        duplicarPanel,
        actualizarPanel,
        actualizarPosicion,
        actualizarTamano,
        activarPanel,
        desactivarTodos,
        limpiarTodos,
        autoOrganizarPaneles,
        autoOrganizarMasonry,
        autoOrganizarCompacto,
        exportarPaneles,
        importarPaneles
    }
}

