<template>
  <div class="column">
    <q-toolbar class="text-primary shadow-1">
      <q-toolbar-title>{{propType}} Property</q-toolbar-title>
      <NodeBadge v-if="propType == 'Node'" 
        :node="node"
      />
    </q-toolbar>

    <q-scroll-area class="col">
      <div>
        <template v-if="propType == 'Project'">
        </template>
        <template v-else-if="propType == 'Template'">
          <PropsProperty :node="template" />
          <ClassProperty :node="template" />
          <StyleProperty :node="template" />
        </template>
        <template v-else-if="propType == 'Node'">
          <NodeProperty :node="node" />
          <PropsProperty :node="node" />
          <template v-if="hasClassStyle">
            <ClassProperty :node="node" />
            <StyleProperty :node="node" />
          </template>
          <MainProperty :node="node" />
        </template>
        <StyleSheetProperty />
      </div>
    </q-scroll-area>
  </div>
</template>

<script>
import {remove} from 'src/utils'

import draggable from 'vuedraggable'
import PropExpr from 'components/PropExpr'
import NodeBadge from 'components/NodeBadge'

import NodeProperty from './property/NodeProperty'
import PropsProperty from './property/PropsProperty'
import ClassProperty from './property/ClassProperty'
import StyleProperty from './property/StyleProperty'
import MainProperty from './property/MainProperty'

import StyleSheetProperty from './property/StyleSheetProperty'

import {Parent} from 'src/global'

export default {
  name: 'ThePropertyPanel',

  components: {
    draggable,
    PropExpr,
    NodeBadge,
    NodeProperty,
    PropsProperty,
    ClassProperty,
    StyleProperty,
    MainProperty,

    StyleSheetProperty,
  },

  computed: {
    template () {
      return this.$global.selectedTemplate
    },
    node () {
      return this.$global.selectedNode
    },
    parent () {
      return this.node?.[Parent]
    },
    propType () {
      if (this.template == null) {
        return 'Project'
      } else if (this.node == null) {
        return 'Template'
      } else {
        return 'Node'
      }
    },
    hasClassStyle () {
      return ['element', 'text', 'image', 'template'].includes(this.node?.type)
    },
  },
  methods: {
    
  }
}
</script>
