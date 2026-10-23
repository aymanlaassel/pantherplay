// Throwaway gallery to review components against Figma on a real phone.
// Not linked from any tab; open it from the Expo dev menu or by URL. Delete once screens use them.
import { ScrollView, Text, View } from 'react-native';

import { ButtonJoin } from '@/components/button-join';
import { SplitBorder } from '@/components/split-border';
import { colors, radius, space, typography } from '@/theme';

const heading = { ...typography.Label, color: colors.text.muted, marginTop: space[20] };

export default function ComponentsGalleryScreen() {
  return (
    <ScrollView
      style={{ backgroundColor: colors.bg.screen }}
      contentContainerStyle={{ padding: space[16], gap: space[12] }}>
      <Text style={heading}>SPLIT BORDER · compare the angle on each size with Figma</Text>
      <View style={{ flexDirection: 'row', gap: space[12], alignItems: 'flex-end' }}>
        <SplitBorder style={{ width: 40, height: 40 }} />
        <SplitBorder style={{ width: 120, height: 40 }} />
        <SplitBorder borderRadius={radius.card} style={{ width: 80, height: 80 }} />
      </View>
      <SplitBorder borderRadius={radius.card} borderWidth={3} style={{ height: 160 }} />
      <SplitBorder borderRadius={0} borderWidth={4} style={{ height: 60 }} />

      <Text style={heading}>BUTTON / JOIN</Text>
      <ButtonJoin onPress={() => {}} />
      <ButtonJoin label="Join game" onPress={() => {}} style={{ alignSelf: 'flex-start' }} />
      <ButtonJoin label="Disabled" disabled />
    </ScrollView>
  );
}
