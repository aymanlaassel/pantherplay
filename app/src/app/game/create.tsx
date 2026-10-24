// Figma: Create game (241:1220). Layout and inputs only: no validation, saving or pickers yet.
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Campus, Game, SkillLevel } from '@/api';
import { SKILL_LEVEL_LABEL } from '@/components/badge-level';
import { ButtonFilled } from '@/components/button-filled';
import { CampusToggle } from '@/components/campus-toggle';
import { Chip } from '@/components/chip';
import { Field } from '@/components/field';
import { Stepper } from '@/components/stepper';
import { Textarea } from '@/components/textarea';
import { colors, space, typography } from '@/theme';

// Placeholder list until the SPORTS table is seeded.
const SPORTS = [
  { code: 'soccer', name: 'Soccer' },
  { code: 'basketball', name: 'Basketball' },
  { code: 'volleyball', name: 'Volleyball' },
  { code: 'ultimate', name: 'Ultimate' },
  { code: 'tennis', name: 'Tennis' },
];

const DURATIONS: { minutes: Game['duration_minutes']; label: string }[] = [
  { minutes: 60, label: '1 hr' },
  { minutes: 90, label: '1.5 hr' },
  { minutes: 120, label: '2 hr' },
];

const SKILL_LEVELS = Object.keys(SKILL_LEVEL_LABEL) as SkillLevel[];

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 30; // placeholder cap until the team picks one

// Default start: tomorrow at 6 PM, shown in the device timezone.
function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(18, 0, 0, 0);
  return d;
}

export default function CreateGameScreen() {
  const insets = useSafeAreaInsets();
  const [sport, setSport] = useState(SPORTS[0].code);
  const [startsAt] = useState(defaultStart);
  const [duration, setDuration] = useState<Game['duration_minutes']>(90);
  const [campus, setCampus] = useState<Campus>('MMC');
  const [maxPlayers, setMaxPlayers] = useState(10);
  const [skill, setSkill] = useState<SkillLevel>('intermediate');
  const [notes, setNotes] = useState('');

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Close" hitSlop={12}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
        <Text style={styles.title}>Create game</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Section label="Sport">
          <View style={styles.chips}>
            {SPORTS.map((s) => (
              <Chip key={s.code} label={s.name} selected={s.code === sport} onPress={() => setSport(s.code)} />
            ))}
          </View>
        </Section>

        <Section label="Date & time">
          <View style={styles.row}>
            <Field
              style={styles.grow}
              value={startsAt.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            />
            <Field style={styles.grow} value={startsAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} />
          </View>
        </Section>

        <Section label="Duration">
          <View style={styles.chips}>
            {DURATIONS.map((d) => (
              <Chip
                key={d.minutes}
                label={d.label}
                selected={d.minutes === duration}
                onPress={() => setDuration(d.minutes)}
              />
            ))}
          </View>
        </Section>

        <Section label="Location">
          <CampusToggle value={campus} onChange={setCampus} />
          <Field placeholder="Choose a spot" />
        </Section>

        <Section label="Players">
          <Stepper value={maxPlayers} onChange={setMaxPlayers} min={MIN_PLAYERS} max={MAX_PLAYERS} unit="players" />
        </Section>

        <Section label="Skill level">
          <View style={styles.chips}>
            {SKILL_LEVELS.map((level) => (
              <Chip
                key={level}
                label={SKILL_LEVEL_LABEL[level]}
                selected={level === skill}
                onPress={() => setSkill(level)}
              />
            ))}
          </View>
        </Section>

        <Section label="Notes">
          <Textarea value={notes} onChangeText={setNotes} placeholder="Anything players should know?" />
        </Section>
      </ScrollView>

      {/* Outside the ScrollView so it stays put; KeyboardAvoidingView lifts it above the keyboard. */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, space[16]) }]}>
        <ButtonFilled label="Post game" onPress={() => {}} />
      </View>
    </KeyboardAvoidingView>
  );
}

function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen },
  header: { flexDirection: 'row', alignItems: 'center', gap: space[16], padding: space[16] },
  close: { ...typography.Button, color: colors.icon.active },
  title: { ...typography['Title/Game'], color: colors.text.primary },
  content: { paddingHorizontal: space[16], paddingBottom: space[20], gap: space[20] },
  section: { gap: space[8] },
  label: { ...typography.Label, color: colors.text.muted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space[8] },
  row: { flexDirection: 'row', gap: space[8] },
  grow: { flex: 1 },
  footer: {
    paddingHorizontal: space[16],
    paddingTop: space[12],
    borderTopWidth: 1,
    borderTopColor: colors.border.default,
    backgroundColor: colors.bg.surface,
  },
});
