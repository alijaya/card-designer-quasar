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
      styleSheet: "",
    }
  },

  watch: {
    templates: {
      immediate: true,
      handler (templates) {
        const watch = (node) => {
          // watch parent scope
          node[ScopeWatcher]?.()
          node[ScopeWatcher] = this.$watch(() => {
            return {
              parentScope: node[Parent]?.[Scope],
              repeat_expr: node.repeat_expr,
              index: node[RepeatIndex],
              repeatIndex: node.repeatIndex,
              repeatItem: node.repeatItem,
              props: node.props,

              klass: node.class, // not good should only watch node[Scope]
              style: node.style,

              element_expr: node.element_expr, // type: element
              text_expr: node.text_expr, // type: text
              image_expr: node.image_expr, // type: image
              switch_expr: node.switch_expr, // type: switch
            }
          }, async ({parentScope}) => {
            await this.evalNode(node, parentScope)
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
        selectedNodeId: this.selectedNodeId,
        styleSheet: this.styleSheet,
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

    async evalPropExpr (prop, scope, type) {
      if (prop.expr != null) {
        try {
          const value = await safeEval(prop.expr, scope)
          
          if ((type == 'String' || type == 'Select') && typeof value != 'string') {
            this.$set(prop, 'error', `${prop.name} should be String`)
            prop.value = String(value) // typecast
          } else if (type == 'Number' && typeof value != 'number') {
            this.$set(prop, 'error', `${prop.name} should be Number`)
            prop.value = Number(value) // typecast
          } else if (type == 'Boolean' && typeof value != 'boolean') {
            this.$set(prop, 'error', `${prop.name} should be Boolean`)
            prop.value = Boolean(value) // typecast
          } else {
            this.$delete(prop, 'error')
            prop.value = value
          }

        } catch (err) {
          this.$set(prop, 'error', err.message)
        }
      }
      return prop
    },

    async evalPropNameExpr (obj, propName, scope, type) {
      const result = await this.evalPropExpr({
        name: propName,
        value: obj[propName],
        expr: obj[propName+'_expr']
      }, scope, type)
      obj[propName] = result.value
      if (result.error) this.$set(obj, propName+'_error', result.error)
      else this.$delete(obj, propName+'_error')
    },

    async evalNode (node, parentScope) {
      if (node.repeat_expr != null) await this.evalPropNameExpr(node, 'repeat', parentScope, null)

      const repeatScope = {...parentScope}
      if (node.repeat) {
        if (node.repeatIndex) repeatScope[node.repeatIndex] = node[RepeatIndex] ?? 0
        if (node.repeatItem) {
          if (typeof node.repeat == 'number') {
            repeatScope[node.repeatItem] = node[RepeatIndex] ?? 0
          } else if (Array.isArray(node.repeat)) {
            repeatScope[node.repeatItem] = node.repeat[node[RepeatIndex] ?? 0]
          }
        }
      }

      node.props.forEach(async item => await this.evalPropExpr(item, repeatScope, item.type))

      const propsScope = {...repeatScope}
      node.props.forEach(item => propsScope[item.name] = item.value)

      if (node.class != null) node.class.forEach(async item => await this.evalPropExpr(item, propsScope, 'Boolean'))
      if (node.style != null) node.style.forEach(async item => await this.evalPropExpr(item, propsScope, 'String'))

      if (node.element_expr != null) await this.evalPropNameExpr(node, 'element', propsScope, 'String')
      if (node.text_expr != null) await this.evalPropNameExpr(node, 'text', propsScope, 'String')
      if (node.image_expr != null) await this.evalPropNameExpr(node, 'image', propsScope, 'String')
      if (node.switch_expr != null) await this.evalPropNameExpr(node, 'switch', propsScope, 'String')

      this.$set(node, Scope, propsScope)
      return node
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