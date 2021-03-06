import Vue from 'vue'

import QIcon from 'quasar/src/components/icon/QIcon.js'
import QCheckbox from 'quasar/src/components/checkbox/QCheckbox.js'
import QSlideTransition from 'quasar/src/components/slide-transition/QSlideTransition.js'
import QSpinner from 'quasar/src/components/spinner/QSpinner.js'
import DarkMixin from 'quasar/src/mixins/dark.js'

import { stopAndPrevent } from 'quasar/src/utils/event.js'
import { shouldIgnoreKey } from 'quasar/src/utils/key-composition.js'
import cache from 'quasar/src/utils/cache.js'

import draggable from 'vuedraggable'

export default Vue.extend({
  name: 'QTreeDraggable',

  components: {
    draggable
  },

  mixins: [ DarkMixin ],

  props: {
    nodes: {
      type: Array,
      required: true
    },
    options: {
      type: Object,
      default: () => ({})
    },
    headerClass: {
      type: Function,
      default: node => {}
    },
    headerStyle: {
      type: Function,
      default: node => {}
    },
    headerListener: {
      type: Function,
      default: node => {}
    },
    headerDirective: {
      type: Function,
      default: node => {},
    },
    nodeKey: {
      type: [String, Function],
      required: true
    },
    labelKey: {
      type: [String, Function],
      default: 'label'
    },
    childrenKey: {
      type: [String, Function],
      default: 'children'
    },
    setChildren: {
      type: Function,
      default: (node, children, changes) => {
        if (typeof this.childrenKey == 'string') {
          node[this.childrenKey] = children
        }
      }
    },

    color: String,
    controlColor: String,
    textColor: String,
    selectedColor: String,

    icon: String,

    tickStrategy: {
      type: String,
      default: 'none',
      validator: v => ['none', 'strict', 'leaf', 'leaf-filtered'].includes(v)
    },
    ticked: Array, // sync
    expanded: Array, // sync
    selected: {}, // sync

    defaultExpandAll: Boolean,
    accordion: Boolean,

    filter: String,
    filterMethod: {
      type: Function,
      default (node, filter) {
        const filt = filter.toLowerCase()
        return this.__label(node) &&
          this.__label(node)?.toLowerCase().indexOf(filt) > -1
      }
    },

    duration: Number,
    noConnectors: Boolean,

    noNodesLabel: String,
    noResultsLabel: String
  },

  computed: {
    classes () {
      return `q-tree` +
        (this.noConnectors === true ? ` q-tree--no-connectors` : '') +
        (this.isDark === true ? ` q-tree--dark` : '') +
        (this.color !== void 0 ? ` text-${this.color}` : '')
    },

    hasSelection () {
      return this.selected !== void 0
    },

    computedIcon () {
      return this.icon || this.$q.iconSet.tree.icon
    },

    computedControlColor () {
      return this.controlColor || this.color
    },

    textColorClass () {
      if (this.textColor !== void 0) {
        return `text-${this.textColor}`
      }
    },

    selectedColorClass () {
      const color = this.selectedColor || this.color
      if (color) {
        return `text-${color}`
      }
    },

    meta () {
      const meta = {}

      const travel = (node, parent) => {
        const tickStrategy = node.tickStrategy || (parent ? parent.tickStrategy : this.tickStrategy)
        const
          key = this.__node(node),
          // isParent = (this.__children(node) && this.__children(node).length > 0),
          isParent = this.__children(node) != null,
          isLeaf = isParent !== true,
          selectable = node.disabled !== true && this.hasSelection === true && node.selectable !== false,
          expandable = node.disabled !== true && node.expandable !== false,
          hasTicking = tickStrategy !== 'none',
          strictTicking = tickStrategy === 'strict',
          leafFilteredTicking = tickStrategy === 'leaf-filtered',
          leafTicking = tickStrategy === 'leaf' || tickStrategy === 'leaf-filtered'

        let tickable = node.disabled !== true && node.tickable !== false
        if (leafTicking === true && tickable === true && parent && parent.tickable !== true) {
          tickable = false
        }

        let lazy = node.lazy
        if (lazy && this.lazy[key]) {
          lazy = this.lazy[key]
        }

        const m = {
          key,
          parent,
          isParent,
          isLeaf,
          lazy,
          disabled: node.disabled,
          link: node.disabled !== true && (selectable === true || (expandable === true && (isParent === true || lazy === true))),
          children: [],
          matchesFilter: this.filter ? this.filterMethod(node, this.filter) : true,

          selected: key === this.selected && selectable === true,
          selectable,
          expanded: isParent === true ? this.innerExpanded.includes(key) : false,
          expandable,
          noTick: node.noTick === true || (strictTicking !== true && lazy && lazy !== 'loaded'),
          tickable,
          tickStrategy,
          hasTicking,
          strictTicking,
          leafFilteredTicking,
          leafTicking,
          ticked: strictTicking === true
            ? this.innerTicked.includes(key)
            : (isLeaf === true ? this.innerTicked.includes(key) : false)
        }

        meta[key] = m
        
        if (isParent === true) {
          // m.children = this.__children(node).map(n => travel(n, m))
          m.children = this.__children(node).map(n => travel(this.value[n], m))

          if (this.filter) {
            if (m.matchesFilter !== true) {
              m.matchesFilter = m.children.some(n => n.matchesFilter)
            }
            else if (
              m.noTick !== true &&
              m.disabled !== true &&
              m.tickable === true &&
              leafFilteredTicking === true &&
              m.children.every(n => n.matchesFilter !== true || n.noTick === true || n.tickable !== true) === true
            ) {
              m.tickable = false
            }
          }

          if (m.matchesFilter === true) {
            if (m.noTick !== true && strictTicking !== true && m.children.every(n => n.noTick) === true) {
              m.noTick = true
            }

            if (leafTicking) {
              m.ticked = false
              m.indeterminate = m.children.some(node => node.indeterminate === true)
              m.tickable = m.tickable === true && m.children.some(node => node.tickable)

              if (m.indeterminate !== true) {
                const sel = m.children
                  .reduce((acc, meta) => meta.ticked === true ? acc + 1 : acc, 0)

                if (sel === m.children.length) {
                  m.ticked = true
                }
                else if (sel > 0) {
                  m.indeterminate = true
                }
              }

              if (m.indeterminate === true) {
                m.indeterminateNextState = m.children
                  .every(meta => meta.tickable !== true || meta.ticked !== true)
              }
            }
          }
        }

        return m
      }

      this.nodes.forEach(node => travel(node, null))
      return meta
    }
  },

  data () {
    return {
      lazy: {},
      innerTicked: this.ticked || [],
      innerExpanded: this.expanded || []
    }
  },

  watch: {
    ticked (val) {
      this.innerTicked = val
    },

    expanded (val) {
      this.innerExpanded = val
    }
  },

  methods: {
    __node (node) {
      if (typeof this.nodeKey == 'string') {
        return node?.[this.nodeKey]
      } else if (typeof this.nodeKey == 'function') {
        return this.nodeKey(node)
      }
    },

    __children (node) {
      if (typeof this.childrenKey == 'string') {
        return node?.[this.childrenKey]
      } else if (typeof this.childrenKey == 'function') {
        return this.childrenKey(node)
      }
    },

    __label (node) {
      if (typeof this.labelKey == 'string') {
        return node?.[this.labelKey]
      } else if (typeof this.labelKey == 'function') {
        return this.labelKey(node)
      }
    },

    getNodeByKey (key) {
      return this.value[key]
      // const reduce = [].reduce

      // const find = (result, node) => {
      //   if (result || !node) {
      //     return result
      //   }
      //   if (Array.isArray(node) === true) {
      //     return reduce.call(Object(node), find, result)
      //   }
      //   if (this.__node(node) === key) {
      //     return node
      //   }
      //   if (this.__children(node)) {
      //     return find(null, this.__children(node))
      //   }
      // }

      // return find(null, this.nodes)
    },

    getTickedNodes () {
      return this.innerTicked.map(key => this.getNodeByKey(key))
    },

    getExpandedNodes () {
      return this.innerExpanded.map(key => this.getNodeByKey(key))
    },

    isExpanded (key) {
      return key && this.meta[key]
        ? this.meta[key].expanded
        : false
    },

    collapseAll () {
      if (this.expanded !== void 0) {
        this.$emit('update:expanded', [])
      }
      else {
        this.innerExpanded = []
      }
    },

    expandAll () {
      const
        expanded = this.innerExpanded,
        travel = node => {
          // if (this.__children(node) && this.__children(node).length > 0) {
          if (this.__children(node)) {
            if (node.expandable !== false && node.disabled !== true) {
              expanded.push(this.__node(node))
              this.__children(node).forEach(key => travel(this.value[key]))
            }
          }
        }

      this.nodes.forEach(key => travel(this.value[key]))

      if (this.expanded !== void 0) {
        this.$emit('update:expanded', expanded)
      }
      else {
        this.innerExpanded = expanded
      }
    },

    setExpanded (key, state, node = this.getNodeByKey(key), meta = this.meta[key]) {
      if (meta.lazy && meta.lazy !== 'loaded') {
        if (meta.lazy === 'loading') {
          return
        }

        this.$set(this.lazy, key, 'loading')
        this.$emit('lazy-load', {
          node,
          key,
          done: children => {
            this.lazy[key] = 'loaded'
            if (children) {
              this.$set(node, this.childrenKey, children)
            }
            this.$nextTick(() => {
              const m = this.meta[key]
              if (m && m.isParent === true) {
                this.__setExpanded(key, true)
              }
            })
          },
          fail: () => {
            this.$delete(this.lazy, key)
          }
        })
      }
      else if (meta.isParent === true && meta.expandable === true) {
        this.__setExpanded(key, state)
      }
    },

    __setExpanded (key, state) {
      let target = this.innerExpanded
      const emit = this.expanded !== void 0

      if (emit === true) {
        target = target.slice()
      }

      if (state) {
        if (this.accordion) {
          if (this.meta[key]) {
            const collapse = []
            if (this.meta[key].parent) {
              this.meta[key].parent.children.forEach(m => {
                if (m.key !== key && m.expandable === true) {
                  collapse.push(m.key)
                }
              })
            }
            else {
              this.nodes.forEach(node => {
                const k = this.__node(node)
                if (k !== key) {
                  collapse.push(k)
                }
              })
            }
            if (collapse.length > 0) {
              target = target.filter(k => collapse.includes(k) === false)
            }
          }
        }

        target = target.concat([ key ])
          .filter((key, index, self) => self.indexOf(key) === index)
      }
      else {
        target = target.filter(k => k !== key)
      }

      if (emit === true) {
        this.$emit(`update:expanded`, target)
      }
      else {
        this.innerExpanded = target
      }
    },

    isTicked (key) {
      return key && this.meta[key]
        ? this.meta[key].ticked
        : false
    },

    setTicked (keys, state) {
      let target = this.innerTicked
      const emit = this.ticked !== void 0

      if (emit === true) {
        target = target.slice()
      }

      if (state) {
        target = target.concat(keys)
          .filter((key, index, self) => self.indexOf(key) === index)
      }
      else {
        target = target.filter(k => keys.includes(k) === false)
      }

      if (emit === true) {
        this.$emit(`update:ticked`, target)
      }
    },

    __getSlotScope (node, meta, key) {
      const scope = { tree: this, node, key, color: this.color, dark: this.isDark }

      Object.defineProperty(scope, 'expanded', {
        get: () => { return meta.expanded },
        set: val => { val !== meta.expanded && this.setExpanded(key, val) },
        configurable: true,
        enumerable: true
      })
      Object.defineProperty(scope, 'ticked', {
        get: () => { return meta.ticked },
        set: val => { val !== meta.ticked && this.setTicked([ key ], val) },
        configurable: true,
        enumerable: true
      })

      return scope
    },

    __getChildren (h, nodes) {
      return (
        this.filter
          ? nodes.filter(n => this.meta[this.__node(n)].matchesFilter)
          // ? nodes.filter(key => this.meta[key].matchesFilter)
          : nodes
      ).map(child => this.__getNode(h, child))
      // ).map(childKey => this.__getNode(h, this.value[childKey]))
    },

    __getNodeMedia (h, node) {
      if (node.icon !== void 0) {
        return h(QIcon, {
          staticClass: `q-tree__icon q-mr-sm`,
          props: { name: node.icon, color: node.iconColor }
        })
      }
      const src = node.img || node.avatar
      if (src) {
        return h('img', {
          staticClass: `q-tree__${node.img ? 'img' : 'avatar'} q-mr-sm`,
          attrs: { src }
        })
      }
    },

    __getNode (h, node) {
      const
        key = this.__node(node),
        meta = this.meta[key],
        header = node.header
          ? this.$scopedSlots[`header-${node.header}`] || this.$scopedSlots['default-header']
          : this.$scopedSlots['default-header']

      const children = meta.isParent === true
        ? this.__getChildren(h, this.__children(node))
        : []

      // const isParent = children.length > 0 || (meta.lazy && meta.lazy !== 'loaded') || !node[this.leafKey]
      const isParent = meta.isParent || (meta.lazy && meta.lazy !== 'loaded')

      let body = node.body
        ? this.$scopedSlots[`body-${node.body}`] || this.$scopedSlots['default-body']
        : this.$scopedSlots['default-body']
      const slotScope = header !== void 0 || body !== void 0
        ? this.__getSlotScope(node, meta, key)
        : null

      if (body !== void 0) {
        body = h('div', { staticClass: 'q-tree__node-body relative-position' }, [
          h('div', { class: this.textColorClass }, [
            body(slotScope)
          ])
        ])
      }

      return h('div', {
        key,
        staticClass: 'q-tree__node relative-position',
        class: { 'q-tree__node--parent': isParent, 'q-tree__node--child': !isParent }
      }, [
        h('div', {
          staticClass: 'q-tree__node-header relative-position row no-wrap items-center',
          class: {
            'q-tree__node--link q-hoverable q-focusable': meta.link,
            'q-tree__node--selected': meta.selected,
            'q-tree__node--disabled': meta.disabled,
            ...this.headerClass(node, meta)
          },
          style: this.headerStyle(node, meta),
          attrs: { tabindex: meta.link ? 0 : -1 },
          on: {
            click: (e) => {
              this.__onClick(node, meta, e)
            },
            keypress: e => {
              if (shouldIgnoreKey(e) !== true) {
                if (e.keyCode === 13) { this.__onClick(node, meta, e, true) }
                else if (e.keyCode === 32) { this.__onExpandClick(node, meta, e, true) }
              }
            },
            ...this.headerListener(node, meta),
          },
          directives: this.headerDirective(node, meta),
        }, [
          h('div', { staticClass: 'q-focus-helper', attrs: { tabindex: -1 }, ref: `blurTarget_${meta.key}` }),

          meta.lazy === 'loading'
            ? h(QSpinner, {
              staticClass: 'q-tree__spinner q-mr-xs',
              props: { color: this.computedControlColor }
            })
            : (
              isParent === true
                ? h(QIcon, {
                  staticClass: 'q-tree__arrow q-mr-xs',
                  class: { 'q-tree__arrow--rotate': meta.expanded },
                  props: { name: this.computedIcon },
                  on: {
                    click: e => {
                      this.__onExpandClick(node, meta, e)
                    }
                  }
                })
                : null
            ),

          meta.hasTicking === true && meta.noTick !== true
            ? h(QCheckbox, {
              staticClass: 'q-mr-xs',
              props: {
                value: meta.indeterminate === true ? null : meta.ticked,
                color: this.computedControlColor,
                dark: this.isDark,
                dense: true,
                keepColor: true,
                disable: meta.tickable !== true
              },
              on: {
                keydown: stopAndPrevent,
                input: v => {
                  this.__onTickedClick(meta, v)
                }
              }
            })
            : null,

          h('div', {
            'staticClass': 'q-tree__node-header-content col row no-wrap items-center',
            class: meta.selected ? this.selectedColorClass : this.textColorClass
          }, [
            header
              ? header(slotScope)
              : [
                this.__getNodeMedia(h, node),
                h('div', this.__label(node))
              ]
          ])
        ]),

        isParent === true
          ? h(QSlideTransition, {
            props: { duration: this.duration },
            on: cache(this, 'slide', {
              show: () => { this.$emit('after-show') },
              hide: () => { this.$emit('after-hide') }
            })
          }, [
            h('div', {
              staticClass: 'q-tree__node-collapsible',
              class: this.textColorClass,
              directives: [{ name: 'show', value: meta.expanded }]
            }, [
              body,

              h('draggable', {
                staticClass: 'q-tree__children',
                class: { 'q-tree__node--disabled': meta.disabled },
                props: {
                  value: this.__children(node),
                },
                attrs: {...this.options},
                on: {
                  input: value => {
                    this.__onChanged(node, value)
                  },
                },
              }, children)
            ])
          ])
          : body
      ])
    },

    __onChanged (node, newChildren) {
      this.setChildren(node, newChildren)
    },

    __blur (key) {
      const blurTarget = this.$refs[`blurTarget_${key}`]
      blurTarget !== void 0 && blurTarget.focus()
    },

    __onClick (node, meta, e, keyboard) {
      keyboard !== true && this.__blur(meta.key)

      if (this.hasSelection) {
        if (meta.selectable) {
          this.$emit('update:selected', meta.key !== this.selected ? meta.key : null)
        }
      }
      else {
        this.__onExpandClick(node, meta, e, keyboard)
      }

      if (typeof node.handler === 'function') {
        node.handler(node)
      }
    },

    __onExpandClick (node, meta, e, keyboard) {
      if (e !== void 0) {
        stopAndPrevent(e)
      }
      keyboard !== true && this.__blur(meta.key)
      this.setExpanded(meta.key, !meta.expanded, node, meta)
    },

    __onTickedClick (meta, state) {
      if (meta.indeterminate === true) {
        state = meta.indeterminateNextState
      }
      if (meta.strictTicking) {
        this.setTicked([ meta.key ], state)
      }
      else if (meta.leafTicking) {
        const keys = []
        const travel = meta => {
          if (meta.isParent) {
            if (state !== true && meta.noTick !== true && meta.tickable === true) {
              keys.push(meta.key)
            }
            if (meta.leafTicking === true) {
              meta.children.forEach(travel)
            }
          }
          else if (
            meta.noTick !== true &&
            meta.tickable === true &&
            (meta.leafFilteredTicking !== true || meta.matchesFilter === true)
          ) {
            keys.push(meta.key)
          }
        }
        travel(meta)
        this.setTicked(keys, state)
      }
    },
  },

  render (h) {
    const children = this.__getChildren(h, this.nodes)

    return h(
      'draggable', {
        class: this.classes,
        props: {
          value: this.nodes,
          // options: this.options,
        },
        attrs: {...this.options},
        on: {
          // change: value => {
          //   this.__onChanged(null, value)
          // },
          input: value => {
            this.__onChanged(null, value)
          },
        }
      },
      children.length === 0
        ? (
          this.filter
            ? this.noResultsLabel || this.$q.lang.tree.noResults
            : this.noNodesLabel || this.$q.lang.tree.noNodes
        )
        : children
    )
  },

  created () {
    this.defaultExpandAll === true && this.expandAll()
  }
})
