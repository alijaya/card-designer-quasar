<template>
  <q-expansion-item 
    default-opened expand-separator switch-toggle-side
    v-contextmenu="getPropsCM(null)" >
    <template #header>
      <q-item-section class="text-h6">Props</q-item-section>
      <q-item-section side>
        <q-btn flat round icon="add" color="primary" size="sm" @click.stop="onCreatePropsButton" />
      </q-item-section>
    </template>
    <draggable v-model="node.props" :animation="100" handle=".handle">
      <PropExpr v-for="item, index in node.props"
        v-contextmenu="getPropsCM(item)"
        handle-class="handle"
        :type="item.type"
        :label="item.name"
        :options="item.options"
        :scope="scopeParent"
        v-model="item.value"
        :expr.sync="item.expr" />
    </draggable>

    <SelectConfigDialog v-model="selectConfigDialog" :select-prop="selectForConfig" />
  </q-expansion-item>
</template>

<script>
import {remove} from 'src/utils'
import draggable from 'vuedraggable'
import PropExpr from 'components/PropExpr'
import SelectConfigDialog from './SelectConfigDialog'
import {Scope,Parent} from 'src/global'

export default {
  name: "PropsProperty",
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
  computed: {
    parent () {
      return this.node?.[Parent]
    },
    scopeParent () {
      return this.parent?.[Scope]
    }
  },
  methods: {
    getPropsNewMenuCM () {
      return [
        { label: "String", handler: this.onCreateProps('String') },
        { label: "Number", handler: this.onCreateProps('Number') },
        { label: "Boolean", handler: this.onCreateProps('Boolean') },
        { label: "Select", handler: this.onCreateProps('Select') },
        { label: "Expr", handler: this.onCreateProps('Expr') },
      ]
    },

    getPropsCM (prop) {
      return {
        context: prop,
        menu: [
          { label: "New Props", sub: this.getPropsNewMenuCM() },
          { separator: true },
          { label: "Toggle Expr", handler: this.onTogglePropsExpr, disable: prop?.type == 'Expr' },
          { label: "Config Select", handler: this.onConfigProps, hide: prop?.type != 'Select' },
          { label: "Rename", handler: this.onUpdatePropsName, disable: prop == null },
          { label: "Delete", handler: this.onDeleteProps, class:"text-negative", disable: prop == null }
        ]
      }
    },

    onCreatePropsButton (evt) {
      this.$openContextMenu(evt, {
        el: evt.target,
        context: null,
        menu: this.getPropsNewMenuCM()
      })
    },

    onCreateProps (type) {
      const defaultValue = {
        String: '',
        Number: 0,
        Boolean: false,
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
            this.node.props.push(newProp)
          },
          floating: true,
        })
      }
    },

    onTogglePropsExpr (evt, el, prop) {
      prop.expr = prop.expr != null ? null : ''
    },

    onConfigProps (evt, el, prop) {
      this.selectForConfig = prop
      this.selectConfigDialog = true
    },

    onUpdatePropsName (evt, el, prop) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: prop.name, 
        onSave: value => {
          prop.name = value
        },
      })
    },

    onDeleteProps (evt, el, prop) {
      remove(this.node.props, prop)
    },

  }
}
</script>