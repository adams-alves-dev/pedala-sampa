import getGroup from '@/apollo/queries/groups/group'
import { gql } from 'graphql-tag'

export const state = () => ({
  group: null,
})

export const mutations = {
  SET_GROUP(state, payload) {
    state.group = payload
  },
}

export const actions = {
  async SET_GROUP({ commit }) {
    const client = this.app.apolloProvider.defaultClient
    const slug = this.$router.history.current.params.name

    const res = await client.query({
      query: gql`
        ${getGroup}
      `,
      variables: {
        slug,
      },
    })

    const { group } = res.data
    commit('SET_GROUP', group)

    return {
      group,
    }
  },
}

export const getters = {
  GET_GROUP: (state) => {
    return state.group
  },
}
