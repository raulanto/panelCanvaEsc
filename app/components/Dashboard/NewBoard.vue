<script setup lang="ts">

</script>

<template>
    <div class="  px-2">
        <UCard class="w-72" >
            <template #default>
                <NuxtLink to="/board/CreateBoard" class="text-center p-4 ">
                    <h2 class="text-lg font-semibold mb-2"><UIcon name="i-lucide-circle-plus" class="size-10"/></h2>
                    <p class="text-gray-600">Crear un nuevo Panel.</p>
                </NuxtLink>
            </template>
        </UCard>
    </div>

</template>

<style scoped>

</style>