import {ref} from "vue";
import {
    HubConnectionBuilder,
    HttpTransportType,
    LogLevel,
} from "@microsoft/signalr";

export const signalRSymbol = Symbol("signalr");

const createSignalRConnection = (config) => ({
    connectionStarted: ref(false),
    connection: new HubConnectionBuilder()
        .withUrl(config.url, {
            transport: HttpTransportType.WebSockets,
        })
        .configureLogging(LogLevel.Information)
        .build(),
});

export default {
    install: (app, options) => {
        let {useWebLock, ...config} = options;

        let lockResolver;

        // https://learn.microsoft.com/en-gb/aspnet/core/signalr/javascript-client?view=aspnetcore-8.0&tabs=visual-studio#bsleep
        const lockPage = () => {
            if (useWebLock) {
                if (navigator && navigator.locks && navigator.locks.request) {
                    const promise = new Promise((res) => {
                        lockResolver = res;
                    });

                    navigator.locks.request('unique_lock_name', {mode: "shared"}, () => {
                        return promise;
                    });
                }
            }
        }

        const signalrConnection = createSignalRConnection(config)

        app.provide(signalRSymbol, signalrConnection);

        const {connectionStarted, connection} = signalrConnection

        const start = () => {
            connection.start()
                .then(() => {
                    connectionStarted.value = true;
                    lockPage();
                })
                .catch((err) => {
                    lockResolver?.();
                    connectionStarted.value = false;
                    setTimeout(start, 5000);
                })
        }
        // connection.invoke
        connection.onclose(() => {
            lockResolver?.();
            connectionStarted.value = false
            start()
        })

        start()
    }
}
