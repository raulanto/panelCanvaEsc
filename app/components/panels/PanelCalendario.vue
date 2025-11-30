<template>
    <div class="h-full flex flex-col items-center justify-center text-center">
        <UIcon name="i-heroicons-calendar-days" class="w-16 h-16 text-primary mb-4" />
        <h4 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Calendario
        </h4>
        <UCalendar :default-value="defaultValue" />
    </div>
</template>

<script setup lang="ts">
import {CalendarDate} from "@internationalized/date";
interface Props {
    data?: any
}
const defaultValue = ref(new CalendarDate(2022, 2, 6))
defineProps<Props>()
</script>