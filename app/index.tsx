import { Redirect } from 'expo-router';
import { useAuthStore } from '@/shared/store';
import { Loading } from '@/components/ui';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loading fullScreen message="Loading..." />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
