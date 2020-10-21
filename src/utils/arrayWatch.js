export default function (arr, handler) {
  if (arr == null) return null
  handler = {
    onCreate: value => value,
    onRead: value => value,
    onUpdate: (newValue, oldValue) => newValue,
    onDelete: value => value,
    ...handler
  }
  return new Proxy(arr, {
    get (arr, prop) {
      if (prop == 'push') {
        return (...args) => {
          const inserted = args.map(handler.onCreate)
          return arr[prop](...inserted)
        }
      } else if (prop == 'unshift') {
        return (...args) => {
          const inserted = args.map(handler.onCreate)
          return arr[prop](...inserted)
        }
      } else if (prop == 'splice') {
        return (...args) => {
          const inserted = args.slice(2).map(handler.onCreate)
          const deleted = arr[prop](...args.slice(0,2).concat(inserted)).map(handler.onDelete)
          return deleted
        }
      } else if (prop == 'shift') {
        return () => {
          const deleted = handler.onDelete(arr[prop]())
          return deleted
        }
      } else if (prop == 'pop') {
        return () => {
          const deleted = handler.onDelete(arr[prop]())
          return deleted
        }
      } else if (Object.keys(arr).includes(prop)) { // prop access
        return handler.onRead(arr[prop])
      } else {
        return arr[prop]
      }
    },
    set (arr, prop, value) {
      if (Object.keys(arr).includes(prop)) { // prop access
        arr[prop] = handler.onUpdate(value, arr[prop])
      } else {
        arr[prop] = value
      }
      return true
    }
  })
}