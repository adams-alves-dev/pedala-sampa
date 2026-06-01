export const GET_GROUPS_QUERY = /* GraphQL */ `
  query getGroups {
    groups {
      id
      name
      slug
      link {
        text
        html
      }
      departureLocation {
        latitude
        longitude
      }
      groupInfos {
        id
        startHour
        address
        day
        rating
        effort
        distance
        rhythm
      }
    }
  }
`

export const GET_GROUP_QUERY = /* GraphQL */ `
  query getGroup($slug: String!) {
    group(where: { slug: $slug }) {
      id
      name
      slug
      link {
        text
        html
      }
      departureLocation {
        latitude
        longitude
      }
      groupInfos {
        id
        startHour
        address
        day
        rating
        effort
        distance
        rhythm
      }
    }
  }
`
