import { createApp } from 'vue'
import App from './App.vue'
import { signalRPlugin } from "./SignalRPlugin";
import 'virtual:windi.css'
import './style.css'

const signalr = signalRPlugin("http://localhost:5267/feed")
const app = createApp(App);
app.use(signalr)
app.mount("#app");