import Vue from 'vue'
import safeEval from 'src/utils/safeEval'
import {uid} from 'quasar'

const key = 'global'

function watchAndPersist(arr) {
  const ret = {}
  arr.forEach(prop => {
    ret[prop] = {
      deep: true,
      handler() {
        const data = {}
        arr.forEach(prop => data[prop] = this.$data[prop])
        window.localStorage.setItem(key, JSON.stringify(data))
      }
    }
  })
  return ret
}

export const Dict = Symbol('Dict')
export const ScopeWatcher = Symbol('ScopeWatcher')
export const ChildrenWatcher = Symbol('ChildrenWatcher')
export const Parent = Symbol('Parent')
export const Scope = Symbol('Scope')

export default {
  data () {
    return {
      templates: [],
      selectedTemplateId: null,
      selectedNodeId: null,
    }
  },

  watch: {
    templates: {
      immediate: true,
      handler (templates) {
        const watch = (node, childrenProp) => {
          return this.$watch(() => node[childrenProp], children => {
            children.forEach(child => {
              this.$set(child, Parent, node)

              // watch parent scope
              child[ScopeWatcher]?.()
              child[ScopeWatcher] = this.$watch(() => {
                return {
                  props: child.props,
                  parentScope: node[Scope]
                }
              }, async ({props, parentScope}) => {
                this.$set(child, Scope, await this.createScope(child.props, parentScope))
              }, {immediate: true, deep: true})

              // watch children
              child[ChildrenWatcher]?.()
              if (child.children) child[ChildrenWatcher] = watch(child, 'children')
            })
          }, {immediate: true})
        }

        templates.forEach(temp => {
          temp[ChildrenWatcher]?.() // unwatch
          temp[ChildrenWatcher] = watch(temp, 'tree')
        })
      }
    },
  },

  computed: {
    selectedTemplate: {
      get () { // O(N), need to optimize this later
        return this.getTemplate(this.selectedTemplateId)
      },
      set (value) {
        this.selectedTemplateId = value?.id ?? null
      }
    },
    selectedNode: {
      get () { // O(N)
        return this.getNode(this.selectedTemplateId, this.selectedNodeId)
      },
      set (value) {
        this.selectedNodeId = value?.id ?? null
      }
    },
  },

  created () {
    Vue.prototype.$global = this

    let value = window.localStorage.getItem(key)
    if (value) {
      value = JSON.parse(value)
      for (const prop in value) {
        this[prop] = value[prop]
      }
    }

    const unwatch = this.$watch(() => {
      return {
        templates: this.templates,
        selectedTemplateId: this.selectedTemplateId,
        selectedNodeId: this.selectedNodeId
      }
    }, (newValue, oldValue) => {
      window.localStorage.setItem(key, JSON.stringify(newValue))
    }, {
      deep: true
    })

  },

  methods: {
    createTemplate (name) {
      const newTemplate = {
        id:uid(), 
        name: name, 
        props: [],
        class: [],
        style: [],
        tree: [], 
      }
      return newTemplate
    },

    createNode (type, name) {
      let newNode = {
        element: {
          element: 'div',
          element_expr: null,
        },
        text: {
          text: '',
          text_expr: null,
        },
        image: {
          image: '',
          image_expr: null,
        },
        template: {
          template: '',
        },
        switch: {
          switch: '',
          switch_expr: null,
        },
        context: {
          type: 'context',
        },
      }[type]
      if (newNode == null) return null

      if (['element', 'text', 'image', 'template'].includes(type)) { // hasClassStyle
        newNode.class = []
        newNode.style = []
      }

      if (['element', 'switch', 'context'].includes(type)) { // hasChildren
        newNode.children = []
      }

      newNode = {
        id: uid(),
        ...newNode,
        name: name, 
        type: type,
        repeat: null,
        repeat_expr: null,
        repeatIndex: 'index',
        repeatItem: 'item',
        state: '',
        props: [],
      }
      return newNode
    },

    async createScope (props, parentScope) {
      const scope = {}
      for (const prop of props) {
        if (prop.expr) {
          try {
            scope[prop.name] = await safeEval(prop.expr, parentScope)
          } catch (err) {
            // some err
          }
        } else {
          scope[prop.name] = prop.value
        }
      }
      return {...parentScope, ...scope}
    },

    getTemplate (templateId) {
      return this.templates.find(temp => temp.id == templateId) ?? null
    },

    getNode (templateId, nodeId) { // O(N)
      const template = this.getTemplate(templateId)
      if (template == null) return null
      const search = children => {
        let found = null;
        for (const child of children) {
          if (child.id == nodeId) {
            found = child
            break
          } else if (child.children) {
            found = search(child.children)
            if (found) break
          }
        }
        return found
      }
      return search(template.tree)
    },
  },

  render (h) {
    return this.$slots.default
  }
}