import { router } from 'expo-router';
import { Text, View, Pressable } from 'react-native';

export default function CreateGameScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Create game</Text>
      <Pressable onPress={() => router.back()}>
        <Text>Close</Text>
      </Pressable>
    </View>
  );
}
