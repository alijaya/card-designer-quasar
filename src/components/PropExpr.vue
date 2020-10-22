<template>
  <div>
    <q-input 
      v-if="type == 'String' || type == 'Number' || type == 'Expr'"
      square filled dense 
      :type="type == 'Number' ? 'number' : 'text'"
      :label="label" 
      :readonly="isExpr"
      :label-color="!isExpr ? 'primary' : null"
      :value="displayValue" 
      @input="$emit('input', type == 'Number' ? parseFloat($event) : $event)" 
      :debounce="200" >
      <template v-if="handleClass != null" v-slot:prepend>
        <q-icon name="drag_handle" :class="['cursor-grab', handleClass]" />
      </template>
    </q-input>

    <q-select
      v-if="type == 'Boolean' || type == 'Select'"
      square filled dense options-dense
      emit-value
      map-options
      :options="usedOptions"
      :label="label"
      :readonly="expr != null"
      :label-color="expr == null ? 'primary' : null"
      :value="value"
      @input="$emit('input', $event)" >
      <template v-if="handleClass != null" v-slot:prepend>
        <q-icon name="drag_handle" :class="['cursor-grab', handleClass]" />
      </template>
    </q-select>

    <q-input
      v-if="isExpr"
      filled dense class="q-ml-md" label-color="primary"
      :label="label + ' (expr)'"
      :value="expr"
      @input="$emit('update:expr', $event)"
      :error="errorMessage != null"
      :error-message="errorMessage"
      :debounce="200" />
  </div>
</template>

<script>
import safeEval from 'src/utils/safeEval'

export default {
  name: 'PropExpr',
  data () {
    return {
      booleanOptions: [
        { label: 'True', value: true },
        { label: 'False', value: false },
      ],
    }
  },
  props: {
    type: {
      type: String,
      default: 'String',
      validator: value => {
        return ['String', 'Number', 'Boolean', 'Select', 'Expr'].includes(value)
      }
    },
    label: String,
    value: {
      type: [String, Number, Boolean, Array, Object],
      default: null,
    },
    // scope: Object,
    errorMessage: String,
    expr: String,
    options: Array, // for Select
    handleClass: String, // for draggable function
  },
  computed: {
    displayValue () {
      if (this.expr) {
        return JSON.stringify(this.value)
      } else {
        return this.value
      }
    },
    usedOptions () {
      return {
        Boolean: this.booleanOptions,
        Select: this.options
      }[this.type]
    },
    isExpr () {
      return this.type == 'Expr' || this.expr != null
    },
  },
  mounted () {
    // this.$watch(() => [this.expr, this.scope], val => {
    //   if (this.expr != null && this.scope != null) {
    //     safeEval(this.expr, this.scope)
    //     .then(value => {
    //       this.error = false
    //       this.$emit('input', value)
    //     }).catch(err => {
    //       this.error = true
    //       this.errorMessage = err.message
    //     })
    //   }
    // }, {immediate: true})
  }
}
</script>