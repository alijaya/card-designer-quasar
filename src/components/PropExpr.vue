<template>
  <div>
    <q-input 
      v-if="type == 'String' || type == 'Number' || type == 'Color' || type == 'Expr'"
      square filled dense 
      :type="type == 'Number' ? 'number' : 'text'"
      :label="label" 
      :readonly="isExpr"
      :label-color="!isExpr ? 'primary' : null"
      :value="displayValue" 
      @input="$emit('input', type == 'Number' ? parseFloat($event) : $event)" 
      :rules="type == 'Color' ? ['anyColor'] : null"
      :error-message="type == 'Color' ? 'Invalid color' : null"
      :debounce="200" >
      <template v-if="handleClass != null" v-slot:prepend>
        <q-icon name="drag_handle" :class="['cursor-grab', handleClass]" />
      </template>
      <template v-if="type == 'Color'" v-slot:append>
        <q-btn 
          round flat size="sm" 
          icon="colorize" 
          text-color="white"
          :style="{background: displayValue}" >
          <q-popup-proxy transition-show="scale" transition-hide="scale">
            <q-color 
              no-header
              no-footer
              :value="displayValue" 
              @change="$emit('input', $event)" />
          </q-popup-proxy>
        </q-btn>
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
      :error="error != null"
      :error-message="error"
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
        return ['String', 'Number', 'Boolean', 'Color', 'Select', 'Expr'].includes(value)
      }
    },
    label: String,
    value: {
      type: [String, Number, Boolean, Array, Object],
      default: null,
    },
    error: String,
    expr: String,
    options: Array, // for Select
    handleClass: String, // for draggable function
  },
  computed: {
    displayValue () {
      if (this.expr && typeof this.value != 'string') {
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
}
</script>