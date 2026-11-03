// Mock list for the Notifications skeleton; replaced by real data from Supabase later.
import type { AppNotification } from '@/components/notification-row';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'waitlist',
    type: 'waitlist-opened',
    title: 'A spot opened in 5v5 Soccer',
    body: "You're off the waitlist. Claim it before 6:30 PM.",
    time: '12m',
    unread: true,
  },
  {
    id: 'joined',
    type: 'player-joined',
    title: 'Marcus joined your game',
    body: '7 of 10 spots filled in Volleyball at BBC.',
    time: '40m',
    unread: true,
    person: 'Marcus',
  },
  {
    id: 'starting',
    type: 'starting-soon',
    title: '5v5 Soccer starts in 1 hour',
    body: 'Panther Field · MMC',
    time: '1h',
    unread: true,
  },
  {
    id: 'changed',
    type: 'game-changed',
    title: 'Sunday Morning Ultimate Frisbee Run at Panther Field moved',
    body:
      'The host moved this game from Panther Field to the Rec Center courts and pushed the start back an hour to 9:00 AM because the field is being re-sodded this weekend. Check the new time and spot before you head out.',
    time: '2h',
    unread: true,
  },
  {
    id: 'cancelled',
    type: 'game-cancelled',
    title: '3v3 Basketball was cancelled',
    body: 'Not enough players joined before the cutoff.',
    time: '3h',
    unread: false,
  },
  {
    id: 'confirmed',
    type: 'game-confirmed',
    title: 'Pickleball is confirmed',
    body: '4 players in. See you at 8:00 PM.',
    time: '5h',
    unread: false,
  },
  {
    id: 'left',
    type: 'player-left-late',
    title: 'Maximiliano Alejandro Fernández-Castellanos left your game',
    body: '5v5 Soccer is down to 8 of 10 spots, 2 hours before kickoff.',
    time: '1d',
    unread: false,
    person: 'Maximiliano Alejandro Fernández-Castellanos',
  },
  {
    id: 'friend',
    type: 'friend-playing',
    title: 'Josue is playing Thursday',
    body: '3v3 Basketball at the Rec Center, 2 spots left.',
    time: '1d',
    unread: false,
    // No photo on file: the avatar falls back to initials.
    person: 'Josue',
  },
  {
    id: 'rate',
    type: 'rate-host',
    title: 'How did it go?',
    body: 'Rate Alex R. as a host for 5v5 Soccer.',
    time: '1d',
    unread: false,
  },
];
