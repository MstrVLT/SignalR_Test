<script setup>
import {useSignalRInvoke, useSignalROn} from './plugins/SignalRPlugin/connection.js'
import {ref} from "vue";

const list = ref([])

const {execute: testInvoke} = useSignalRInvoke('SendMessage', {
  onResolve: (data) => {
    console.log('onResolve', data)
  }
})

useSignalROn('newMessage', (msg, param2) => {
  list.value.push(`${msg}, ${param2}`)
});

</script>

<template>
  <div class="flex">
    <div class="box">
      <div class="text-center space-y-2">
        <div class="space-y-0.5">
          <p class="text-lg text-black dark:text-white font-semibold mb-2">
            {{ JSON.stringify(list) }}
          </p>
          <div class="relative rounded-xl overflow-auto p-8">
            <div class="flex items-center justify-center">

              <button
                  class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
                  type="button" @click="testInvoke('ger', 'der')">
                testInvoke
              </button>
            </div>
          </div>

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
