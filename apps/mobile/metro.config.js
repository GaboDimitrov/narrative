const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

// Force node to find packages from our app's node_modules first
const nodeModulesPath = path.resolve(projectRoot, 'node_modules');
require.main.paths.unshift(nodeModulesPath);

const config = getDefaultConfig(projectRoot);

// Add .mpga to asset extensions for audio files
config.resolver.assetExts = [...config.resolver.assetExts, 'mpga'];

// Watch all files in the monorepo
config.watchFolders = [monorepoRoot];

// Let Metro know where to resolve packages
config.resolver.nodeModulesPaths = [
  nodeModulesPath,
  path.resolve(monorepoRoot, 'node_modules'),
];

// Ensure we resolve from the project root first
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
