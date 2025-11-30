<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
    collapsed?: boolean
}>()

const teams = ref([{
    label: 'Github',
    icon: 'i-lucide-github',
    to: 'https://github.com/raulanto?tab=overview&from=2025-08-01&to=2025-08-31',
    target: "_blank",
}, {
    label: 'Portafolio',
to:'https://portafolio-rauantodev.vercel.app/',
    target: "_blank",
}])
const selectedTeam = ref(teams.value[0])

const items = computed<DropdownMenuItem[][]>(() => {
    return [teams.value.map(team => ({
        ...team,
        onSelect() {
            selectedTeam.value = team
        }
    })), [{
        label: 'Create team',
        icon: 'i-lucide-circle-plus'
    }, {
        label: 'Manage teams',
        icon: 'i-lucide-cog'
    }]]
})
</script>

<template>
    <UDropdownMenu
        :items="items"
        :content="{ align: 'center', collisionPadding: 12 }"
        :ui="{ content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)' }"
    >
        <UButton
            v-bind="{
        ...selectedTeam,
        label: collapsed ? undefined : selectedTeam?.label,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down'
      }"
            color="neutral"
            variant="ghost"
            block
            :square="collapsed"
            class="data-[state=open]:bg-elevated"
            :class="[!collapsed && 'py-2']"
            :ui="{
        trailingIcon: 'text-dimmed'
      }"
        />
    </UDropdownMenu>
</template>
