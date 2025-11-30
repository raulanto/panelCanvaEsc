<template>
    <div class="h-full flex flex-col items-center justify-center text-center">
<!--        <UIcon name="i-heroicons-map" class="w-16 h-16 text-primary mb-4" />-->
<!--        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">-->
<!--            Mapa-->
<!--        </h4>-->
<!--        <p class="text-sm text-gray-500 dark:text-gray-400">-->
<!--            Próximamente disponible-->
<!--        </p>-->
        <LMap
            :zoom="6"
            :center="[47.21322, -1.559482]"
            :use-global-leaflet="false"
        >
            <LTileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&amp;copy; <a href=&quot;https://www.openstreetmap.org/&quot;>OpenStreetMap</a> contributors"
                layer-type="base"
                name="OpenStreetMap"
            />
        </LMap>
    </div>
</template>

<script setup lang="ts">
interface Props {
    data?: any
}

defineProps<Props>()
</script>