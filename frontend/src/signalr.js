// signalr.js
import {
    ref,
    markRaw,
    readonly,
    toValue,
    getCurrentScope,
    onScopeDispose,
} from 'vue'
import {HttpTransportType, HubConnectionBuilder, HubConnectionState, LogLevel} from "@microsoft/signalr";

const createSignalRConnection = (url, options) => new HubConnectionBuilder()
        .withUrl(url, {
            transport: options?.transport ? options.transport : HttpTransportType.WebSockets,
        })
        .configureLogging(LogLevel.Information)
        .build()

// https://github.com/vuejs/apollo/blob/v4/packages/vue-apollo-composable/src/util/useEventHook.ts
function useEventHook() {
    const fns = []

    function on(fn) {
        fns.push(fn)
        return {
            off: () => off(fn)
        }
    }

    function off(fn) {
        const index = fns.indexOf(fn)
        if (index !== -1) {
            fns.splice(index, 1)
        }
    }

    function trigger(...params) {
        for (const fn of fns) {
            fn(...params)
        }
    }

    function getCount() {
        return fns.length
    }

    return {
        on,
        off,
        trigger,
        getCount
    }
}

export { HubConnectionState }

export function useSignalR(url, options =  {}) {
    const {
        useWebLock = true,
        immediate = true,
        ...signalROptions
    } = options

    let lockResolver;

    // https://learn.microsoft.com/en-gb/aspnet/core/signalr/javascript-client?view=aspnetcore-8.0&tabs=visual-studio#bsleep
    const lockPage = () => {
        if (useWebLock) {
            if (navigator && navigator.locks && navigator.locks.request) {
                const promise = new Promise((res) => lockResolver = res);
                navigator.locks.request('udnique_lock_name', {mode: "shared"}, async () => {
                    return await promise;
                }).then(() => console.log('unlock'))
                console.log('lock');
            }
        }
    }
    const status = ref(HubConnectionState.Disconnected)
    
    const connection = markRaw(createSignalRConnection(url, signalROptions))

    const start = async () => {
        try {
            await connection.start();
            status.value = connection?.state ? connection.state : HubConnectionState.Disconnected;
            lockPage();
        } catch (err) {
            lockResolver?.();
            status.value = connection?.state ? connection.state : HubConnectionState.Disconnected;
            setTimeout(start, 5000);
        }
    }

    const automaticReconnect = ref(true)

    connection.onclose(async () => {
        lockResolver?.();
        status.value = connection?.state ? connection.state : HubConnectionState.Disconnected;
        console.log('onclose',status.value);
        if (toValue(automaticReconnect)) {
            await start()
        }
    });

    connection.onreconnected(_ => status.value = connection?.state ? connection.state : HubConnectionState.Disconnected)
    connection.onreconnecting(_ => status.value = connection?.state ? connection.state : HubConnectionState.Disconnected)

    immediate && start()

    if (getCurrentScope()) {
        onScopeDispose(() => {
            automaticReconnect.value = false
            connection.stop()
        })
    }

    return { connection: readonly(connection), status: readonly(status), start }
}

export const useSignalROn = (connection, methodName, methodHandler = () => {}) => {
    const resultEvent = useEventHook()

    if (toValue(connection)) {
        console.log('on', connection.connectionId)
        toValue(connection).on(methodName, ( ...arg ) => {
            resultEvent.trigger([...arg])
            methodHandler([...arg])
        })
    }

    if (getCurrentScope()) {
        onScopeDispose(() => {
            toValue(connection).off(methodName)
            console.log('off', connection.connectionId)
        })
    }

    return {
        onResult: resultEvent.on
    }
};

export function useSignalRInvoke(connection, methodName) {
    const data = ref(null)
    const error = ref(null)

    const resultEvent = useEventHook()
    const errorEvent = useEventHook()

    const execute = (...args) => {
        error.value = null
        if (toValue(connection)) {
            toValue(connection).invoke(toValue(methodName), ...args)
                .then((res) => {
                    resultEvent.trigger(res)
                    data.value = res
                })
                .catch((err) => {
                    errorEvent.trigger(err)
                    error.value = err
                })
        }
    }

    return { execute, data, error, resultEvent: resultEvent.on, errorEvent: errorEvent.on }
}