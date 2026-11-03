import { ProfileContent } from '@/features/profile/profile-content';
import { MOCK_USER } from '@/mock/profile';

export default function ProfileScreen() {
  return <ProfileContent user={MOCK_USER} />;
}
