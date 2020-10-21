<template>
  <div id="q-app">
    <router-view />
    <global ref="global" />
  </div>
</template>
<script>
import Vue from 'vue'
import global from 'src/global'
export default {
  name: 'App',
  components: {
    global
  },
  mounted () {
    Vue.prototype.$global = this.$refs.global
  }
}
</script>
