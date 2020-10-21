import jailed from 'jailed'

const promiseTimeout = (promise, ms=5000) => {
  let id
  const timeout = new Promise((resolve, reject) => {
    id = setTimeout(() => {
      reject({ name: 'TimeoutError', message: `Promised timed out in ${ms} ms` })
    }, ms)
  })

  return Promise.race([ promise, timeout ])
  .then(result => {
    clearTimeout(id)
    return result
  })
}

const path = `${window.location.protocol}//${window.location.host}/plugin.js`
const api = {
  log(obj) {
    console.log(obj)
  }
}

let jailedInstance;

const resetJailed = () => {
  if (jailedInstance) jailedInstance.disconnect()
  jailedInstance = new jailed.Plugin(path, api)
}

const safeEval = async (code, scope, timeout=3000) => {
  return new Promise( (resolve, reject) => {
    jailedInstance.whenConnected(() => {
      promiseTimeout(new Promise( (resolve, reject) => {
        jailedInstance.remote.safeEval(code, scope, (err, res) => {
          if (err) {
            reject(err)
          } else {
            resolve(res)
          }
        })
      }), timeout).then(res => resolve(res), err => reject(err))
    })
  })
  .catch(err => {
    // console.log(code)
    // console.error(err)
    if (err.name === 'TimeoutError') {
      resetJailed()
    }
    throw err
  })
}

resetJailed()

export default safeEval