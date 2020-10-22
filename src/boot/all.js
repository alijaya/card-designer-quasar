import VueShadowDom from 'vue-shadow-dom'
import VueAsyncComputed from 'vue-async-computed'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default ({ Vue }) => {
  Vue.use(VueShadowDom)
  Vue.use(VueAsyncComputed)
}