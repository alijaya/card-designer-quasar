const api = {
  safeEval(code, scope, cb) {
    if (typeof scope == 'function') {
      cb = scope
      scope = {}
    }
    if (scope == null) {
      scope = {}
    }
    if (cb == null) {
      cb = () => {}
    }
    try {
      with (Math) with (application.remote) with (scope) {
        let indexedDB = undefined
        let location = undefined
        let navigator = undefined
        let onerror = undefined
        let onmessage = undefined
        let performance = undefined
        let self = undefined
        let webkitIndexedDB = undefined
        let postMessage = undefined
        let close = undefined
        let openDatabase = undefined
        let openDatabaseSync = undefined
        let webkitRequestFileSystem = undefined
        let webkitRequestFileSystemSync = undefined
        let webkitResolveLocalFileSystemSyncURL = undefined
        let webkitResolveLocalFileSystemURL = undefined
        let addEventListener = undefined
        let dispatchEvent = undefined
        let removeEventListener = undefined
        let dump = undefined
        let onoffline = undefined
        let ononline = undefined
        let importScripts = undefined
        let console = undefined
        let application = undefined

        cb(null, eval(code))
      }
    } catch (e) {
      cb(e)
    }
  }
}

application.setInterface(api)