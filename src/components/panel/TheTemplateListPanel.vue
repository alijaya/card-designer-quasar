<template>
  <div class="column" v-contextmenu="getDirective(null)">

    <q-toolbar class="text-primary shadow-1">
      <q-toolbar-title>Template List</q-toolbar-title>
      <q-btn icon="add" flat round @click="openAdd" />
    </q-toolbar>

    <q-scroll-area class="col">
      <q-tree-draggable 
        v-model="global.templates"
        :selected.sync="global.selected_template"
        :header-directive="headerDirective"
        :header-class="headerClass"
        :draggable="{group:'list', animation: 100, swapThreshold:0.65}"
        selected-color="white"
        node-key="id"
        label-key="name" />
    </q-scroll-area>
  </div>
</template>

<script>
import global from 'src/global'
import {remove} from 'src/utils'
import QTreeDraggable from 'components/QTreeDraggable'
import {uid} from 'quasar'

export default {
  components: {
    QTreeDraggable
  },

  data () {
    return {
      global: global,
    }
  },

  computed: {
  },

  methods: {

    getDirective (node) {
      return {
        context: node,
        menu: [
          { label: "New Template", handler: this.onCtxNew },
          { separator: true },
          { label: "Rename", handler: this.onCtxRename, disable: node == null },
          { label: "Delete", handler: this.onCtxDelete, class:"text-negative", disable: node == null }
        ]
      }
    },

    headerClass (node, meta) {
      if (meta.selected) {
        return {
          'bg-primary': true,
        }
      } else {
        return null
      }
    },

    headerDirective (node, meta) {
      return [{
        name: 'contextmenu',
        value: this.getDirective(node)
      }]
    },

    onCtxNew (evt, el, node) {
      this.openAdd(evt)
    },

    onCtxRename (evt, el, node) {
      this.openRename(evt, el, node)
    },

    onCtxDelete (evt, el, node) {
      remove(this.global.templates, node)
    },

    openRename (evt, el, node) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: node.name, 
        onSave: value => {
          node.name = value
        },
      })
    },

    openAdd (evt) {
      this.$openPopupEdit(evt, {
        initialValue: '', 
        onSave: value => {
          this.global.templates.push({id:uid(), name: value, tree: []})
        },
        floating: true,
      })
    },
  },
}
</script>
