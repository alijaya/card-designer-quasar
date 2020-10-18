<template>
  <q-expansion-item 
    default-opened expand-separator switch-toggle-side >
    <template #header>
      <q-item-section class="text-h6">Node</q-item-section>
    </template>
    <PropExpr
      v-if="parent != null && parent.type == 'switch'"
      label="State"
      v-model="node.state" />
    <PropExpr
      label="Repeat"
      type="Expr"
      :expr.sync="node.repeat" />
    <PropExpr
      label="Repeat Index Variable"
      v-model="node.repeatIndex" />
    <PropExpr
      label="Repeat Item Variable"
      v-model="node.repeatItem" />
  </q-expansion-item>
</template>

<script>
import PropExpr from 'components/PropExpr'
export default {
  name: "NodeProperty",
  components: {
    PropExpr,
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
    parent: Object,
  }
}
</script>