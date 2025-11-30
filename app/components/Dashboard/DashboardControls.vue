<template>
  <div class="dashboard-controls flex flex-wrap items-center gap-3 mb-0.5">
    <UTooltip text="Mostrar Mapa">
      <UButton
        icon="i-heroicons-map"
        @click="$emit('toggle-map')"
        :color="mapaVisible ? 'primary' : 'neutral'"
        :variant="mapaVisible ? 'solid' : 'soft'"
      />
    </UTooltip>

    <UFieldGroup>
      <UTooltip text="Modo Pan: Mover el canvas">
        <UButton
          icon="i-heroicons-hand-raised"
          :color="modoPanActivo ? 'primary' : 'neutral'"
          :variant="modoPanActivo ? 'solid' : 'soft'"
          @click="$emit('toggle-pan')"
        >
          {{ modoPanActivo ? "Pan ON" : "Pan OFF" }}
        </UButton>
      </UTooltip>

      <UTooltip text="Modo Drag: Arrastrar paneles">
        <UButton
          icon="i-heroicons-arrows-pointing-out"
          :color="modoDragActivo ? 'success' : 'neutral'"
          :variant="modoDragActivo ? 'solid' : 'soft'"
          @click="$emit('toggle-drag')"
        >
          {{ modoDragActivo ? "Drag ON" : "Drag OFF" }}
        </UButton>
      </UTooltip>
    </UFieldGroup>

    <!-- Grupo de controles de vista -->
    <UFieldGroup size="md" orientation="horizontal">
      <UTooltip text="Resetear vista (R)">
        <UButton
          icon="i-heroicons-arrow-path"
          variant="soft"
          @click="$emit('reset-view')"
        />
      </UTooltip>

      <div
        class="border-l border-neutral-300 dark:border-neutral-600 h-8"
      ></div>

      <UTooltip text="Alejar (-)">
        <UButton
          icon="i-heroicons-magnifying-glass-plus"
          variant="soft"
          @click="$emit('zoom-out')"
        />
      </UTooltip>

      <UButton
        :label="`${zoomPercentage}%`"
        variant="soft"
        disabled
        class="min-w-[70px]"
      />

      <UTooltip text="Acercar (+)">
        <UButton
          icon="i-heroicons-magnifying-glass-minus"
          variant="soft"
          @click="$emit('zoom-in')"
        />
      </UTooltip>
    </UFieldGroup>

    <!-- Dropdown para agregar paneles con búsqueda -->
      <UPopover :popper="{ placement: 'bottom-end' }" mode="clik" :open-delay="500" :close-delay="300">
      <UButton
        icon="i-heroicons-plus-circle"
        trailing-icon="i-heroicons-chevron-down"
        color="primary"
        size="md"
      >
        Agregar Panel
      </UButton>

      <template #content>
        <div class="p-2 w-72">
          <!-- Búsqueda -->
          <UInput
            v-model="busqueda"
            icon="i-heroicons-magnifying-glass"
            placeholder="Buscar tipo de panel..."
            class="mb-2 w-full"
          />

          <!-- Lista de paneles filtrados -->
          <div class="max-h-[400px] overflow-y-auto">
            <div
              v-if="panelesFiltrados.length === 0"
              class="text-center py-8 text-neutral-500"
            >
              <UIcon
                name="i-heroicons-face-frown"
                class="w-8 h-8 mx-auto mb-2"
              />
              <p class="text-sm">No se encontraron paneles</p>
            </div>

            <UButton
              v-for="tipo in panelesFiltrados"
              :key="tipo.value"
              @click="agregarPanel(tipo.value)"
              variant="ghost"
              block
              class="justify-start mb-1"
            >
              <template #leading>
                <span class="text-2xl">{{ tipo.icono }}</span>
              </template>

              <div class="flex-1 text-left">
                <div
                  class="text-sm font-medium text-neutral-900 dark:text-white"
                >
                  {{ tipo.label }}
                </div>
                <div class="text-xs text-neutral-500 dark:text-neutral-400">
                  {{ tipo.descripcion }}
                </div>
              </div>

              <template #trailing>
                <UKbd>{{ tipo.atajo }}</UKbd>
              </template>
            </UButton>
          </div>

          <!-- Separador -->
          <USeparator class="my-2" />

          <!-- Acciones rápidas -->
          <div class="flex gap-2">
            <UButton
              icon="i-heroicons-sparkles"
              label="Plantilla"
              variant="ghost"
              size="sm"
              block
              @click="agregarPlantilla"
            />
            <UButton
              icon="i-heroicons-squares-plus"
              label="Panel personalizado"
              variant="ghost"
              size="sm"
              block
              @click="abrirCrearCustom"
            />
          </div>
        </div>
      </template>
    </UPopover>

    <!-- Botón de limpiar -->
    <UTooltip text="Eliminar todos los paneles" v-if="totalPaneles > 0">
      <UButton
        icon="i-heroicons-trash"
        variant="soft"
        @click="confirmarLimpiar"
      >
        Limpiar ({{ totalPaneles }})
      </UButton>
    </UTooltip>

    <UPopover>
      <UTooltip text="Organizar paneles">
        <UButton icon="i-heroicons-squares-2x2" variant="soft" />
      </UTooltip>

      <template #content>
        <div class="p-2 w-48">
          <UButton
            icon="i-heroicons-view-columns"
            label="Grid 3 columnas"
            variant="ghost"
            block
            class="justify-start mb-1"
            @click="$emit('auto-organize')"
          />
          <UButton
            icon="i-heroicons-squares-plus"
            label="Layout destacado"
            variant="ghost"
            block
            class="justify-start"
            @click="$emit('auto-organize-masonry')"
          />
        </div>
      </template>
    </UPopover>

  </div>

  <!-- Modal de confirmación mejorado -->
  <UModal v-model:open="mostrarModalConfirmacion">
    <template #header>
      <div class="flex items-center gap-3">
        <div
          class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
        >
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-6 h-6 text-red-600 dark:text-red-400"
          />
        </div>
        <div>
          <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
            Eliminar todos los paneles
          </h3>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Esta acción no se puede deshacer
          </p>
        </div>
      </div>
    </template>
    <template #body>
      <div class="space-y-3">
        <UAlert
          icon="i-heroicons-information-circle"
          variant="subtle"
          title="¡Atención!"
          :description="`Estás a punto de eliminar ${totalPaneles} ${
            totalPaneles === 1 ? 'panel' : 'paneles'
          }.`"
        />

        <div class="text-sm text-neutral-600 dark:text-neutral-300">
          <p>Se eliminarán:</p>
          <ul class="list-disc list-inside mt-2 space-y-1">
            <li>Todos los paneles del dashboard</li>
            <li>Sus configuraciones personalizadas</li>
            <li>Los datos no guardados</li>
          </ul>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-3">
        <UButton
          label="Cancelar"
          variant="ghost"
          @click="mostrarModalConfirmacion = false"
        />
        <UButton
          label="Sí, eliminar todo"
          icon="i-heroicons-trash"
          @click="confirmarYLimpiar"
        />
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import {computed, ref} from "vue";
import type {PanelType} from "~/types/panel";

interface Props {
  totalPaneles: number;
  zoom: number;
  modoPanActivo: boolean;
  modoDragActivo: boolean;
  mapaVisible: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "add-panel": [tipo: PanelType];
  "reset-view": [];
  "zoom-in": [];
  "zoom-out": [];
  "clear-all": [];
  "auto-organize": [];
  "auto-organize-masonry": [];
  "toggle-pan": [];
  "toggle-drag": [];
  "toggle-map": [];
}>();

const toast = useToast();
const mostrarModalConfirmacion = ref(false);
const busqueda = ref("");

// Tipos de paneles con atajos de teclado
const tiposPaneles = [
  {
    value: "estadistica",
    label: "Estadística",
    icono: "📊",
    descripcion: "Números y métricas",
    atajo: "E",
  },
  {
    value: "grafico",
    label: "Gráfico",
    icono: "📈",
    descripcion: "Barras y visualización",
    atajo: "G",
  },
  {
    value: "lista",
    label: "Lista",
    icono: "📝",
    descripcion: "Tareas y elementos",
    atajo: "L",
  },
  {
    value: "tabla",
    label: "Tabla",
    icono: "📋",
    descripcion: "Datos tabulares",
    atajo: "T",
  },
  {
    value: "mapa",
    label: "Mapa",
    icono: "🗺️",
    descripcion: "Ubicaciones",
    atajo: "M",
  },
  {
    value: "calendario",
    label: "Calendario",
    icono: "📅",
    descripcion: "Eventos y fechas",
    atajo: "C",
  },
  {
    value: "notas",
    label: "Notas",
    icono: "📄",
    descripcion: "Texto libre",
    atajo: "N",
  },
];

// Paneles filtrados por búsqueda
const panelesFiltrados = computed(() => {
  if (!busqueda.value) return tiposPaneles;

  const query = busqueda.value.toLowerCase();
  return tiposPaneles.filter(
    (tipo) =>
      tipo.label.toLowerCase().includes(query) ||
      tipo.descripcion.toLowerCase().includes(query)
  );
});

const zoomPercentage = computed(() => Math.round(props.zoom * 100));

const agregarPanel = (tipo: PanelType) => {
  emit("add-panel", tipo);
  busqueda.value = "";


};

const confirmarLimpiar = () => {
  mostrarModalConfirmacion.value = true;
};

const confirmarYLimpiar = () => {
  emit("clear-all");
  mostrarModalConfirmacion.value = false;

  toast.add({
    title: "Paneles eliminados",
    description: `Se eliminaron ${props.totalPaneles} paneles correctamente`,
    icon: "i-heroicons-trash",
  });
};

// Funciones de acciones adicionales
const agregarPlantilla = () => {
  toast.add({
    title: "Próximamente",
    description: "La función de plantillas estará disponible pronto",
    icon: "i-heroicons-sparkles",
  });
};

const abrirCrearCustom = () => {
  toast.add({
    title: "Próximamente",
    description: "El editor de paneles personalizados estará disponible pronto",
    icon: "i-heroicons-squares-plus",
  });
};
</script>

<style scoped>

</style>
