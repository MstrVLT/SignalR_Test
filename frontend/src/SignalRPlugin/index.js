import {computed, ref, watch} from "vue";
import * as signalR from "@microsoft/signalr";
import { tryOnScopeDispose } from '@vueuse/shared'

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://localhost:5267/feed")
    .configureLogging(signalR.LogLevel.Information)
    .build();


const connected = ref(false)

export const signalRPlugin = (app)=>{
    connection.on('newMessage', (sender, messageText) => {
        console.log(`${sender}:${messageText}`);
    });
    connection.start()
        .then(() => {
            console.log('connected!')
            connected.value = true
        })
        .catch(console.error);
}

export const useSignalRStream = ({onTodoCreated = () => {},}) => {
    const todoCreationError = ref('');

    const value = ref()

    watch(connected, (newConnected) => {
        if (newConnected) {
            const subscription = connection.stream("Counter", 10, 500)
                .subscribe({
                    next: (val) => {value.value = val},
                    complete: () => {
                    },
                    error: (err) => {
                        todoCreationError.value = err;
                    },
                })

            tryOnScopeDispose(() => {
                subscription.dispose()
            })
        }
    })

    watch(value, (nextValue) => { onTodoCreated(nextValue) })

    // Return the needed information
    return {
        todoCreationError,
    }
}
