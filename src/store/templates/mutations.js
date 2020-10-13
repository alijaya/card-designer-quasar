import Vue from 'vue'
import {uid as getUid} from 'quasar'

/*
export function someMutation (state) {
}
*/

function hasChildren (node) {
  return ['element', 'switch', 'context'].includes(node?.type)
}

function hasState (tree, node) {
  return tree[node.parent]?.type == "switch"
}

export function updateTemplates (state, templates) {
  state.templates = templates
}

export function updateSelected (state, selected) {
  state.selected = selected
  state.selectedNode = null
}

export function createTemplate (state, template) {
  template = {
    uid: getUid(), 
    name: 'Template', 
    tree: {
      root: {
        uid: 'root',
        type: 'element',
        element: 'div',
        children: [],
      }
    }, 
    ...template
  }
  Vue.set(state.templates, template.uid, template)
  state.templates.root.children.push(template.uid)
}

export function deleteTemplate (state, uid) {
  if (state.selected == uid) {
    updateSelected(state, null)
  }
  const idx = state.templates.root.children.indexOf(uid)
  if (idx != -1) state.templates.root.children.splice(idx, 1)
  Vue.delete(state.templates, uid)
}

export function updateIndex (state, index) {
  state.templates.root.children = index
}

export function updateName (state, {uid, name}) {
  if (state.templates[uid]) {
    state.templates[uid].name = name
  }
}

export function updateTreeParent (state, uid) {
  const tree = state.templates[uid]?.tree
  if (tree) {
    for (const nodeUid in tree) {
      const node = tree[nodeUid]
      node.children.forEach(childUid => {
        const childNode = tree?.[childUid]
        if (childNode) childNode.parent = nodeUid
      })
    }
  }
}

export function updateTree (state, {uid, tree}) {
  if (state.templates[uid]) {
    state.templates[uid].tree = tree
  }
}

export function createNode (state, {uid, parentUid, node}) {
  const tree = state.templates[uid]?.tree
  if (tree) {
    const parentNode = tree[parentUid]
    if (parentNode && hasChildren(parentNode)) {
      node = {
        uid: getUid(), 
        name: '', 
        type: 'element', // default to element
        parent: parentUid,
        state: null,
        repeat: false,
        repeatItem: null,
        repeatIndex: null,
        props: [],
        class: [],
        style: [],
        ...node
      }
      if (hasChildren(node) && node.children == null) {
        node.children = []
      }
      // if (hasState(tree, node) && node.state == null) {
      //   node.state = ''
      // }
      Vue.set(tree, node.uid, node)
      parentNode.children.push(node.uid)
    }
  }
}

export function deleteNode (state, {uid, nodeUid}) {
  const tree = state.templates[uid]?.tree

  const recursiveDelete = uid => {
    if (state.selectedNode == uid) {
      updateSelectedNode(state, null)
    }
    const node = tree?.[uid]
    // delete children
    node?.children?.forEach(childUid => recursiveDelete(childUid))

    Vue.delete(tree, uid)
  }

  // delete from parent
  const node = tree?.[nodeUid]
  const parentNode = tree?.[node?.parent]
  const idx = parentNode?.children?.indexOf(nodeUid)
  parentNode?.children?.splice(idx, 1)

  // recursive delete child
  recursiveDelete(nodeUid)
}

export function updateSelectedNode (state, nodeUid) {
  state.selectedNode = nodeUid
}

export function updateNodeName (state, {uid, nodeUid, name}) {
  const node = state.templates[uid]?.tree[nodeUid]
  if (node) node.name = name
}

export function updateNodeProps (state, {uid, nodeUid, props}) {
  const node = state.templates[uid]?.tree[nodeUid]
  if (node) {
    for (const prop in props) {
      node[prop] = props[prop]
    }
  }
}

export function updateNodeIndex (state, {uid, nodeUid, index}) {
  const tree = state.templates[uid]?.tree
  const node = tree?.[nodeUid]
  if (hasChildren(node)) {
    node.children = index
    node.children.forEach(childUid => {
      const childNode = tree?.[childUid]
      if (childNode) childNode.parent = nodeUid
      // if (hasState(tree, childNode)) {
      //   if (childNode.state == null) childNode.state = ''
      // } else {
      //   if (childNode.state != null) childNode.state = null
      // }
    })
  }
}