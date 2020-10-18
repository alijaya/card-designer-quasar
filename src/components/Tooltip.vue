<template>
  <q-tooltip 
    ref="tooltip" 
    :anchor="anchor"
    :self="self"
    :delay="delay"
    :target="el">
    {{value}}
  </q-tooltip>
</template>

<script>
export default {
  name: 'Tooltip',

  data () {
    return {
      el: false,
      value: '',
      delay: 0,
      defaultEl: document.createElement('div'),
      pos: 'bottom',
    }
  },

  computed: {
    anchor () {
      return {
        top: 'top middle',
        bottom: 'bottom middle',
        left: 'center left',
        right: 'center right',
        center: 'center middle',
      }[this.pos]
    },
    self () {
      return {
        top: 'bottom middle',
        bottom: 'top middle',
        left: 'center right',
        right: 'center left',
        center: 'center middle',
      }[this.pos]
    }
  },

  methods: {
    show (evt, { el, value, delay, pos }, delayed) {
      this.hide(evt)
      this.value = value ?? ''
      this.el = (this.value != '') ? el ?? this.defaultEl : false
      this.delay = delay ?? 0
      this.pos = pos ?? 'bottom'

      this.$nextTick(() => {
        if (delayed) {
          this.$refs.tooltip.__delayShow(evt || undefined)
        } else {
          this.$refs.tooltip.show(evt || undefined)
        }
      })
    },
    hide (evt) {
      this.$refs.tooltip.hide(evt || undefined)
    },
  }
}
</script>