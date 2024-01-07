<script setup>
</script>

<template>
  <n-message-provider>
  <router-view :key="$route.fullPath"/>
  <content />
</n-message-provider>
</template>
