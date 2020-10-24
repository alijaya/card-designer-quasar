<template>
  <q-expansion-item default-opened expand-separator switch-toggle-side>
    <template #header>
      <q-item-section class="text-h6">Main</q-item-section>
    </template>

    <template v-if="node.type == 'element'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Element"
        v-model="node.element"
        :expr.sync="node.element_expr"
        :error="node.element_error" />
    </template>
    <template v-if="node.type == 'text'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Text"
        v-model="node.text"
        :expr.sync="node.text_expr"
        :error="node.text_error" />
    </template>
    <template v-if="node.type == 'image'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Image"
        v-model="node.image"
        :expr.sync="node.image_expr"
        :error="node.image_error" />
    </template>
    <template v-if="node.type == 'template'">
      <PropExpr
        v-contextmenu="contextMenu"
        type="Select"
        label="Template"
        :options="templateOptions"
        v-model="node.template" />
    </template>
    <template v-if="node.type == 'switch'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Switch"
        v-model="node.switch"
        :expr.sync="node.switch_expr"
        :error="node.switch_error" />
    </template>
    <template v-if="node.type == 'context'">
    </template>
  </q-expansion-item>
</template>

<script>
import {remove} from 'src/utils'
import draggable from 'vuedraggable'
import PropExpr from 'components/PropExpr'
import {Scope} from 'src/global'

export default {
  name: "MainProperty",
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
  computed: {
    contextMenu () {
      return {
        context: this.node,
        menu: [
          { label: "Toggle Expr", handler: this.onToggleExpr, disable: !['element', 'text', 'image', 'switch'].includes(this.node.type) },
        ]
      }
    },
    templateOptions () {
      return this.$global.templates
      .filter(temp => temp != this.$global.selectedTemplate)
      .map(temp => ({label: temp.name, value: temp.id}))
    }
  },
  methods: {
    onToggleExpr (evt, el, node) {
      if (node.type == 'element') {
        node.element_expr = node.element_expr != null ? null : ''
      } else if (node.type == 'text') {
        node.text_expr = node.text_expr != null ? null : ''
      } else if (node.type == 'image') {
        node.image_expr = node.image_expr != null ? null : ''
      } else if (node.type == 'switch') {
        node.switch_expr = node.switch_expr != null ? null : ''
      }
    }
  }
}
</script>