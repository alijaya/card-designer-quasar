<template>
  <q-expansion-item default-opened expand-separator switch-toggle-side>
    <template #header>
      <q-item-section class="text-h6">Main</q-item-section>
    </template>

    <template v-if="node.type == 'element'">
      <PropExpr
        label="Element"
        v-model="node.element" />
    </template>
    <template v-if="node.type == 'text'">
      <PropExpr
        label="Text"
        v-model="node.text" />
    </template>
    <template v-if="node.type == 'image'">
      <PropExpr
        label="Image"
        v-model="node.image" />
    </template>
    <template v-if="node.type == 'template'">
      <PropExpr
        label="Template"
        v-model="node.template" />
    </template>
    <template v-if="node.type == 'switch'">
      <PropExpr
        label="Switch"
        v-model="node.switch" />
    </template>
    <template v-if="node.type == 'context'">
    </template>
  </q-expansion-item>
</template>

<script>
import {remove} from 'src/utils'
import draggable from 'vuedraggable'
import PropExpr from 'components/PropExpr'

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
}
</script>