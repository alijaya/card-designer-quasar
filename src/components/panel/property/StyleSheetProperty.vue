<template>
  <q-expansion-item 
    default-opened expand-separator switch-toggle-side>
    <template #header>
      <q-item-section class="text-h6">Style Sheet</q-item-section>
    </template>
    <q-input 
      filled square type="textarea"
      v-model="$global.projectNode.styleSheet_expr" 
      :error="$global.projectNode.styleSheet_error != null"
      :error-message="$global.projectNode.styleSheet_error" />
  </q-expansion-item>
</template>

<script>
export default {
  name: "StyleSheetProperty",
}
</script>