<template>
  <q-expansion-item 
    default-opened expand-separator switch-toggle-side 
    v-contextmenu="getStyleCM(null)">
    <template #header>
      <q-item-section class="text-h6">Style</q-item-section>
      <q-item-section side>
        <q-btn flat round icon="add" color="primary" size="sm" @click.stop="onCreateStyle" />
      </q-item-section>
    </template>
    <draggable v-model="node.style" :animation="100" handle=".handle">
      <PropExpr v-for="item, index in node.style"
        v-contextmenu="getStyleCM(item)"
        handle-class="handle"
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
  name: "StyleProperty",
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
    getStyleCM (style) {
      return {
        context: style,
        menu: [
          { label: "New Style", handler: this.onCreateStyle },
          { separator: true },
          { label: "Toggle Expr", handler: this.onToggleStyleExpr, disable: style == null },
          { label: "Rename", handler: this.onUpdateStyleName, disable: style == null },
          { label: "Delete", handler: this.onDeleteStyle, class:"text-negative", disable: style == null }
        ]
      }
    },

    onCreateStyle (evt) {
      this.$openPopupEdit(evt, {
        initialValue: '', 
        onSave: value => {
          this.node.style.push({name: value, value: '', expr: null})
        },
        floating: true,
      })
    },

    onToggleStyleExpr (evt, el, style) {
      style.expr = style.expr != null ? null : ''
    },

    onUpdateStyleName (evt, el, style) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: style.name, 
        onSave: value => {
          style.name = value
        },
      })
    },

    onDeleteStyle (evt, el, style) {
      remove(this.node.style, style)
    },
  }
}
</script>