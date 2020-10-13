<template>
  <div class="column" v-contextmenu="getDirective()">

    <q-toolbar class="text-primary shadow-1">
      <q-toolbar-title>Tree View</q-toolbar-title>
    </q-toolbar>

    <q-scroll-area class="col">
      <q-tree-draggable 
        v-model="nodes" 
        root-key="root"
        node-key="uid" 
        label-key="name"
        default-expand-all
        :options="{group:'tree', animation: 100, swapThreshold:0.65}" 
        :selected.sync="selected" 
        :header-directive="headerDirective"
        :header-class="headerClass"
        selected-color="white">
        <template #default-header="prop">
          <NodeBadge 
            :type="prop.node.type" 
            :is-repeat="prop.node.repeat" 
            :has-state="getHasState(prop.node)"
            :state="getState(prop.node)"
            :is-state-selected="getIsStateSelected(prop.node)"
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
import { mapState, mapGetters, mapMutations } from 'vuex'
import { uid } from 'quasar'
import QTreeDraggable from 'components/QTreeDraggable'
import NodeBadge from 'components/NodeBadge'

export default {
  components: {
    QTreeDraggable,
    NodeBadge
  },
  computed: {
    nodes: {
      get () {
        return this.readSelectedTree
      },
      set (value) {
        const oldValue = this.nodes
        for (const uid in value) {
          const node = value[uid]
          if (node.children && node.children != oldValue[uid].children) {
            this.updateNodeIndex({
              uid: this.selectedTemplate,
              nodeUid: uid,
              index: node.children
            })
          }
        }
      }
    },

    selected: {
      get () {
        return this.$store.state.templates.selectedNode
      },
      set (value) {
        this.updateSelectedNode(value)
      }
    },

    ...mapState('templates', {
      selectedTemplate: 'selected'
    }),

    ...mapGetters('templates', [
      'readSelectedTree',
      'readHasState',
      'readIsStateSelected',
    ])
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
            disable: this.nodes == null,
            sub: [
              { label: "New Element", handler: this.onCtxNew('element') },
              { label: "New Text", handler: this.onCtxNew('text') },
              { label: "New Image", handler: this.onCtxNew('image') },
              { label: "New Instance", handler: this.onCtxNew('instance') },
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
        instance: node.template,
        switch: node.select,
        context: "",
      }[node.type]
    },

    getHasState (node) {
      return this.readHasState(this.selectedTemplate, node.uid)
    },

    getState (node) {
      return this.readHasState(this.selectedTemplate, node.uid) ? node.state : null
    },

    getIsStateSelected (node) {
      return this.readIsStateSelected(this.selectedTemplate, node.uid)
    },

    onCtxNew (type) {
      return (evt, el, context) => {
        // this.openAdd(evt, context, type)
        this.createNew(context, type, '')
      }
    },

    onCtxRename (evt, el, context) {
      this.openRename(evt, el, context)
    },

    onCtxDelete (evt, el, {node}) {
      this.deleteNode({
        uid: this.selectedTemplate,
        nodeUid: node.uid
      })
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
          url: '',
        },
        instance: {
          type: 'instance',
          template: '',
        },
        switch: {
          type: 'switch',
          children: [],
          select: '',
        },
        context: {
          type: 'context',
          children: [],
        },
      }
      let parentUid;
      if (node == null) {
        parentUid = 'root'
      } else if (['element', 'switch', 'context'].includes(node.type)) {
        parentUid = meta.key
      } else {
        parentUid = meta.parent.key
      }
      this.createNode({
        uid: this.selectedTemplate,
        parentUid: parentUid,
        node: {
          name: name,
          ...newNode[type]
        }
      })
    },

    openAdd (evt, context, type) {
      this.$openPopupEdit(evt, {
        initialValue: '', 
        onSave: value => this.createNew(context, type, value),
        floating: true,
      })
    },

    openRename (evt, el, {node}) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: node.name, 
        onSave: value => {
          this.updateNodeName({
            uid: this.selectedTemplate, 
            nodeUid: node.uid,
            name: value
          })
        },
      })
    },

    ...mapMutations('templates', [
      'updateSelectedNode',
      'updateNodeIndex',
      'updateNodeName',
      'createNode',
      'deleteNode',
    ])
  }
}
</script>
