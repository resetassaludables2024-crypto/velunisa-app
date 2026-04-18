// Polyfill para Node.js < 20: Array.prototype.toReversed
// @expo/metro (SDK 54) usa toReversed() en metro-config/loadConfig.js
// EAS Build worker corre en Node.js 18 donde toReversed no existe aún
if (!Array.prototype.toReversed) {
  // eslint-disable-next-line no-extend-native
  Array.prototype.toReversed = function () { return [...this].reverse() }
}

const { getDefaultConfig } = require('expo/metro-config')
const path = require('path')

const projectRoot = __dirname
const monorepoRoot = path.resolve(projectRoot, '../..')

const config = getDefaultConfig(projectRoot)

// Monorepo: agregar root al watchFolders (sin sobreescribir los defaults de Expo)
config.watchFolders = [...(config.watchFolders || []), monorepoRoot]

// Monorepo: resolver módulos desde el root y desde mobile
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
]

// Fix: web-streams-polyfill usa exports condicionales no soportados por Metro
config.resolver.unstable_enablePackageExports = false

module.exports = config
