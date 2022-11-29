import {computed, ref, watch, provide, inject} from "vue";
import * as signalR from "@microsoft/signalr";
import { tryOnScopeDispose } from '@vueuse/shared'

export const signalRSymbol = Symbol('NONE');

const createSignalRConnection = config => ({
    connected: ref(false),
    connection: new signalR.HubConnectionBuilder()
        .withUrl(config.url)
        .configureLogging(signalR.LogLevel.Information)
        .build()
});


export function signalRPlugin(options) {
    return (app) => {
        const signalRConnection = createSignalRConnection({url: "http://localhost:5267/feed"})

        app.provide(signalRSymbol, signalRConnection);

        signalRConnection.connection.on('newMessage', (sender, messageText) => {
            console.log(`${sender}:${messageText}`);
        });

        signalRConnection.connection.start()
            .then(() => {
                console.log('connected!')
                signalRConnection.connected.value = true
            })
            .catch(console.error);
    };
}


export const useSignalRStream = ({onTodoCreated = () => {},}) => {
    const streamError = ref('');
    const value = ref()

    // noinspection JSCheckFunctionSignatures
    const signalR = inject(signalRSymbol);

    watch(signalR.connected, (newConnected) => {
        if (!newConnected) return

        const subscription = signalR.connection.stream("Counter", 10, 500)
            .subscribe({
                next: (val) => {value.value = val},
                complete: () => {
                },
                error: (err) => {
                    streamError.value = err;
                },
            })

        tryOnScopeDispose(() => {
            subscription.dispose()
        })
    })

    watch(value, (nextValue) => { onTodoCreated(nextValue) })

    // Return the needed information
    return {
        streamError,
    }
}
