<template>
  <div class="column">
    <q-toolbar class="text-primary shadow-1">
      <q-toolbar-title>{{propType}} Property</q-toolbar-title>
      <NodeBadge v-if="propType == 'Node'" 
        :node-id="node.id"
      />
    </q-toolbar>

    <q-scroll-area class="col">
      <div>
        <template v-if="propType == 'Project'">
        </template>
        <template v-else-if="propType == 'Template'">
        </template>
        <template v-else-if="propType == 'Node'">
          <NodeProperty :node="node" :parent="parent" :scope-parent="scopeParent" />
          <PropsProperty :node="node" :scope-parent="scopeParent" />
          <template v-if="hasClassStyle">
            <ClassProperty :node="node" :scope="scope" />
            <StyleProperty :node="node" :scope="scope" />
          </template>
          <MainProperty :node="node" :scope="scope" />
        </template>
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
  },

  data () {
  },
  computed: {
    template () {
      return this.$global.selectedTemplate
    },
    node () {
      return this.$global.selectedNode
    },
    parent () {
      return this.$global.selectedNodeParent
    },
    propType () {
      if (this.$global.selectedTemplate == null) {
        return 'Project'
      } else if (this.$global.selectedNode == null) {
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
