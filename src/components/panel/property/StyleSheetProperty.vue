<template>
  <q-expansion-item 
    default-opened expand-separator switch-toggle-side>
    <template #header>
      <q-item-section class="text-h6">Style Sheet</q-item-section>
    </template>
    <q-input v-model="$global.styleSheet" filled square type="textarea" />
  </q-expansion-item>
</template>

<script>
export default {
  name: "StyleSheetProperty",
}
</script>