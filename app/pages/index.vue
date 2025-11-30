<template>
  <UBanner title="Proyecto en Construccion" />
  <div class="min-h-screen relative">
    <!-- Auth Pages -->
    <div class="min-h-screen flex relative">
      <!-- Left Side - Auth Forms -->
      <div
        class="w-full lg:w-1/2 relative flex items-center justify-center p-8 fondo"
      >
        <!-- Grid Background -->
        <div class="absolute h-full w-full">
          <div
            class="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"
          ></div>
        </div>
        <ULink
          to="https://portafolio-rauantodev.vercel.app/"
          class="absolute top-6 left-6 text-2xl font-bold z-10"
          >rauantodev
        </ULink>
        <UColorModeButton class="absolute top-6 right-6" />
        <Login />
      </div>

      <!-- Right Side - Image -->
      <div
        class="hidden lg:block lg:w-1/2 bg-cover bg-center"
        style="
          background-image: url('https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=712');
        "
      >
        <div class="h-full bg-opacity-50 flex items-center justify-center">
          <!--          <div class="text-center text-white px-12">-->
          <!--            <h2 class="text-4xl font-bold mb-6">Your Title</h2>-->
          <!--            <p class="text-xl">-->
          <!--              Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis,-->
          <!--              expedita.-->
          <!--            </p>-->
          <!--          </div>-->
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Login from '~/components/auth/form/login.vue';

// Meta de la página

definePageMeta({
  layout: false,
});
</script>

<style>
.fondo {
  background: radial-gradient(
    ellipse 85% 90% at 50% 0%,
    rgb(119, 29, 216),
    transparent 70%
  );
}
</style>
