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

export const useSignalRInvoke = (methodName, {
  onResolve = (data) => {}
}) => {
  // noinspection JSCheckFunctionSignatures
  const signalrConnection = inject(signalRSymbol);

  const { connection, connectionStarted } = signalrConnection;

  // const execute = (d, cb) => {
  //   if (!connectionStarted) return Promise.reject()
  //   return connection.invoke(methodName, ...args)
  // }
  const promisify = func => (...args) =>
      new Promise((resolve, reject) =>
          func(...args)
      );

  const execute = promisify((...args) =>
      connection.invoke(methodName, ...args)
          .then(onResolve))

  return { execute }
};