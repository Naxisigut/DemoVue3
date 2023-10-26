import { createApp } from '../../lib/demo-vue3-esm.js';
import App from './App.js';

const container = document.querySelector('#app')

createApp(App).mount(container)