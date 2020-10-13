import ContextMenu from 'components/ContextMenu'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default ({ Vue }) => {
  function getVM (currentEl) {
    const root = currentEl.$root
    let vm = root.__contextmenuVM
    if (!vm) {
      const node = document.createElement('div')
      root.$el.appendChild(node)
      vm = new (Vue.extend(ContextMenu))({
        el: node,
        parent: root,
      })
      root.__contextmenuVM = vm // cache
    }
    return vm
  }

  function setValue (el, value) {
    if (el.__contextmenu) {
      const ctx = el.__contextmenu
      value = value || {}
      ctx.context = value.context
      ctx.menu = value.menu || []
    }
  }

  function destroy (el) {
    if (el.__contextmenu) {
      const ctx = el.__contextmenu
      el.removeEventListener('contextmenu', ctx.handler)
      delete el.__contextmenu
    }
  }

  Vue.prototype.$openContextMenu = function (event, opts) {
    const vm = getVM(this)
    vm.show(event, opts)
  }

  Vue.directive('contextmenu', {
    bind: (el, {value}, vnode) => {
      if (el.__contextmenu) {
        destroy(el)
      }

      const ctx = el.__contextmenu = {}
      setValue(el, value)
      
      ctx.handler = e => {
        e.preventDefault()
        e.stopPropagation()
        const vm = vnode.componentInstance || vnode.context
        vm.$openContextMenu(e, {
          el: el, 
          context: ctx.context, 
          menu: ctx.menu
        })
      }
      
      el.addEventListener('contextmenu', ctx.handler)
    },
    update: (el, {value}) => {
      setValue(el, value)
    },
    unbind: (el) => {
      destroy(el)
    }
  })
}