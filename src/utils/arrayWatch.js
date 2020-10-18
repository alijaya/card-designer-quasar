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
          args.map(handler.onCreate)
          return arr[prop](...args)
        }
      } else if (prop == 'unshift') {
        return (...args) => {
          args.map(handler.onCreate)
          return arr[prop](...args)
        }
      } else if (prop == 'splice') {
        return (...args) => {
          args = args.slice(0,2).concat(args.slice(2).map(handler.onCreate))
          return arr[prop](...args).map(handler.onDelete)
        }
      } else if (prop == 'shift') {
        return () => {
          return handler.onDelete(arr[prop]())
        }
      } else if (prop == 'pop') {
        return () => {
          return handler.onDelete(arr[prop]())
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