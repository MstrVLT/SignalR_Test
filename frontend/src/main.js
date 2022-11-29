import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { signalRPlugin } from "./SignalRPlugin";

createApp(App)
    .use(signalRPlugin)
    .mount("#app");