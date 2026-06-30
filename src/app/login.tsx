import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, TextInput, ActivityIndicator, ScrollView } from 'react-native';
import { auth } from '../config/firebase';
import { 
  GithubAuthProvider, 
  GoogleAuthProvider, 
  OAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from 'firebase/auth';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user && !authLoading) {
      router.replace('/');
    }
  }, [user, authLoading]);

  const handleGitHubLogin = async () => {
    setErrorMsg('');
    const provider = new GithubAuthProvider();
    try {
      if (Platform.OS === 'web') {
        await signInWithPopup(auth, provider);
      } else {
        alert("Native GitHub auth requires expo-auth-session setup.");
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    const provider = new GoogleAuthProvider();
    try {
      if (Platform.OS === 'web') {
        await signInWithPopup(auth, provider);
      } else {
        alert("Native Google auth requires expo-auth-session setup.");
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleAppleLogin = async () => {
    setErrorMsg('');
    const provider = new OAuthProvider('apple.com');
    try {
      if (Platform.OS === 'web') {
        await signInWithPopup(auth, provider);
      } else {
        alert("Native Apple auth requires expo-auth-session setup.");
      }
    } catch (error: any) {
      setErrorMsg(error.message);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.glassCard}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>🎓</Text>
        </View>
        <Text style={styles.title}>TheCollegeWallet</Text>
        <Text style={styles.subtitle}>Manage your finances effortlessly.</Text>
        
        {/* Email/Password Auth */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#64748b"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#64748b"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

        <View style={styles.emailButtonContainer}>
          <TouchableOpacity 
            style={[styles.primaryButton, { flex: 1, marginRight: 8 }]} 
            onPress={handleEmailSignIn}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.primaryButtonText}>Log In</Text>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.secondaryButton, { flex: 1, marginLeft: 8 }]} 
            onPress={handleEmailSignUp}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social Auth */}
        <TouchableOpacity style={[styles.socialButton, styles.googleButton]} onPress={handleGoogleLogin}>
          <Text style={styles.googleButtonText}>Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.appleButton]} onPress={handleAppleLogin}>
          <Text style={styles.appleButtonText}>Apple</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.socialButton, styles.githubButton]} onPress={handleGitHubLogin}>
          <Text style={styles.githubButtonText}>GitHub</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 12,
  },
  errorText: {
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  emailButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#38bdf8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  secondaryButtonText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  dividerText: {
    color: '#64748b',
    paddingHorizontal: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
    marginBottom: 12,
  },
  googleButton: {
    backgroundColor: '#fff',
  },
  googleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#000',
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  githubButton: {
    backgroundColor: '#333',
  },
  githubButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  }
});
