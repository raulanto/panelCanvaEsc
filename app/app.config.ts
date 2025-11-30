export default defineAppConfig({
    ui: {
        colors: {
            primary: 'violet',
            neutral: 'neutral'
        },

        formField: {
            slots: {
                container: "flex flex-col gap-2",
                help: "m-0",
            },
        },
        toaster: {
            slots: {
                viewport: "z-[10001]",
            },
        },
    },
    toaster: {
        position: 'top-center' as const,
        duration: 5000,
        max: 5,
        expand: true
    },
})
