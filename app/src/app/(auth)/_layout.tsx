// The signed-out screens. Welcome is always the first screen in this stack, so a signed-out
// person lands on Welcome (not Sign in), and Back on Sign in always has Welcome to return to.
import { Stack } from 'expo-router';

export const unstable_settings = {initialRouteName: 'welcome'}

export default function AuthLayout() {
  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name='welcome' />
      <Stack.Screen name='sign-in' />
    </Stack>
  )
}
