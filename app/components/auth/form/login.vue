<script setup lang="ts"></script>

<template>
  <UCard class="w-full z-10 max-w-md">
    <template #header>
      <h2 class="">Login</h2>
    </template>

    <form class="space-y-4">
      <UFormField label="Email" name="email">
        <UInput
          type="email"
          placeholder="tu@email.com"
          icon="i-heroicons-envelope"
          size="lg"
        />
      </UFormField>

      <UFormField label="Password" name="password">
        <UInput
          type="password"
          placeholder="••••••••"
          icon="i-heroicons-lock-closed"
          size="lg"
        />
      </UFormField>

      <UButton block size="lg" to="/board"> Iniciar Sesión </UButton>

      <div class="text-center text-sm">
        ¿No tienes cuenta?
        <UButton variant="link" :padded="false"> Regístrate aquí </UButton>
      </div>
    </form>
  </UCard>
</template>

<style scoped></style>
