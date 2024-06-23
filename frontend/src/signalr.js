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
    if (toValue(connection)) {
        console.log('on')
        toValue(connection).on(methodName, ( ...arg ) => {
            methodHandler([...arg])
        })
    }

    if (getCurrentScope()) {
        onScopeDispose(() => {
            toValue(connection).off(methodName)
            console.log('off')
        })
    }
};

export function useSignalRInvoke(connection, methodName) {
    const data = ref(null)
    const error = ref(null)

    const execute = (...args) => {
        error.value = null
        if (toValue(connection)) {
            toValue(connection).invoke(toValue(methodName), ...args)
                .then((res) => (data.value = res))
                .catch((err) => (error.value = err))
        }
    }

    return { execute, data, error }
}