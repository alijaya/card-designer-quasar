<template>
  <div class="q-gutter-xs">
    <q-badge v-if="hasState" color="pink" :class="{'is-not-selected':!isStateSelected}">:{{state}}</q-badge>
    <q-badge :color="badgeColor[type]">{{type}}</q-badge>
    <q-badge v-if="isRepeat" :color="badgeColor[type]">●</q-badge>
  </div>
</template>

<script>
export default {
  name: "NodeBadge",
  props: {
    type: String,
    hasState: Boolean,
    state: String,
    isStateSelected: Boolean,
    isRepeat: Boolean,
  },
  data () {
    return {
      badgeColor: {
        element: 'orange',
        text: 'green',
        image: 'red',
        instance: 'light-blue',
        switch: 'purple',
        context: 'brown',
      }
    }
  }
}
</script>

<style scoped>
.is-not-selected {
  opacity: 0.5;
}
</style>