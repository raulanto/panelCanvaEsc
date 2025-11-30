import { computed, type Component } from 'vue'
import type { Panel } from '~/types/panel'
import {
    PanelEstadistica,
    PanelGrafico,
    PanelLista,
    PanelTabla,
    PanelCalendario,
    PanelMapa,
    PanelNotas
} from '~/components/panels'

/**
 * Composable para obtener el componente correcto según el tipo de panel
 */
export const usePanelComponent = (panel: Panel) => {
    const componentesMap: Record<string, Component> = {
        estadistica: PanelEstadistica,
        grafico: PanelGrafico,
        lista: PanelLista,
        tabla: PanelTabla,
        calendario: PanelCalendario,
        mapa: PanelMapa,
        notas: PanelNotas
    }

    const ComponenteDefault = {
        template: `
      <div class="h-full flex flex-col items-center justify-center text-center">
        <UIcon name="i-heroicons-document-chart-bar" 
               class="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" />
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Panel de información
        </h4>
        <UBadge :label="'Tipo: ' + tipo" size="sm" color="gray" variant="subtle" />
      </div>
    `,
        props: {
            data: Object,
            tipo: String
        }
    }

    const componentePanel = computed(() => {
        return componentesMap[panel.tipo] || ComponenteDefault
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

    return {
        componentePanel,
        obtenerEtiquetaTipo
    }
}