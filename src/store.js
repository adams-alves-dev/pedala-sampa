import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    Records: []
  },
  mutations: {
    SetRecords (state, Data) {
      state.Records = Data
    }
  },
  getters: {
    Records: (state) => state.Records
  }
})
