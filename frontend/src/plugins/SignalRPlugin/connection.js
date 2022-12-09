import { computed, ref, watch, provide, inject } from "vue";
import { signalRSymbol } from "./index.js";
import {tryOnScopeDispose} from "@vueuse/shared";

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

export const useSignalRInvoke = (methodName, ...args) => {
  // noinspection JSCheckFunctionSignatures
  const signalrConnection = inject(signalRSymbol);

  const { connection, connectionStarted } = signalrConnection;

  const execute = (...args) => {
    if (!connectionStarted) return Promise.reject()
    return connection.invoke(methodName, ...args)
  }

  return { execute }
};