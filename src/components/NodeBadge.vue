<template>
  <div class="q-gutter-xs">
    <q-badge v-if="hasState" color="pink" 
      :class="{'is-not-selected':!isStateSelected}">:{{state}}</q-badge>
    <q-badge :color="badgeColor[type]">{{type}}</q-badge>
    <q-badge v-if="isRepeat" :color="badgeColor[type]">●</q-badge>
  </div>
</template>

<script>
import {Parent} from 'src/global'

export default {
  name: "NodeBadge",
  props: {
    node: Object,
  },
  data () {
    return {
      badgeColor: {
        element: 'orange',
        text: 'green',
        image: 'red',
        template: 'light-blue',
        switch: 'purple',
        context: 'brown',
      },
    }
  },
  computed: {
    parent () {
      console.log(this.node[Parent])
      return this.node?.[Parent]
    },
    type () {
      return this.node?.type
    },
    hasState () {
      return this.parent?.type == 'switch'
    },
    state () {
      return this.node?.state
    },
    isStateSelected () {
      return this.parent?.switch == this.node?.state
    },
    isRepeat () {
      return this.node?.repeat != null
    }
  }
}
</script>

<style scoped>
.is-not-selected {
  opacity: 0.5;
}
</style>