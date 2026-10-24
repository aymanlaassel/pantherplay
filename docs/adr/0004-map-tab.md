# 0004: Map tab uses react-native-maps

**Date:** 2026-10-24
**Status:** Accepted
**Decided by:** Asad Chaudhry (ADR) / team

## Context
The Map tab shows FIU with a pin for each fixed campus location (the LOCATIONS table) and the games at each one. We need a map library that works in Expo Go, so everyone can run the app without building it themselves, and that costs nothing while we develop. We don't need search, directions or geocoding: the locations and their coordinates are our own data.

## Decision
Use `react-native-maps`, installed with `npx expo install react-native-maps`. Pins come from the LOCATIONS table's `latitude` and `longitude`.

## Why
- It ships inside Expo Go, so no custom dev build is needed.
- No API key or paid plan for development. On iOS it uses Apple Maps, which is free with no key.
- It's the most widely used React Native map library, with custom marker views (our game-count pins).

## Trade-offs
- Production Android builds need a Google Maps API key (free tier, but it must be created, restricted and kept out of git). Expo Go covers it during development.
- iOS shows Apple Maps and Android shows Google Maps, so the map looks a little different on each.
- No web version. The web build shows a placeholder (`map-view.web.tsx`); fine for a mobile app.
- Revisit if we need heavy map styling, offline maps or many pins (then look at Mapbox or `expo-maps`).
