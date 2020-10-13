import Tooltip from 'components/Tooltip'

// "async" is optional;
// more info on params: https://quasar.dev/quasar-cli/cli-documentation/boot-files#Anatomy-of-a-boot-file
export default ({ Vue }) => {
  function getVM (currentEl) {
    const root = currentEl.$root
    let vm = root.__tooltipVM
    if (!vm) {
      const node = document.createElement('div')
      root.$el.appendChild(node)
      vm = new (Vue.extend(Tooltip))({
        el: node,
        parent: root,
      })
      root.__tooltipVM = vm // cache
    }
    return vm
  }

  function setValue (el, {value, arg, modifiers}) {
    if (el.__tooltip) {
      const ctx = el.__tooltip
      ctx.value = value
      ctx.delay = parseFloat(arg) || 0
      ctx.pos = Object.keys(modifiers)[0]
    }
  }

  function destroy (el) {
    if (el.__tooltip) {
      const ctx = el.__tooltip
      el.removeEventListener('mouseenter', ctx.handler)
      delete el.__tooltip
    }
  }

  Vue.prototype.$openTooltip = function (event, opts, delayed) {
    const vm = getVM(this)
    vm.show(event, opts, delayed)
  }

  Vue.directive('tooltip', {
    bind: (el, binding, vnode) => {
      if (el.__tooltip) {
        destroy(el)
      }

      const ctx = el.__tooltip = {}
      setValue(el, binding)
      
      ctx.handler = e => {
        const vm = vnode.componentInstance || vnode.context
        vm.$openTooltip(e, {
          el: el, 
          value: ctx.value,
          delay: ctx.delay,
          pos: ctx.pos,
        }, true)
      }
      
      el.addEventListener('mouseenter', ctx.handler)
    },
    update: (el, binding) => {
      setValue(el, binding)
    },
    unbind: (el) => {
      destroy(el)
    }
  })
}