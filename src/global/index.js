import Vue from 'vue'

const el = document.createElement('div')
el.style.display = 'none'
document.body.appendChild(el)

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

export default new Vue({
  el: el,
  data () {
    return {
      templates: [],
      selected_template_id: null,
      selected_node_id: null,
    }
  },

  watch: {
  },

  computed: {
    selected_template: {
      get () { // O(N), need to optimize this later
        return this.templates.find(template => template.id == this.selected_template_id) ?? null
      },
      set (value) {
        this.selected_template_id = value?.id ?? null
      }
    },
    selected_tree: {
      get () {
        return this.selected_template?.tree ?? null
      },
      set (value) {
        if (this.selected_template) this.selected_template.tree = value
      }
    },
    selected_node_parent: {
      get () { // O(N)
        return this.get_node_parent(this.selected_tree, this.selected_node_id)
      }
    },
    selected_node: {
      get () { // O(N)
        return this.get_node(this.selected_tree, this.selected_node_id)
      },
      set (value) {
        this.selected_node_id = value?.id ?? null
      }
    }
  },

  created () {
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
        selected_template_id: this.selected_template_id,
        selected_node_id: this.selected_node_id
      }
    }, (newValue, oldValue) => {
      window.localStorage.setItem(key, JSON.stringify(newValue))
    }, {
      deep: true
    })
  },

  methods: {
    get_node (tree, node_id) { // O(N)
      if (tree == null) return null
      const search = children => {
        let found = null;
        for (const child of children) {
          if (child.id == node_id) {
            found = child
            break
          } else if (child.children) {
            found = search(child.children)
            if (found) break
          }
        }
        return found
      }
      return search(tree)
    },
    get_node_parent (tree, node_id) { // O(N)
      if (tree == null) return null
      const search = (children, parent) => {
        let found = null;
        for (const child of children) {
          if (child.id == node_id) {
            found = parent
            break
          } else if (child.children) {
            found = search(child.children, child)
            if (found) break
          }
        }
        return found
      }
      return search(tree, null)
    }
  },

  render (h) {
    return null
  }
})