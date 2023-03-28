import {inject, reactive, shallowReactive, shallowRef} from "vue";
import { signalRSymbol } from "./index.js";
import {tryOnScopeDispose} from "@vueuse/shared";
import { createEventHook } from '@vueuse/core'

export const useSignalROn = (methodName, newMethod = () => {}) => {
  // noinspection JSCheckFunctionSignatures
  const signalrConnection = inject(signalRSymbol);

  const { connection } = signalrConnection;

  tryOnScopeDispose(() => {
    connection.off(methodName)
  })

  return connection.on(methodName, (...arg) => {
    newMethod(...arg);
  });
};

export const useSignalRInvoke = (methodName) => {
  // noinspection JSCheckFunctionSignatures
  const signalrConnection = inject(signalRSymbol);
  const { connection } = signalrConnection;

  const invokeResult = createEventHook()
  const invokeError = createEventHook()
  const execute = (...args) => {
    connection.invoke(methodName, ...args)
        .then(result => invokeResult.trigger(result))
        .catch(error => invokeError.trigger(error.message))
  }

  const data = shallowRef(null)
  invokeResult.on(d => {
    data.value = d
  })

  const error = shallowRef(null)
  invokeError.on(d => {
    error.value = d
  })

  return { execute, data, error, onInvokeResult: invokeResult.on, onInvokeError: invokeError.on, }
};