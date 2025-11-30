<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import NewBoard from "~/components/Dashboard/NewBoard.vue";

definePageMeta({
    layout: 'board'
})

const router = useRouter()

// Consumir la API simulada de tableros guardados
const { data: savedBoards, pending, error } = await useFetch('/api/myBoards')

// Función para navegar al tablero
const abrirTablero = (boardId: string) => {
    // Navegamos a la ruta '/board' pasando el ID como query param
    // Esto permitirá que DashboardContainer sepa qué configuración cargar
    router.push({ path: '/board/CreateBoard', query: { id: boardId } })
}

const getCardColor = (colorName: string) => {
    const colors: Record<string, string> = {
        blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400',
        orange: 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400',
        purple: 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400',
    }
    return colors[colorName] || colors.blue
}
</script>

<template>
    <UDashboardPanel id="home">
        <template #header>
            <UDashboardNavbar title="Inicio" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>
            </UDashboardNavbar>

            <UDashboardToolbar>
                <template #left>
                    <div class="flex flex-col">
                        <h1 class="text-xl font-semibold text-neutral-900 dark:text-white">Bienvenido de nuevo</h1>
                        <p class="text-sm text-neutral-500 dark:text-neutral-400">
                            Gestiona tus paneles de control o crea uno nuevo para comenzar.
                        </p>
                    </div>
                </template>
            </UDashboardToolbar>
        </template>

        <template #body>
            <div class="p-6 space-y-8">

                <!-- Sección 1: Crear Nuevo -->
                <section>
                    <div class="flex items-center gap-2 mb-4">
                        <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-primary" />
                        <h2 class="text-lg font-medium text-neutral-900 dark:text-white">Acciones Rápidas</h2>
                    </div>
                    <NewBoard />
                </section>

                <USeparator />

                <!-- Sección 2: Mis Tableros -->
                <section>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center gap-2">
                            <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5 text-neutral-500" />
                            <h2 class="text-lg font-medium text-neutral-900 dark:text-white">Mis Tableros Guardados</h2>
                            <UBadge v-if="savedBoards" :label="savedBoards.length" variant="subtle" size="xs" />
                        </div>

                        <!-- Filtros / Búsqueda opcional -->
                        <UInput
                            icon="i-heroicons-magnifying-glass"
                            placeholder="Buscar tablero..."
                            size="sm"

                            :ui="{ icon: { trailing: { pointer: '' } } }"
                        />
                    </div>

                    <!-- Estado de carga -->
                    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <USkeleton class="h-40 w-full" v-for="i in 3" :key="i" />
                    </div>

                    <!-- Estado de error -->
                    <UAlert
                        v-else-if="error"
                        title="Error al cargar tableros"
                        description="No se pudieron recuperar tus tableros guardados."
                        color="error"
                        variant="subtle"
                        icon="i-heroicons-exclamation-triangle"
                    />

                    <!-- Lista de Tableros (Grid) -->
                    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                        <UCard
                            v-for="board in savedBoards"
                            :key="board.id"
                            class="group cursor-pointer hover:ring-2 hover:ring-primary-500/50 transition-all duration-200 hover:-translate-y-1"
                            @click="abrirTablero(board.id)"
                        >
                            <template #header>
                                <div class="flex items-start justify-between">
                                    <div class="flex items-center gap-3">
                                        <div :class="`p-2 rounded-lg ${getCardColor(board.color)}`">
                                            <UIcon :name="board.icon" class="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 class="font-semibold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
                                                {{ board.title }}
                                            </h3>
                                            <p class="text-xs text-neutral-500 dark:text-neutral-400">
                                                {{ new Date(board.createdAt).toLocaleDateString() }}
                                            </p>
                                        </div>
                                    </div>

                                    <UDropdown :items="[[{ label: 'Editar', icon: 'i-heroicons-pencil-square' }, { label: 'Eliminar', icon: 'i-heroicons-trash', color: 'red' }]]">
                                        <UButton color="neutral" variant="ghost" icon="i-heroicons-ellipsis-vertical" @click.stop />
                                    </UDropdown>
                                </div>
                            </template>

                            <p class="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2 min-h-[40px]">
                                {{ board.description }}
                            </p>

                            <template #footer>
                                <div class="flex items-center justify-between text-xs text-neutral-500">
                                    <div class="flex items-center gap-1">
                                        <UIcon name="i-heroicons-rectangle-group" class="w-4 h-4" />
                                        <span>{{ board.panels.length }} Paneles</span>
                                    </div>
                                    <div class="flex items-center gap-1 group-hover:text-primary transition-colors">
                                        <span>Abrir</span>
                                        <UIcon name="i-heroicons-arrow-right" class="w-3 h-3" />
                                    </div>
                                </div>
                            </template>
                        </UCard>

                        <!-- Card para crear nuevo desde aquí también -->
                        <UButton
                            variant="ghost"
                            color="neutral"
                            class="h-full border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col items-center justify-center gap-2 p-6 hover:border-primary-500 hover:text-primary-500 transition-colors group"
                            to="/board/CreateBoard"
                        >
                            <div class="p-3 rounded-full bg-neutral-50 dark:bg-neutral-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                                <UIcon name="i-heroicons-plus" class="w-6 h-6" />
                            </div>
                            <span class="font-medium">Crear Tablero Vacío</span>
                        </UButton>

                    </div>
                </section>
            </div>
        </template>
    </UDashboardPanel>
</template>