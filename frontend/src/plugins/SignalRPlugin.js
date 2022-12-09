import { ref } from "vue";
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
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
    })
    .configureLogging(LogLevel.Information)
    .build(),
});

export default {
    install: (app, options) => {
        const signalrConnection = createSignalRConnection(options)
        
        app.provide(signalRSymbol, signalrConnection);

        const { connectionStarted, connection } = signalrConnection

        const start = () => {
          connection.start()
                .then(() => {
                  connectionStarted.value = true
                })
                .catch((err) => {
                  connectionStarted.value = false
                    setTimeout(start, 5000);
                })
        }

        connection.onclose(() => {
          connectionStarted.value = false
            start()
        })

        start()
    }
  }
