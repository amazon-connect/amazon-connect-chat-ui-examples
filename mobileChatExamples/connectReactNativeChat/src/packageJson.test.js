const packageJson = require('../package.json')

describe('Package Versions', () => {
  test('core dependencies should match expected versions', () => {
    expect(packageJson.dependencies['expo']).toBe('~51.0.39')
    expect(packageJson.dependencies['react-native']).toBe('0.74.5')
    expect(packageJson.dependencies['@react-native-async-storage/async-storage']).toBe('1.23.1')
    expect(packageJson.dependencies['@react-native-community/netinfo']).toBe('11.3.1')
  })

  test('react-native ecosystem packages should match expected versions', () => {
    expect(packageJson.dependencies['react-native-gesture-handler']).toBe('~2.16.1')
    expect(packageJson.dependencies['react-native-reanimated']).toBe('~3.10.1')
    expect(packageJson.dependencies['react-native-safe-area-context']).toBe('4.10.5')
    expect(packageJson.dependencies['react-native-screens']).toBe('3.31.1')
    expect(packageJson.dependencies['react-native-web']).toBe('~0.19.10')
  })

  test('react and react-dom versions should be consistent', () => {
    const reactVersion = '18.2.0'
    expect(packageJson.dependencies['react']).toBe(reactVersion)
    expect(packageJson.dependencies['react-dom']).toBe(reactVersion)
  })

  test('expo webpack config should match expected version', () => {
    expect(packageJson.dependencies['@expo/webpack-config']).toBe('^19.0.1')
  })
})
