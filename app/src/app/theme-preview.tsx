// Throwaway screen that renders every theme token; delete once real screens use them.
import { ScrollView, Text, View } from 'react-native';

import { colors, primitives, radius, space, typography } from '@/theme';

// goldSoft -> gold-soft, so labels read like the Figma variable names.
const figmaName = (path: string) => path.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

const flatten = (tree: object, prefix = ''): [string, string][] =>
  Object.entries(tree).flatMap(([key, value]) =>
    typeof value === 'string'
      ? [[figmaName(prefix + key), value] as [string, string]]
      : flatten(value, `${prefix}${key}/`),
  );

const heading = { ...typography.Label, color: colors.text.muted, marginTop: space[20] };

export default function ThemePreviewScreen() {
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg.screen }}
      contentContainerStyle={{ padding: space[16], gap: space[8] }}>
      {(
        [
          ['PRIMITIVES', primitives],
          ['SEMANTIC COLORS', colors],
        ] as const
      ).map(([title, tree]) => (
        <View key={title} style={{ gap: space[8] }}>
          <Text style={heading}>{title}</Text>
          {flatten(tree).map(([name, value]) => (
            <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: radius.card,
                  borderWidth: 1,
                  borderColor: colors.border.default,
                  backgroundColor: value,
                }}
              />
              <Text style={[typography['Body/Regular'], { color: colors.text.primary }]}>{name}</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={heading}>TEXT STYLES</Text>
      {Object.entries(typography).map(([name, style]) => (
        <Text key={name} style={[style, { color: colors.text.primary }]}>
          {name}
        </Text>
      ))}

      <Text style={heading}>SPACING</Text>
      {Object.entries(space).map(([name, value]) => (
        <View key={name} style={{ flexDirection: 'row', alignItems: 'center', gap: space[12] }}>
          <View style={{ width: value, height: value, backgroundColor: colors.brand.gold }} />
          <Text style={[typography['Body/Regular'], { color: colors.text.primary }]}>space/{name}</Text>
        </View>
      ))}

      <Text style={heading}>RADIUS</Text>
      {Object.entries(radius).map(([name, value]) => (
        <View
          key={name}
          style={{
            padding: space[12],
            borderRadius: value,
            backgroundColor: colors.bg.brand,
            alignItems: 'center',
          }}>
          <Text style={[typography.Button, { color: colors.text.inverse }]}>radius/{name}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
