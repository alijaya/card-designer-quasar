<template>
  <q-popup-edit 
    ref="popup"
    auto-save
    no-parent-event
    :cover="!floating"
    touch-position
    :value="initialValue"
    :validate="doValidation"
    :target="el"
    @save="onSave"
    @cancel="onCancel"
    @show="onShow"
    @hide="onHide">
    <q-input 
        ref="input"
        v-model="initialValue" 
        dense 
        autofocus 
        :error="error != null"
        :error-message="error" />
  </q-popup-edit>
</template>

<script>
export default {
  name: 'PopupEdit',

  data () {
    return {
      error: null,
      el: false,
      initialValue: null,
      onSave: () => {},
      onCancel: () => {},
      validate: () => true,
      errorMessage: null,
      floating: false,
      defaultEl: document.createElement('div'),
    }
  },

  methods: {
    show (evt, { el, initialValue, floating, onSave, validate, errorMessage }) {
      this.hide(evt)
      this.error = null
      this.el = el || this.defaultEl
      this.floating = floating
      this.initialValue = initialValue
      this.onSave = onSave || (() => {})
      this.validate = validate || (() => true)
      this.errorMessage = errorMessage

      this.$nextTick(() => {
        this.$refs.popup.show(evt || undefined)
      })
    },
    hide (evt) {
      this.$refs.popup.hide(evt || undefined)
    },
    doValidation (value) {
      const test = this.validate ? this.validate(value) : true
      if (!test) {
        this.error = this.errorMessage
      } else {
        this.error = null
      }
      return test
    },
    onShow (evt) {
      this.$refs.input.select()
    },
    onHide (evt) {
      this.error = null
    },
  }
}
</script>