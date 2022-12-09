import { createApp } from 'vue'
import App from './App.vue'
import SignalRPlugin from "./plugins/SignalRPlugin";
import 'virtual:windi.css'
import './style.css'

const app = createApp(App);
app.use(SignalRPlugin, {
    url: 'http://localhost:5267/feed'
  })
app.mount("#app");