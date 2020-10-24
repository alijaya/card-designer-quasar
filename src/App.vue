<template>
  <div id="q-app">
    <global />
      <router-view />
    </global>
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
}
</script>