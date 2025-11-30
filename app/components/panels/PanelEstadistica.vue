<template>
    <div class="flex flex-col items-center justify-center h-full w-full p-4 overflow-hidden">
        <div
            class="font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent mb-3 text-center"
            :class="obtenerClaseTamano(String(data?.valor || ''))"
        >
            {{ data?.valor ?? '-' }}
        </div>

        <UBadge
            v-if="data?.subtitulo"
            :label="data.subtitulo"
            size="md"
            color="neutral"
            variant="soft"
            class="max-w-full truncate"
        />
    </div>
</template>

<script setup lang="ts">
import type { EstadisticaData } from '~/types/panel'

interface Props {
    data: EstadisticaData
}

defineProps<Props>()

// Ajustar tamaño de fuente según la longitud del valor para evitar desbordes
const obtenerClaseTamano = (valor: string) => {
    const longitud = valor.length
    if (longitud > 15) return 'text-xl'
    if (longitud > 12) return 'text-2xl'
    if (longitud > 8) return 'text-3xl'
    if (longitud > 5) return 'text-4xl'
    return 'text-5xl'
}
</script>