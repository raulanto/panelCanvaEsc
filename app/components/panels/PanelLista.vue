<template>
    <div class="space-y-2">
        <UCard
            v-for="item in data.items"
            :key="item.id"
            :ui="{ body: { padding: 'p-2' } }"
        >
            <div class="flex items-center gap-3">
                <UAvatar
                    :text="item.id.toString()"
                    size="sm"
                    color="primary"
                />
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {{ item.titulo }}
                    </p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">
                        {{ item.estado }}
                    </p>
                </div>
                <UBadge
                    :label="item.estado"
                    size="xs"
                    :color="obtenerColorEstado(item.estado)"
                    variant="subtle"
                />
            </div>
        </UCard>
    </div>
</template>

<script setup lang="ts">
interface ListaItem {
    id: number
    titulo: string
    estado: string
}

interface ListaData {
    items: ListaItem[]
}

interface Props {
    data: ListaData
}

defineProps<Props>()

const obtenerColorEstado = (estado: string): string => {
    if (estado === 'Completado') return 'success'
    if (estado === 'En progreso') return 'warning'
    return 'gray'
}
</script>