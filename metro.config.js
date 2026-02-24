const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// CSVとGeoJSONをアセットとして認識させる
config.resolver.assetExts.push('csv', 'geojson');

module.exports = config;
