import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { signalRPlugin } from "./SignalRPlugin";

const signalr = signalRPlugin()

const app = createApp(App);

app.use(signalr)
app.mount("#app");