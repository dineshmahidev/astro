const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push('js', 'json', 'ts', 'tsx');
config.resolver.assetExts.push('glb', 'gltf', 'png', 'jpg');

module.exports = config;
