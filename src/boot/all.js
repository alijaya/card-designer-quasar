import VueShadowDom from 'vue-shadow-dom'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default ({ Vue }) => {
  Vue.use(VueShadowDom)
}