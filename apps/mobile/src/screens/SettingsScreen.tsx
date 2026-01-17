import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { usePlayer } from '../hooks/usePlayer';
import { colors, spacing, borderRadius, typography } from '../theme';

export function SettingsScreen() {
  const [email, setEmail] = useState('');
  const { signOut, loading } = useAuth();
  const { clearCache } = usePlayer();

  useEffect(() => {
    getUserEmail();
  }, []);

  async function getUserEmail() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setEmail(user.email || 'No email');
    }
  }

  function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  }

  async function handleClearCache() {
    const count = await clearCache();
    Alert.alert('Cache Cleared', `Removed ${count} cached audio files`);
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>👤</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{email}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Storage Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Storage</Text>
        <TouchableOpacity 
          style={styles.card}
          onPress={handleClearCache}
          activeOpacity={0.7}
        >
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>🗑</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowValue}>Clear Audio Cache</Text>
              <Text style={styles.rowLabel}>Free up space</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>📱</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>✨</Text>
            </View>
            <View style={styles.rowContent}>
              <Text style={styles.rowLabel}>Powered by</Text>
              <Text style={styles.rowValue}>AI Audiobook Generation</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sign Out */}
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={handleSignOut}
        disabled={loading}
        activeOpacity={0.85}
      >
        <Text style={styles.signOutText}>
          {loading ? 'Signing out...' : 'Sign Out'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footer}>
        Made with ♥ for audiobook lovers
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 120,
  },
  section: {
    marginBottom: spacing.xxl,
  },
  sectionLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.md,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.backgroundCard,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  icon: {
    fontSize: 18,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 72,
  },
  signOutBtn: {
    backgroundColor: colors.error,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  signOutText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
  footer: {
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.xxl,
  },
});
