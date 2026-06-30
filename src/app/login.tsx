import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { auth } from '../config/firebase';
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      router.replace('/');
    }
  }, [user, loading]);

  const handleGitHubLogin = async () => {
    const provider = new GithubAuthProvider();
    try {
      if (Platform.OS === 'web') {
        // For web, use popup
        await signInWithPopup(auth, provider);
      } else {
        alert("Native GitHub auth requires expo-auth-session setup.");
      }
    } catch (error: any) {
      console.error("Login failed:", error.message);
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.glassCard}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🎓</Text>
        </View>
        <Text style={styles.title}>TheCollegeWallet</Text>
        <Text style={styles.subtitle}>Manage your finances effortlessly.</Text>
        
        <TouchableOpacity style={styles.githubButton} onPress={handleGitHubLogin}>
          <Text style={styles.githubButtonText}>Sign in with GitHub</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  glassCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
    textAlign: 'center',
  },
  githubButton: {
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
  },
  githubButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  }
});
