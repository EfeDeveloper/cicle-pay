import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import { useAuthStore } from '@/stores/authStore'
import './style.css'
import App from './App.vue'

async function bootstrap() {
	const app = createApp(App)
	const pinia = createPinia()

	app.use(pinia)

	const authStore = useAuthStore(pinia)
	await authStore.initAuthListener()

	app.use(router)
	await router.isReady()
	app.mount('#app')
}

bootstrap()

