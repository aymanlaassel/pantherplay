// Throwaway gallery to review components against Figma on a real phone.
// Not linked from any tab; open it from the Expo dev menu or by URL. Delete once screens use them.
import { ScrollView, Text, View } from 'react-native';

import { BadgeLevel, SKILL_LEVEL_LABEL, type SkillLevel } from '@/components/badge-level';
import { BADGE_STATUS_LABEL, BadgeStatus, type GameBadgeStatus } from '@/components/badge-status';
import { ButtonFilled } from '@/components/button-filled';
import { ButtonJoin } from '@/components/button-join';
import { ButtonOutline } from '@/components/button-outline';
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

      <Text style={heading}>BUTTON / FILLED · BUTTON / OUTLINE</Text>
      <ButtonFilled label="Create game" onPress={() => {}} />
      <ButtonOutline label="Leave game" onPress={() => {}} />
      <View style={{ flexDirection: 'row', gap: space[12] }}>
        <ButtonFilled label="Save" onPress={() => {}} />
        <ButtonOutline label="Cancel" onPress={() => {}} />
        <ButtonFilled label="Disabled" disabled />
      </View>

      <Text style={heading}>BADGE / STATUS</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
        {(Object.keys(BADGE_STATUS_LABEL) as GameBadgeStatus[]).map((status) => (
          <BadgeStatus key={status} status={status} />
        ))}
      </View>

      <Text style={heading}>BADGE / LEVEL</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space[8] }}>
        {(Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[]).map((level) => (
          <BadgeLevel key={level} level={level} />
        ))}
      </View>
    </ScrollView>
  );
}
