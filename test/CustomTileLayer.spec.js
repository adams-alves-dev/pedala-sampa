import { mount } from '@vue/test-utils'
import CustomTileLayer from '@/components/Map/CustomTileLayer.vue'

describe('CustomTileLayer', () => {
  describe('Without $config variables', () => {
    let wrapper

    beforeAll(() => {
      wrapper = mount(CustomTileLayer, {
        mocks: {
          $config: {},
        },
        stubs: ['l-tile-layer'],
      })
    })

    test('is a Vue instance', () => {
      expect(wrapper).toBeTruthy()
    })

    test('if have a component named `CustomTileLayer`', () => {
      expect(wrapper.findComponent({ name: 'CustomTileLayer' }).exists()).toBe(
        true
      )
    })

    test('if in component `l-tile-layer` have a attribute `attribution`', () => {
      expect(wrapper.find('attribution').exists())
    })

    test('if in component `l-tile-layer` have a attribute `attribution` with content', () => {
      expect(wrapper.attributes().attribution).toBe(
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      )
    })

    test('if in component `l-tile-layer` have a attribute `url`', () => {
      expect(wrapper.find('url').exists())
    })

    test('if in component `l-tile-layer` have a attribute `url` with content', () => {
      expect(wrapper.attributes().url).toBe(
        'https://{s}.tile.osm.org/{z}/{x}/{y}.png'
      )
    })
  })

  describe('With $config variables', () => {
    let wrapper

    beforeAll(() => {
      wrapper = mount(CustomTileLayer, {
        mocks: {
          $config: {
            MAPBOX_USERID: 'adamsalves',
            MAPBOX_STYLEID: 'cktt15ncyIsfqthtmd',
            MAPBOX_API_KEY: 'eyJ1IjoiYWRhbXNhbHZlcyIsImE',
          },
        },
        stubs: ['l-tile-layer'],
      })
    })

    test('if in component `l-tile-layer` have a attribute `attribution` with content', () => {
      expect(wrapper.attributes().attribution).toBe(
        '© <a href="https://apps.mapbox.com/feedback/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      )
    })

    test('if in component `l-tile-layer` have exist a attribute `url` with content', () => {
      expect(wrapper.attributes().url).toBe(
        `https://api.mapbox.com/styles/v1/adamsalves/cktt15ncyIsfqthtmd/tiles/256/{z}/{x}/{y}@2x?access_token=eyJ1IjoiYWRhbXNhbHZlcyIsImE`
      )
    })
  })
})
