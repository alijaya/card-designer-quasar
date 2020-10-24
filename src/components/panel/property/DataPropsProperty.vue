<template>
  <q-expansion-item 
    default-opened expand-separator switch-toggle-side
    v-contextmenu="getDataPropsCM(null)" >
    <template #header>
      <q-item-section class="text-h6">Data Props</q-item-section>
      <q-item-section side>
        <q-btn flat round icon="add" color="primary" size="sm" @click.stop="onCreateDataPropsButton" />
      </q-item-section>
    </template>
    <draggable v-model="node.dataProps" :animation="100" handle=".handle">
      <PropExpr v-for="item, index in node.dataProps"
        v-contextmenu="getDataPropsCM(item)"
        handle-class="handle"
        :type="item.type"
        :label="item.name"
        :options="item.options"
        v-model="item.value"
        :expr.sync="item.expr"
        :error="item.error" />
    </draggable>

    <SelectConfigDialog v-model="selectConfigDialog" :select-prop="selectForConfig" />
  </q-expansion-item>
</template>

<script>
import {remove} from 'src/utils'
import draggable from 'vuedraggable'
import PropExpr from 'components/PropExpr'
import SelectConfigDialog from './SelectConfigDialog'

export default {
  name: "DataPropsProperty",
  components: {
    draggable,
    PropExpr,
    SelectConfigDialog,
  },
  data() {
    return {
      selectForConfig: null,
      selectConfigDialog: false,
    }
  },
  props: {
    node: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getDataPropsNewMenuCM () {
      return [
        { label: "String", handler: this.onCreateDataProps('String') },
        { label: "Number", handler: this.onCreateDataProps('Number') },
        { label: "Boolean", handler: this.onCreateDataProps('Boolean') },
        { label: "Color", handler: this.onCreateDataProps('Color') },
        { label: "Select", handler: this.onCreateDataProps('Select') },
        { label: "Expr", handler: this.onCreateDataProps('Expr') },
      ]
    },

    getDataPropsCM (prop) {
      return {
        context: prop,
        menu: [
          { label: "New Data Props", sub: this.getDataPropsNewMenuCM() },
          { separator: true },
          { label: "Toggle Expr", handler: this.onToggleDataPropsExpr, disable: prop?.type == 'Expr' },
          { label: "Config Select", handler: this.onConfigDataProps, hide: prop?.type != 'Select' },
          { label: "Rename", handler: this.onUpdateDataPropsName, disable: prop == null },
          { label: "Delete", handler: this.onDeleteDataProps, class:"text-negative", disable: prop == null }
        ]
      }
    },

    onCreateDataPropsButton (evt) {
      this.$openContextMenu(evt, {
        el: evt.target,
        context: null,
        menu: this.getDataPropsNewMenuCM()
      })
    },

    onCreateDataProps (type) {
      const defaultValue = {
        String: '',
        Number: 0,
        Boolean: false,
        Color: '#000000FF',
        Select: null,
        Expr: null,
      }[type]
      return (evt) => {
        this.$openPopupEdit(evt, {
          initialValue: '', 
          onSave: value => {
            const newProp = {name: value, type: type, value: defaultValue, expr: null}
            if (type == 'Select') {
              newProp.options = []
            }
            this.node.dataProps.push(newProp)
          },
          floating: true,
        })
      }
    },

    onToggleDataPropsExpr (evt, el, prop) {
      prop.expr = prop.expr != null ? null : ''
    },

    onConfigDataProps (evt, el, prop) {
      this.selectForConfig = prop
      this.selectConfigDialog = true
    },

    onUpdateDataPropsName (evt, el, prop) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: prop.name, 
        onSave: value => {
          prop.name = value
        },
      })
    },

    onDeleteDataProps (evt, el, prop) {
      remove(this.node.dataProps, prop)
    },

  }
}
</script>