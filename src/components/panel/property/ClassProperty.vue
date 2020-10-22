<template>
  <q-expansion-item 
    default-opened expand-separator switch-toggle-side
    v-contextmenu="getClassCM(null)" >
    <template #header>
      <q-item-section class="text-h6">Class</q-item-section>
      <q-item-section side>
        <q-btn flat round icon="add" color="primary" size="sm" @click.stop="onCreateClass" />
      </q-item-section>
    </template>
    <draggable v-model="node.class" :animation="100" handle=".handle">
      <PropExpr v-for="item, index in node.class"
        v-contextmenu="getClassCM(item)"
        handle-class="handle"
        type="Boolean"
        :label="item.name"
        v-model="item.value"
        :expr.sync="item.expr"
        :error="item.error" />
    </draggable>
  </q-expansion-item>
</template>

<script>
import {remove} from 'src/utils'
import draggable from 'vuedraggable'
import PropExpr from 'components/PropExpr'

export default {
  name: "ClassProperty",
  components: {
    draggable,
    PropExpr,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getClassCM (klass) {
      return {
        context: klass,
        menu: [
          { label: "New Class", handler: this.onCreateClass },
          { separator: true },
          { label: "Toggle Expr", handler: this.onToggleClassExpr, disable: klass == null },
          { label: "Rename", handler: this.onUpdateClassName, disable: klass == null },
          { label: "Delete", handler: this.onDeleteClass, class:"text-negative", disable: klass == null }
        ]
      }
    },

    onCreateClass (evt) {
      this.$openPopupEdit(evt, {
        initialValue: '', 
        onSave: value => {
          this.node.class.push({name: value, value: true, expr: null})
        },
        floating: true,
      })
    },

    onToggleClassExpr (evt, el, klass) {
      klass.expr = klass.expr != null ? null : ''
    },

    onUpdateClassName (evt, el, klass) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: klass.name, 
        onSave: value => {
          klass.name = value
        },
      })
    },

    onDeleteClass (evt, el, klass) {
      remove(this.node.class, klass)
    },

  }
}
</script>