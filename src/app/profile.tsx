import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Switch } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(true);

  const handleSignOut = () => {
    auth.signOut();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Profile Info */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }} 
            style={styles.avatarLarge} 
          />
          <Text style={styles.displayName}>{user?.displayName || 'Student'}</Text>
          <Text style={styles.email}>{user?.email || 'student@university.edu'}</Text>
        </View>

        {/* Settings List */}
        <View style={styles.settingsGroup}>
          <Text style={styles.groupTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch 
              value={pushEnabled} 
              onValueChange={setPushEnabled}
              trackColor={{ false: '#334155', true: '#38bdf8' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#f8fafc'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch 
              value={darkMode} 
              onValueChange={setDarkMode}
              trackColor={{ false: '#334155', true: '#38bdf8' }}
              thumbColor={Platform.OS === 'ios' ? undefined : '#f8fafc'}
            />
          </View>
        </View>

        {/* Sign Out Button */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    padding: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 40,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#38bdf8',
    marginBottom: 16,
  },
  displayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#94a3b8',
  },
  settingsGroup: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  settingLabel: {
    fontSize: 16,
    color: '#f8fafc',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.5)',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '700',
  },
});
