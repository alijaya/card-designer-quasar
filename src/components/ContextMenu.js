import {QMenu, QList, QIcon, QSeparator, QItem, QItemSection, ClosePopup} from 'quasar'

export default {
  name: 'ContextMenu',

  directives: {
    'close-popup': ClosePopup
  },

  data () {
    return {
      el: false,
      context: {},
      menu: [],
      currentEvent: null,
      defaultEl: document.createElement('div')
    }
  },

  methods: {
    show (evt, { el, context, menu }) {
      this.currentEvent = evt
      this.el = el
      this.context = context
      this.menu = menu
      this.$nextTick(() => {
        this.$refs.menu.show(evt || undefined)
      })
    },
    hide (evt) {
      this.$refs.menu.hide(evt || undefined)
    },
    onClick (evt, item) {
      if (item.handler) {
        item.handler(this.currentEvent, this.el, this.context)
      }
    },

    renderList (h, menu) {
      return h(QList, menu.map(item => {
        if (item.hide) {
          return null
        } else if (item.separator) {
          return h(QSeparator)
        } else {
          return h(QItem, {
            class: item.class,
            style: item.style,
            props: {
              clickable: true,
              disable: item.disable,
            },
            directives: [!item.sub ? {name: 'close-popup'} : {}],
            on: {
              click: evt => this.onClick(evt, item)
            }
          }, [
            h(QItemSection, item.label),
            item.sub ? h(QItemSection, {props:{side:true}}, [
              h(QIcon, {props:{name:"arrow_right"}})
            ]) : null,
            item.sub && !item.disable ? h(QMenu, {
              props:{
                anchor: "top right",
                self: "top left",
              }
            }, [this.renderList(h, item.sub)]) : null
          ])
        }
      }))
    },

  },

  render (h) {
    return h(QMenu, {
      ref: "menu",
      props: {
        contextMenu: true,
        noParentEvent: true,
        target: this.defaultEl,
      },
      on: {
        'contextmenu': evt => evt.preventDefault()
      }
    }, [this.renderList(h, this.menu)])
  }
}