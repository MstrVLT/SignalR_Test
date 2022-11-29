<script setup>
import {useSignalRStream} from './SignalRPlugin'
import {ref} from "vue";

const list = ref([])

useSignalRStream({
  onTodoCreated: (value) => list.value.push(value)
})

</script>

<template>
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
  </div>
  {{ JSON.stringify(list) }}
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
