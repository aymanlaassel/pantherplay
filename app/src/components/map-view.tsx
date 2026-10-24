// The map, from react-native-maps (see docs/adr/0004-map-tab.md). Screens import it from here
// so the web build can swap in map-view.web.tsx: react-native-maps has no web version.
export { default as MapView, Marker, type Region } from 'react-native-maps';
