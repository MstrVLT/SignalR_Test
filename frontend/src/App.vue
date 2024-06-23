<script setup>
import {ref, watch} from "vue";
import {useSignalR, useSignalRInvoke, useSignalROn} from "./signalr.js";

const list = ref([])

// first feed

const { start, connection, status } = useSignalR('http://localhost:5267/feed-first', { immediate: false })

// warn in console No client method with the name 'newmessage' found. 

useSignalROn(connection, 'newMessageVariadic', ([msg, param2]) => {
  list.value.push(`${msg}, ${param2}`)
});

const { execute: executeVariadic, data, resultEvent } = useSignalRInvoke(connection, 'SendMessageVariadic')

// Ref
watch(data, d => console.log('=>', d))

// test method
const testInvokeVariadic = () => {
  let f = (Math.random() + 1).toString(36).substring(7);
  let s = (Math.random() + 1).toString(36).substring(7);
  executeVariadic(f,s)
}

resultEvent(([msg, param2]) => console.log('newMessageVariadic from first feed =>', msg, param2))

// second feed

const { connection: connectionSecond } = useSignalR('http://localhost:5267/feed-second', { immediate: true })

const { onResult } = useSignalROn(connectionSecond, 'newMessage');

onResult(([msg, param2]) => {
  console.log('newMessageVariadic from second feed =>', msg, param2)
});

</script>

<template>
  <button
      class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500"
      type="button" @click="start">
    connect
  </button>
  <div class="text-white">{{status}}</div>
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
