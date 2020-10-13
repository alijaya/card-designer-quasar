<template>
  <div class="column">
    <q-toolbar class="text-primary shadow-1">
      <q-toolbar-title>{{propType}} Property</q-toolbar-title>
      <NodeBadge v-if="propType == 'Node'" 
        :type="readSelectedNode.type"
        :is-repeat="readSelectedNode.repeat"
        :has-state="getHasState(readSelectedNode)"
        :state="getState(readSelectedNode)"
        :is-state-selected="getIsStateSelected(readSelectedNode)" 
        />
    </q-toolbar>

    <q-scroll-area class="col">
      <div>
        <template v-if="propType == 'Project'">
          
        </template>
        <template v-else-if="propType == 'Template'">
          <PropExpr
            label="Template Name"
            v-model="templateName" />
        </template>
        <template v-else>
          <PropExpr
            label="Node Name"
            v-model="name" />
        </template>

        <template v-if="propType == 'Node'">

          <q-expansion-item 
            v-if="getHasState(readSelectedNode)"
            default-opened expand-separator switch-toggle-side>
            <template #header>
              <q-item-section class="text-h6">State</q-item-section>
            </template>
            <PropExpr
              label="State"
              v-model="state" />
          </q-expansion-item>


          <q-expansion-item default-opened expand-separator switch-toggle-side>
            <template #header>
              <q-item-section class="text-h6">Repeat</q-item-section>
              <q-item-section side>
                <q-toggle v-model="repeat" size="xs" />
              </q-item-section>
            </template>
            <template v-if="repeat">
              <PropExpr
                label="List"
                type="Expr"
                :expr.sync="repeatList" />
              <PropExpr
                label="Index Variable"
                v-model="repeatIndex" />
              <PropExpr
                label="Item Variable"
                v-model="repeatItem" />
            </template>
          </q-expansion-item>

          <q-expansion-item 
            default-opened expand-separator switch-toggle-side
            v-contextmenu="getPropsCM(null)" >
            <template #header>
              <q-item-section class="text-h6">Props</q-item-section>
              <q-item-section side>
                <q-btn flat round icon="add" color="primary" size="sm" @click.stop="onCreatePropsButton" />
              </q-item-section>
            </template>
            <draggable v-model="props" :animation="100" handle=".handle">
              <PropExpr v-for="item, index in props"
                v-contextmenu="getPropsCM(index)"
                handle-class="handle"
                :type="item.type"
                :label="item.name"
                :value="item.value"
                :expr="item.expr"
                @input="updatePropsValue(index, $event)"
                @update:expr="updatePropsExpr(index, $event)" />
            </draggable>
          </q-expansion-item>

        </template>

        <template v-if="hasClassStyle">
          <q-expansion-item 
            default-opened expand-separator switch-toggle-side
            v-contextmenu="getClassCM(null)" >
            <template #header>
              <q-item-section class="text-h6">Class</q-item-section>
              <q-item-section side>
                <q-btn flat round icon="add" color="primary" size="sm" @click.stop="onCreateClass" />
              </q-item-section>
            </template>
            <draggable v-model="klass" :animation="100" handle=".handle">
              <PropExpr v-for="item, index in klass"
                v-contextmenu="getClassCM(index)"
                handle-class="handle"
                type="Boolean"
                :label="item.name"
                :value="item.value"
                :expr="item.expr"
                @input="updateClassValue(index, $event)"
                @update:expr="updateClassExpr(index, $event)" />
            </draggable>
          </q-expansion-item>

          <q-expansion-item 
            default-opened expand-separator switch-toggle-side 
            v-contextmenu="getStyleCM(null)">
            <template #header>
              <q-item-section class="text-h6">Style</q-item-section>
              <q-item-section side>
                <q-btn flat round icon="add" color="primary" size="sm" @click.stop="onCreateStyle" />
              </q-item-section>
            </template>
            <draggable v-model="style" :animation="100" handle=".handle">
              <PropExpr v-for="item, index in style"
                v-contextmenu="getStyleCM(index)"
                handle-class="handle"
                :label="item.name"
                :value="item.value"
                :expr="item.expr"
                @input="updateStyleValue(index, $event)"
                @update:expr="updateStyleExpr(index, $event)" />
            </draggable>
          </q-expansion-item>
        </template>

        <q-expansion-item default-opened expand-separator switch-toggle-side>
          <template #header>
            <q-item-section class="text-h6">Main</q-item-section>
          </template>

          <template v-if="nodeType == 'element'">
            <PropExpr
              label="Element"
              v-model="element" />
          </template>
          <template v-if="nodeType == 'text'">
            <PropExpr
              label="Text"
              v-model="text" />
          </template>
          <template v-if="nodeType == 'image'">
            <PropExpr
              label="Url"
              v-model="url" />
          </template>
          <template v-if="nodeType == 'instance'">
            <PropExpr
              label="Template"
              v-model="template" />
          </template>
          <template v-if="nodeType == 'switch'">
            <PropExpr
              label="Select"
              v-model="select" />
          </template>
          <template v-if="nodeType == 'context'">
          </template>
        </q-expansion-item>

      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
import { extend } from 'quasar'

import draggable from 'vuedraggable'
import PropExpr from 'components/PropExpr'
import NodeBadge from 'components/NodeBadge'

const propsHelper = (props, defaultValue) => ({
  get: function () { return this.getProps(props) ?? defaultValue },
  set: function (value) { this.setProps(props, value) },
})

export default {
  name: 'ThePropertyPanel',

  components: {
    draggable,
    PropExpr,
    NodeBadge,
  },

  data () {
    return {
      boolOpt: [
        {label: 'True', value: true},
        {label: 'False', value: false}
      ],
    }
  },
  computed: {
    title () {
      return this.propType + ' Property' + (this.nodeType? ` (${this.nodeType})` : '')
    },

    propType () {
      if (this.selectedTemplate == null) {
        return 'Project'
      } else if (this.selectedNode == null) {
        return 'Template'
      } else {
        return 'Node'
      }
    },

    nodeType () {
      return this.readSelectedNode?.type
    },

    hasClassStyle () {
      return ['element', 'text', 'image', 'instance'].includes(this.nodeType)
    },

    templateName: {
      get () {
        return this.readSelectedTemplate?.name
      },
      set (value) {
        this.updateName({
          uid: this.selectedTemplate,
          name: value
        })
      }
    },
    name: {
      get () {
        return this.readSelectedNode?.name
      },
      set (value) {
        this.updateNodeName({
          uid: this.selectedTemplate,
          nodeUid: this.selectedNode,
          name: value
        })
      }
    },
    state: propsHelper('state', null),
    repeat: propsHelper('repeat', false),
    repeatList: propsHelper('repeatList', null),
    repeatIndex: propsHelper('repeatIndex', null),
    repeatItem: propsHelper('repeatItem', null),
    props: propsHelper('props', []),
    klass: propsHelper('class', []),
    style: propsHelper('style', []),

    element: propsHelper('element', ''),
    text: propsHelper('text', ''),
    url: propsHelper('url', ''),
    template: propsHelper('template', ''),
    select: propsHelper('select', ''),

    ...mapState('templates', {
      selectedTemplate: 'selected',
      selectedNode: 'selectedNode'
    }),
    ...mapGetters('templates', [
      'readSelectedTemplate',
      'readSelectedNode',
      'readParentNode',
      'readHasState',
      'readIsStateSelected',
    ])
  },
  methods: {
    getProps (props) {
      return this.readSelectedNode?.[props]
    },

    setProps (props, value) {
      this.updateNodeProps({
        uid: this.selectedTemplate,
        nodeUid: this.selectedNode,
        props: {
          [props]: value
        }
      })
    },

    getPropsNewMenuCM () {
      return [
        { label: "String", handler: this.onCreateProps('String') },
        { label: "Number", handler: this.onCreateProps('Number') },
        { label: "Boolean", handler: this.onCreateProps('Boolean') },
        { label: "Select", handler: this.onCreateProps('Select') },
        { label: "Expr", handler: this.onCreateProps('Expr') },
      ]
    },

    getPropsCM (idx) {
      return {
        context: idx,
        menu: [
          { label: "New Props", sub: this.getPropsNewMenuCM() },
          { separator: true },
          { label: "Toggle Expr", handler: this.onTogglePropsExpr, disable: idx == null || this.props[idx].type == 'Expr' },
          { label: "Config Select", handler: this.onConfigProps, hide: idx == null || this.props[idx].type != 'Select' },
          { label: "Rename", handler: this.onUpdatePropsName, disable: idx == null },
          { label: "Delete", handler: this.onDeleteProps, class:"text-negative", disable: idx == null }
        ]
      }
    },

    getClassCM (idx) {
      return {
        context: idx,
        menu: [
          { label: "New Class", handler: this.onCreateClass },
          { separator: true },
          { label: "Toggle Expr", handler: this.onToggleClassExpr, disable: idx == null },
          { label: "Rename", handler: this.onUpdateClassName, disable: idx == null },
          { label: "Delete", handler: this.onDeleteClass, class:"text-negative", disable: idx == null }
        ]
      }
    },

    getStyleCM (idx) {
      return {
        context: idx,
        menu: [
          { label: "New Style", handler: this.onCreateStyle },
          { separator: true },
          { label: "Toggle Expr", handler: this.onToggleStyleExpr, disable: idx == null },
          { label: "Rename", handler: this.onUpdateStyleName, disable: idx == null },
          { label: "Delete", handler: this.onDeleteStyle, class:"text-negative", disable: idx == null }
        ]
      }
    },

    getHasState (node) {
      return this.readHasState(this.selectedTemplate, node.uid)
    },

    getState (node) {
      return this.readHasState(this.selectedTemplate, node.uid) ? node.state : null
    },

    getIsStateSelected (node) {
      return this.readIsStateSelected(this.selectedTemplate, node.uid)
    },

    createProps (name, type, value) {
      const newProps = extend(true, [], this.props)
      newProps.push({name: name, type: type, value: value})
      this.setProps('props', newProps)
    },

    createClass (name, value) {
      const newClass = extend(true, [], this.klass)
      newClass.push({name: name, value: value})
      this.setProps('class', newClass)
    },

    createStyle (name, value) {
      const newStyle = extend(true, [], this.style)
      newStyle.push({name: name, value: value})
      this.setProps('style', newStyle)
    },

    updatePropsName (idx, name) {
      const newProps = extend(true, [], this.props)
      newProps[idx].name = name
      this.setProps('props', newProps)
    },

    updateClassName (idx, name) {
      const newClass = extend(true, [], this.klass)
      newClass[idx].name = name
      this.setProps('class', newClass)
    },

    updateStyleName (idx, name) {
      const newStyle = extend(true, [], this.style)
      newStyle[idx].name = name
      this.setProps('style', newStyle)
    },

    updatePropsValue (idx, value) {
      const newProps = extend(true, [], this.props)
      newProps[idx].value = value
      this.setProps('props', newProps)
    },

    updateClassValue (idx, value) {
      const newClass = extend(true, [], this.klass)
      newClass[idx].value = value
      this.setProps('class', newClass)
    },

    updateStyleValue (idx, value) {
      const newStyle = extend(true, [], this.style)
      newStyle[idx].value = value
      this.setProps('style', newStyle)
    },

    updatePropsExpr (idx, expr) {
      const newProps = extend(true, [], this.props)
      newProps[idx].expr = expr
      this.setProps('props', newProps)
    },

    updateClassExpr (idx, expr) {
      const newClass = extend(true, [], this.klass)
      newClass[idx].expr = expr
      this.setProps('class', newClass)
    },

    updateStyleExpr (idx, expr) {
      const newStyle = extend(true, [], this.style)
      newStyle[idx].expr = expr
      this.setProps('style', newStyle)
    },

    togglePropsExpr (idx) {
      const newProps = extend(true, [], this.props)
      if (newProps[idx].expr == null) {
        newProps[idx].expr = ''
      } else {
        delete newProps[idx].expr
      }
      this.setProps('props', newProps)
    },

    toggleClassExpr (idx) {
      const newClass = extend(true, [], this.klass)
      if (newClass[idx].expr == null) {
        newClass[idx].expr = ''
      } else {
        delete newClass[idx].expr
      }
      this.setProps('class', newClass)
    },

    toggleStyleExpr (idx) {
      const newStyle = extend(true, [], this.style)
      if (newStyle[idx].expr == null) {
        newStyle[idx].expr = ''
      } else {
        delete newStyle[idx].expr
      }
      this.setProps('style', newStyle)
    },

    deleteProps (idx) {
      const newProps = extend(true, [], this.props)
      newProps.splice(idx, 1)
      this.setProps('props', newProps)
    },

    deleteClass (idx) {
      const newClass = extend(true, [], this.klass)
      newClass.splice(idx, 1)
      this.setProps('class', newClass)
    },

    deleteStyle (idx) {
      const newStyle = extend(true, [], this.style)
      newStyle.splice(idx, 1)
      this.setProps('style', newStyle)
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
            this.createProps(value, type, defaultValue)
          },
          floating: true,
        })
      }
    },

    onCreateClass (evt) {
      this.$openPopupEdit(evt, {
        initialValue: '', 
        onSave: value => {
          this.createClass(value, true)
        },
        floating: true,
      })
    },

    onCreateStyle (evt) {
      this.$openPopupEdit(evt, {
        initialValue: '', 
        onSave: value => {
          this.createStyle(value, '')
        },
        floating: true,
      })
    },

    onTogglePropsExpr (evt, el, idx) {
      this.togglePropsExpr(idx)
    },

    onToggleClassExpr (evt, el, idx) {
      this.toggleClassExpr(idx)
    },

    onToggleStyleExpr (evt, el, idx) {
      this.toggleStyleExpr(idx)
    },


    onConfigProps (evt, el, idx) {
      console.log(true)
    },


    onUpdatePropsName (evt, el, idx) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: this.props[idx].name, 
        onSave: value => {
          this.updatePropsName(idx, value)
        },
      })
    },

    onUpdateClassName (evt, el, idx) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: this.klass[idx].name, 
        onSave: value => {
          this.updateClassName(idx, value)
        },
      })
    },

    onUpdateStyleName (evt, el, idx) {
      this.$openPopupEdit(null, {
        el: el,
        initialValue: this.style[idx].name, 
        onSave: value => {
          this.updateStyleName(idx, value)
        },
      })
    },

    onDeleteProps (evt, el, idx) {
      this.deleteProps(idx)
    },

    onDeleteClass (evt, el, idx) {
      this.deleteClass(idx)
    },

    onDeleteStyle (evt, el, idx) {
      this.deleteStyle(idx)
    },

    ...mapMutations('templates', [
      'updateName',
      'updateNodeName',
      'updateNodeProps',
    ])
  }
}
</script>
