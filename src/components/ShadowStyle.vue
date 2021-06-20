<template>
  <!-- <shadow-root ref="shadow"> -->
  <div>
    <component
      is="link"
      v-for="url in externalStyles"
      :key="url"
      rel="stylesheet"
      :href="url"
    />
    <component is="style">{{ internalStyle }}</component>
    <slot></slot>
  </div>
  <!-- </shadow-root> -->
</template>

<script>
export default {
  name: "ShadowStyle",
  props: {
    internalStyle: String,
    externalStyles: Array
  }
};
</script>
