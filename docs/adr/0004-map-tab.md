# NNNN: react-native-maps library

**Date:** 2026-10-23
**Status:** Proposed
**Decided by:** Asad Chaudhry

## Context
App needs an interactive map displaying fixed FIU campus locations.

Constraint: 
The library must work in Expo Go without requiring a paid API key during development.

## Decision
Use `react-native-maps`

## Why
- Compatible with Expo Go
- Supports markers and map interactions
- Works on iOS and Android
- Integrates with React Native

## Trade-offs
Production Android builds require Google Maps API key configuration. We might revisit this because of performance issues with maybe too many markers, customization limitations, or new requirements like offline maps.

