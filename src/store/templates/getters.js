/*
export function someGetter (state) {
}
*/

// export function templates (state) {
//   return Object.fromEntries(state.templatesEntries)
// }

// export function currentTemplate (state) {
//   return state.templatesEntries[state.currentTemplateIndex]
// }

export const readTemplate = state => uid => state.templates[uid]
export const readSelectedTemplate = state => state.templates[state.selected]

export const readTree = state => uid => state.templates[uid]?.tree
export const readSelectedTree = state => state.templates[state.selected]?.tree

export const readName = state => uid => state.templates[uid]?.name
export const readSelectedName = state => state.templates[state.selected]?.name

export const readNode = state => (uid, nodeUid) => state.templates[uid]?.tree[nodeUid]
export const readSelectedNode = state => state.templates[state.selected]?.tree[state.selectedNode]

export const readParentNode = state => (uid, nodeUid) => {
  const tree = state.templates[uid]?.tree
  const parentUid = tree?.[nodeUid]?.parent

  return tree?.[parentUid]
}

export const readHasState = state => (uid, nodeUid) => {
  const tree = state.templates[uid]?.tree
  const node = tree?.[nodeUid]
  const parentNode = tree?.[node?.parent]
  return parentNode?.type == 'switch'
}

export const readIsStateSelected = state => (uid, nodeUid) => {
  const tree = state.templates[uid]?.tree
  const node = tree?.[nodeUid]
  const parentNode = tree?.[node?.parent]
  return parentNode?.type == 'switch' && parentNode?.select == node?.state
}