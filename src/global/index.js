import Vue from 'vue'
import safeEval from 'src/utils/safeEval'
import {uid} from 'quasar'

const key = 'global'

export const Dict = Symbol('Dict')
export const ScopeWatcher = Symbol('ScopeWatcher')
export const ChildrenWatcher = Symbol('ChildrenWatcher')
export const Parent = Symbol('Parent')
export const Scope = Symbol('Scope')
export const RepeatIndex = Symbol('RepeatIndex')

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
        const watch = (node) => {
          console.log(node)
          // watch parent scope
          node[ScopeWatcher]?.()
          node[ScopeWatcher] = this.$watch(() => {
            return {
              parentScope: node[Parent]?.[Scope],
              repeat_expr: node.repeat_expr,
              repeatIndex: node.repeatIndex,
              repeatItem: node.repeatItem,
              props: node.props,
              klass: node.class, // not good should only watch node[Scope]
              style: node.style,
            }
          }, async ({parentScope, repeat_expr, repeatIndex, repeatItem, props, klass, style}) => {
            props.forEach(async item => await this.evalPropExpr(item, parentScope))

            const propsScope = {...parentScope}
            props.forEach(item => propsScope[item.name] = item.value)

            if (klass) klass.forEach(async item => await this.evalPropExpr(item, propsScope))
            if (style) style.forEach(async item => await this.evalPropExpr(item, propsScope))

            this.$set(node, Scope, propsScope)
          }, {immediate: true, deep: true})

          // watch children
          node[ChildrenWatcher]?.()
          if (node.children) {
            node[ChildrenWatcher] = this.$watch(() => node.children, 
              children => {
                children.forEach(child => {
                  this.$set(child, Parent, node)
                  watch(child)
                })
              }, {immediate: true})
          }
        }

        templates.forEach(temp => {
          watch(temp)
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
        children: [], 
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

    async evalPropExpr (prop, scope) {
      if (prop.expr) {
        try {
          prop.value = await safeEval(prop.expr, scope)
          this.$delete(prop, 'error')
        } catch (err) {
          this.$set(prop, 'error', err.message)
        }
      }
      return prop.value
    },

    async createScope (props, parentScope) {
      const scope = {}
      for (const prop of props) {
        scope[prop.name] = await this.evalPropExpr(prop, parentScope)
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
      return search(template.children)
    },
  },

  render (h) {
    return this.$slots.default
  }
}