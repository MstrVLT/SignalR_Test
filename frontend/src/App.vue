<script setup>
import {useSignalRStream} from './SignalRPlugin'
import {ref} from "vue";

const list = ref([])

useSignalRStream({
  onTodoCreated: (value) => list.value.push(value)
})
</script>

<template>
  <div class="flex">
    <div class="box">
      <div class="text-center space-y-2">
        <div class="space-y-0.5">
          <p class="text-lg text-black dark:text-white font-semibold mb-2">
            {{ JSON.stringify(list) }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.box {
  @apply
    py-8 px-8 inline-flex mx-auto
    bg-white dark:bg-gray-400 dark:bg-opacity-10
    rounded-xl shadow-md space-y-2;
}
</style>
