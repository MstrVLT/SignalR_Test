<script setup>
import {useSignalRInvoke, useSignalROn} from './plugins/SignalRPlugin/connection.js'
import {ref, watch} from "vue";

const list = ref([])

const { execute: executeVariadic, data} = useSignalRInvoke('SendMessageVariadic')

useSignalROn('newMessageVariadic', (msg, param2) => {
  list.value.push(`${msg}, ${param2}`)
});
const testInvokeVariadic = () => {
  let f = (Math.random() + 1).toString(36).substring(7);
  let s = (Math.random() + 1).toString(36).substring(7);

  executeVariadic(f,s)
}

const { execute: executeObject, onInvokeResult } = useSignalRInvoke('SendMessageObject')

useSignalROn('newMessageObject', (msg, param2) => {
  list.value.push(`${msg}, ${param2}`)
});
const testInvokeObject = () => {
  let f = (Math.random() + 1).toString(36).substring(7);
  let s = (Math.random() + 1).toString(36).substring(7);

  executeObject({
    firstMessage: f,
    secondMessage: s
  })
}

// Ref
watch(data, d => console.log('=>', d))

// Event
onInvokeResult((result) => {
  console.log('=>', result)
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
          <div class="relative rounded-xl overflow-auto p-8">
            <div class="flex items-center justify-center">
              <button
                  class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
                  type="button" @click="testInvokeObject">
                testInvokeObject
              </button>
              <button
                  class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
                  type="button" @click="testInvokeVariadic">
                testInvokeVariadic
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
