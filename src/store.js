import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    Clubs: []
  },
  mutations: {
    SetClubs (state, Data) {
      state.Clubs = Data
    }
  },
  getters: {
    Clubs: (state) => state.Clubs,
    getClubById: (state) => (id) => {
      return state.Clubs.find((Club) => Club.id === id)
    }
  }
})
