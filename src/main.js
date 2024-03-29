import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/theme-chalk/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import lib from './libs/index'
import request from './utils/request'
import storage from './utils/storage'
import api from './api'

console.log(import.meta.env.MODE)

const app = createApp(App)

app.directive('has', {
	beforeMount(el, binding) {
		//获取按钮权限
		let actionList = storage.getItem('actionList')
		let value = binding.value
		//盘点列表中是否有对应的按钮权限标识
		let hasPermission = actionList.includes(value)
		if (!hasPermission) {
			el.style = 'display:none'
			setTimeout(() => {
				el.parentNode.removeChild(el)
			}, 0)
		}
	},
})
app.config.globalProperties.$request = request
app.config.globalProperties.$storage = storage
app.config.globalProperties.$api = api

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}

app.use(router).use(store).use(lib).use(ElementPlus).mount('#app')
