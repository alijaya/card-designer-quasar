<template>
  <div class="column" v-contextmenu="getDirective(null)">

    <q-toolbar class="text-primary shadow-1">
      <q-toolbar-title>Template List</q-toolbar-title>
      <q-btn icon="add" flat round @click="openAdd" />
    </q-toolbar>

    <q-scroll-area class="col">
      <q-tree-draggable 
        v-model="templates"
        root-key="root"
        node-key="uid"
        label-key="name"
        :options="{group:'list', animation: 100, swapThreshold:0.65}"
        :selected.sync="selected"
        :header-directive="headerDirective"
        :header-class="headerClass"
        selected-color="white" />
    </q-scroll-area>
  </div>
</template>

<script>
import QTreeDraggable from 'components/QTreeDraggable'
import { mapState, mapGetters, mapMutations } from 'vuex'

export default {
  components: {
    QTreeDraggable
  },

  data () {
    return {
      popupTarget: false,
    }
  },

  computed: {
    templates: {
      get() {
        return this.$store.state.templates.templates
      },
      set(value) {
        this.updateIndex(value.root.children)
      }
    },
    selected: {
      get() {
        return this.$store.state.templates.selected
      },
      set(value) {
        this.updateSelected(value)
      }
    },
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
      this.deleteTemplate(node.uid)
    },

    openRename (evt, el, node) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: node.name, 
        onSave: value => {
          this.updateName({uid: node.uid, name: value})
        },
      })
    },

    openAdd (evt) {
      this.$openPopupEdit(evt, {
        initialValue: '', 
        onSave: value => {
          this.createTemplate({name: value})
        },
        floating: true,
      })
    },

    ...mapMutations('templates', [
      'createTemplate',
      'deleteTemplate',
      'updateName',
      'updateIndex',
      'updateSelected',
    ])
  },
}
</script>
