import PopupEdit from 'components/PopupEdit'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default ({ Vue }) => {
  function getVM (currentEl) {
    const root = currentEl.$root
    let vm = root.__popupeditVM
    if (!vm) {
      const node = document.createElement('div')
      root.$el.appendChild(node)
      vm = new (Vue.extend(PopupEdit))({
        el: node,
        parent: root,
      })
      root.__popupeditVM = vm // cache
    }
    return vm
  }

  Vue.prototype.$openPopupEdit = function (event, opts) {
    const vm = getVM(this)
    vm.show(event, opts)
  }
}