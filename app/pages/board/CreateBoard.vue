<script setup lang="ts">

import type {DropdownMenuItem} from '@nuxt/ui'
import NewBoard from "~/components/Dashboard/NewBoard.vue";


const items = [[{
    label: 'New mail',
    icon: 'i-lucide-send',
    to: '/inbox'
}, {
    label: 'New customer',
    icon: 'i-lucide-user-plus',
    to: '/customers'
}]] satisfies DropdownMenuItem[][]
definePageMeta({
    layout: 'board'

})

</script>

<template>
    <UDashboardPanel id="home" :ui="{ body: 'gap-0 sm:p-0 p-0' }">
        <template #header>
            <UDashboardNavbar title="Home" :ui="{ right: 'gap-3' }">
                <template #leading>
                    <UDashboardSidebarCollapse />
                </template>

                <template #right>


                    <UDropdownMenu :items="items">
                        <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
                    </UDropdownMenu>
                </template>
            </UDashboardNavbar>
        </template>

        <template #body>
            <DashboardContainer/>
        </template>
    </UDashboardPanel>
</template>
