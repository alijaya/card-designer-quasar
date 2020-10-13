import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

import templates from './templates'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    modules: {
      templates,
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV,

    plugins: [createPersistedState()]
  })

  /*
    if we want some HMR magic for it, we handle
    the hot update like below. Notice we guard this
    code with "process.env.DEV" -- so this doesn't
    get into our production build (and it shouldn't).
  */

  if (process.env.DEV && module.hot) {
    module.hot.accept(['./templates'], () => {
      const newtemplates = require('./templates').default
      Store.hotUpdate({ modules: { templates: newtemplates } })
    })
  }

  return Store
}