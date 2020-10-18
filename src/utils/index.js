export function remove(arr, val) {
  const idx = arr.indexOf(val)
  if (idx != -1) return arr.splice(idx, 1)[0]
  return null
}