<template>
  <q-expansion-item default-opened expand-separator switch-toggle-side>
    <template #header>
      <q-item-section class="text-h6">Main</q-item-section>
    </template>

    <template v-if="node.type == 'element'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Element"
        :scope="scope"
        v-model="node.element"
        :expr.sync="node.element_expr" />
    </template>
    <template v-if="node.type == 'text'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Text"
        :scope="scope"
        v-model="node.text"
        :expr.sync="node.text_expr" />
    </template>
    <template v-if="node.type == 'image'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Image"
        :scope="scope"
        v-model="node.image"
        :expr.sync="node.image_expr" />
    </template>
    <template v-if="node.type == 'template'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Template"
        v-model="node.template" />
    </template>
    <template v-if="node.type == 'switch'">
      <PropExpr
        v-contextmenu="contextMenu"
        label="Switch"
        :scope="scope"
        v-model="node.switch"
        :expr.sync="node.switch_expr" />
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
    scope () {
      return this.node?.[Scope]
    },
    contextMenu () {
      return {
        context: this.node,
        menu: [
          { label: "Toggle Expr", handler: this.onToggleExpr, disable: !['element', 'text', 'image', 'switch'].includes(this.node.type) },
        ]
      }
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