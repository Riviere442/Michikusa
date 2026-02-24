const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// CSVとGeoJSONをアセットとして認識させる
config.resolver.assetExts.push('csv', 'geojson');

// JSON をソースファイルとして解決できるようにする
if (!config.resolver.sourceExts.includes('json')) {
  config.resolver.sourceExts.push('json');
}

module.exports = config;
