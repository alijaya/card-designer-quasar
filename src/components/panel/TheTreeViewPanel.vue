<template>
  <div class="column" v-contextmenu="getDirective()">

    <q-toolbar class="text-primary shadow-1">
      <q-toolbar-title>Tree View</q-toolbar-title>
    </q-toolbar>

    <q-scroll-area class="col">
      <q-tree-draggable 
        ref="tree"
        v-if="global.selected_tree"
        v-model="global.selected_tree" 
        node-key="id"
        label-key="name"
        default-expand-all
        :draggable="{group:'tree', animation: 100, swapThreshold:0.65}" 
        :selected.sync="global.selected_node" 
        :header-directive="headerDirective"
        :header-class="headerClass"
        selected-color="white">
        <template #default-header="prop">
          <NodeBadge 
            :node-id="prop.node.id"
            class="q-mr-xs" />
          <div class="ellipsis" :class="{'text-grey':prop.node.name == ''}">
            {{prop.node.name != '' ? prop.node.name : getContentLabel(prop.node)}}
          </div>
        </template>
      </q-tree-draggable>
    </q-scroll-area>
  </div>
</template>

<script>
import global from 'src/global'
import { uid } from 'quasar'
import { remove } from 'src/utils'
import QTreeDraggable from 'components/QTreeDraggable'
import NodeBadge from 'components/NodeBadge'

export default {
  components: {
    QTreeDraggable,
    NodeBadge
  },
  data () {
    return {
      global: global,
    }
  },
  computed: {
  },

  methods: {
    headerClass (node, meta) {
      if (meta.selected) {
        return {
          'bg-primary': true
        }
      } else {
        return null
      }
    },

    headerDirective (node, meta) {
      return [
        {
          name: 'contextmenu',
          value: this.getDirective({node, meta})
        },
        {
          name: 'tooltip',
          value: this.getContentLabel(node),
          arg: 500,
          modifiers: {right: true},
        }
      ]
    },

    getDirective ({node, meta} = {}) {
      return {
        context: {node, meta},
        menu: [
          { 
            label: "New Node", 
            disable: this.global.selected_tree == null,
            sub: [
              { label: "New Element", handler: this.onCtxNew('element') },
              { label: "New Text", handler: this.onCtxNew('text') },
              { label: "New Image", handler: this.onCtxNew('image') },
              { label: "New Template", handler: this.onCtxNew('template') },
              { label: "New Switch", handler: this.onCtxNew('switch') },
              { label: "New Context", handler: this.onCtxNew('context') },
            ]
          },
          { separator: true },
          { label: "Rename", handler: this.onCtxRename, disable: node == null },
          { label: "Delete", handler: this.onCtxDelete, class:"text-negative", disable: node == null }
        ]
      }
    },

    getContentLabel (node) {
      return {
        element: node.element,
        text: node.text,
        image: node.url,
        template: node.template,
        switch: node.switch,
        context: "",
      }[node.type]
    },

    onCtxNew (type) {
      return (evt, el, context) => {
        this.createNew(context, type, '')
        if (context.node != null) this.$refs.tree.setExpanded(context.node.id, true)
      }
    },

    onCtxRename (evt, el, context) {
      this.openRename(evt, el, context)
    },

    onCtxDelete (evt, el, {node, meta}) {
      let children
      if (meta.parent == null) {
        children = this.global.selected_tree
      } else {
        children = meta.parent.node.children
      }
      remove(children, node)
    },

    createNew ({node, meta}, type, name) {
      const newNode = {
        element: {
          type: 'element',
          element: 'div',
          children: [],
        },
        text: {
          type: 'text',
          element: 'span',
          text: '',
        },
        image: {
          type: 'image',
          image: '',
        },
        template: {
          type: 'template',
          template: '',
        },
        switch: {
          type: 'switch',
          children: [],
          switch: '',
        },
        context: {
          type: 'context',
          children: [],
        },
      }
      const classStyle = {
        class: [],
        style: [],
      }
      let children;
      if (node == null) {
        children = this.global.selected_tree
      } else if (['element', 'switch', 'context'].includes(node.type)) {
        children = node.children
      } else {
        children = meta.parent.node.children
      }

      children.push({
        id: uid(), 
        name: name, 
        repeat: null,
        repeatIndex: 'index',
        repeatItem: 'item',
        state: '',
        props: [],
        ...(['element', 'text', 'image', 'template'].includes(type)? classStyle : {}),
        ...newNode[type]
      })
    },

    openRename (evt, el, {node}) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: node.name, 
        onSave: value => {
          node.name = value
        },
      })
    },
  }
}
</script>
