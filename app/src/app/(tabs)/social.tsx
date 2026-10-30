import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, space, typography } from '@/theme';

type Conversation = {
  id: string;
  name: string;
  initials: string;
  message: string;
  time: string;
  group: boolean;
  unread: boolean;
};

type Friend = { id: string; name: string; initials: string };

const conversations: Conversation[] = [
  { id: '1', name: 'Igor', initials: 'IG', message: 'Are we still playing at 6?', time: '2m', group: false, unread: true },
  { id: '2', name: 'Basketball at MMC', initials: 'BB', message: 'Felipe: I can bring a ball.', time: '12m', group: true, unread: true },
  { id: '3', name: 'Ayman', initials: 'AY', message: 'See you at MMC!', time: '1h', group: false, unread: false },
  { id: '4', name: 'Soccer at Panther Field', initials: 'SC', message: 'Bryant: We need one more player.', time: '3h', group: true, unread: false },
  { id: '5', name: 'Asad', initials: 'AS', message: 'Thanks for the game!', time: 'Yesterday', group: false, unread: false },
];

const friends: Friend[] = [
  { id: '1', name: 'Igor', initials: 'IG' },
  { id: '2', name: 'Felipe', initials: 'FT' },
  { id: '3', name: 'Ayman', initials: 'AY' },
  { id: '4', name: 'Bryant', initials: 'BR' },
  { id: '5', name: 'Asad', initials: 'AS' },
];

export default function SocialScreen() {
  const [tab, setTab] = useState<'Chats' | 'Friends'>('Chats');
  const [filter, setFilter] = useState<'All' | 'Groups' | 'Unread'>('All');
  const [search, setSearch] = useState('');
  const query = search.trim().toLowerCase();
  const visibleConversations = conversations.filter((conversation) =>
    (filter === 'All' || (filter === 'Groups' ? conversation.group : conversation.unread)) &&
    conversation.name.toLowerCase().includes(query),
  );
  const visibleFriends = friends.filter((friend) => friend.name.toLowerCase().includes(query));

  return (
    <View style={styles.screen}>
      <TextInput
        accessibilityLabel="Search chats or people"
        placeholder="Search chats or people..."
        placeholderTextColor={colors.text.muted}
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <View style={styles.tabs}>
        {(['Chats', 'Friends'] as const).map((name) => (
          <Pressable
            key={name}
            accessibilityRole="tab"
            accessibilityState={{ selected: tab === name }}
            onPress={() => setTab(name)}
            style={[styles.tab, tab === name && styles.selectedTab]}>
            <Text style={styles.name}>{name}</Text>
          </Pressable>
        ))}
      </View>
      {tab === 'Chats' ? (
        <>
          <View style={styles.filters}>
            {(['All', 'Groups', 'Unread'] as const).map((name) => (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityState={{ selected: filter === name }}
                onPress={() => setFilter(name)}
                style={[styles.filter, filter === name && styles.selectedFilter]}>
                <Text style={[styles.filterLabel, filter === name && styles.selectedFilterLabel]}>{name}</Text>
              </Pressable>
            ))}
          </View>
          <FlatList
            data={visibleConversations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text style={styles.empty}>No conversations found.</Text>}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={styles.avatar}><Text style={styles.name}>{item.initials}</Text></View>
                <View style={styles.details}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text numberOfLines={1} style={styles.supporting}>{item.message}</Text>
                </View>
                <View style={styles.metadata}>
                  <Text style={styles.supporting}>{item.time}</Text>
                  {item.unread && <Text style={styles.unread}>Unread</Text>}
                </View>
              </View>
            )}
          />
        </>
      ) : (
        <FlatList
          data={visibleFriends}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No friends found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.avatar}><Text style={styles.name}>{item.initials}</Text></View>
              <Text style={styles.name}>{item.name}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.screen, padding: space[16] },
  search: {
    ...typography['Body/Regular'],
    color: colors.text.primary,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.card,
    padding: space[16],
  },
  tabs: { flexDirection: 'row', marginVertical: space[12] },
  tab: { flex: 1, alignItems: 'center', padding: space[12], borderBottomWidth: 2, borderBottomColor: colors.border.default },
  selectedTab: { borderBottomColor: colors.border.gold },
  filters: { flexDirection: 'row', gap: space[8], marginBottom: space[12] },
  filter: { flex: 1, alignItems: 'center', padding: space[12], borderRadius: radius.pill, backgroundColor: colors.bg.neutral },
  selectedFilter: { backgroundColor: colors.bg.brand },
  filterLabel: { ...typography['Body/Strong'], color: colors.text.primary },
  selectedFilterLabel: { color: colors.text.inverse },
  list: { gap: space[8], paddingBottom: space[16] },
  row: { flexDirection: 'row', alignItems: 'center', gap: space[12], padding: space[12], borderRadius: radius.card, backgroundColor: colors.bg.surface },
  avatar: { width: 48, height: 48, borderRadius: radius.pill, backgroundColor: colors.bg.avatar, alignItems: 'center', justifyContent: 'center' },
  details: { flex: 1, gap: space[8] },
  name: { ...typography['Body/Strong'], color: colors.text.primary },
  supporting: { ...typography['Body/Regular'], color: colors.text.muted },
  metadata: { alignItems: 'flex-end', gap: space[8] },
  unread: { ...typography.Label, color: colors.text.gold },
  empty: { ...typography['Body/Regular'], color: colors.text.muted, textAlign: 'center', padding: space[20] },
});
