import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '@/components/ui';

export default function NotFoundScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.code}>404</Text>
      <Text style={styles.title}>Not Found</Text>
      <Text style={styles.text}>This screen doesn't exist.</Text>
      <Link href="/" asChild>
        <Button title="Go to Home" onPress={() => {}} variant="primary" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#0F172A',
  },
  code: {
    fontSize: 60,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  text: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 32,
  },
});
