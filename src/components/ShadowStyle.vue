<template>
  <shadow-root ref="shadow">
    <component is="link"
      v-for="url in externalStyles" 
      rel="stylesheet" :href="url" />
    <component is="style">{{internalStyle}}</component>
    <slot></slot>
  </shadow-root>
</template>

<script>

export default {
  name: 'ShadowStyle',
  props: {
    internalStyle: String,
    externalStyles: Array,
  }
}
</script>