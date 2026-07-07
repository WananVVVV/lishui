<template>
  <AdminShell>
    <router-view :key="$route.fullPath" />
  </AdminShell>
</template>

<script setup lang="ts">
import AdminShell from '@/layout/AdminShell.vue'
</script>
