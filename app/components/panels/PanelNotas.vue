<template>
    <div class="h-full">
        <UTextarea
            v-model="contenidoNotas"
            placeholder="Escribe tus notas aquí..."
            :rows="10"
            autoresize
            variant="none"
            :ui="{ base: 'resize-none' }"
            @input="$emit('update:contenido', contenidoNotas)"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface NotasData {
    contenido?: string
}

interface Props {
    data: NotasData
}

const props = defineProps<Props>()

const emit = defineEmits<{
    'update:contenido': [value: string]
}>()

const contenidoNotas = ref(props.data?.contenido || '')

watch(() => props.data?.contenido, (newValue) => {
    if (newValue !== undefined) {
        contenidoNotas.value = newValue
    }
})
</script>