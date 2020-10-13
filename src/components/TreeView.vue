<template>
  <q-tree-draggable 
    v-model="nodes" 
    node-key="label" 
    default-expand-all
    :options="{group:'tree', animation: 100, swapThreshold:0.65}" 
    :selected.sync="selected" 
    :selected-class="{ 'bg-primary': true }" 
    selectedColor="white" 
    @input="onInput"/>
</template>

<script>
import QTreeDraggable from 'components/QTreeDraggable'

export default {
  name: 'TreeView',
  components: {
    QTreeDraggable,
  },
  data () {
    return {
      selected: null,
      nodes: [{
        label: 'test',
        children: [
          {
            label: '1',
            children: [{
              label: '3',
              children: [],
            }]
          },
          {
            label: '2',
            children: [],
          }
        ]
      },
      {
        label: '4',
        children: [],
      }]
    }
  },
  methods: {
    onInput (e) {
      console.log(JSON.parse(JSON.stringify(e)))
    }
  }
  // props: ['nodes', 'depth']
}
</script>
