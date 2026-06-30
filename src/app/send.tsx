import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { sendP2PMoney } from '../services/transactionService';

export default function SendScreen() {
  const router = useRouter();
  const { recipientId, recipientName } = useLocalSearchParams<{ recipientId: string, recipientName: string }>();
  const { user } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [loading, setLoading] = useState(false);

  // If no recipient is passed (e.g., navigated here directly), go back to search
  useEffect(() => {
    if (!recipientId) {
      alert("Please select a recipient first.");
      router.replace('/search');
    }
  }, [recipientId]);

  const handleSend = async () => {
    if (!amount || !recipientId || !user) return;
    
    setLoading(true);
    try {
      const numericAmount = parseFloat(amount);
      const memoText = memo || 'No memo';
      
      await sendP2PMoney(
        user.uid, 
        recipientId, 
        numericAmount, 
        memoText, 
        user.displayName || user.email || 'Someone', 
        recipientName || 'Friend'
      );
      
      // Navigate back to the dashboard upon success
      router.replace('/');
    } catch (error) {
      console.error("Failed to send money", error);
      alert("Failed to send money. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = amount.length > 0 && !isNaN(parseFloat(amount));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Send Money</Text>
          <View style={{ width: 60 }} /> {/* Placeholder to center title */}
        </View>

        {/* Amount Input */}
        <View style={styles.amountContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.amountInput}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor="rgba(248, 250, 252, 0.3)"
            value={amount}
            onChangeText={setAmount}
            autoFocus
          />
        </View>

        {/* Form Fields */}
        <View style={styles.formContainer}>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>To:</Text>
            <Text style={styles.textInputDisabled}>{recipientName || 'Select a user'}</Text>
          </View>
          
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>For:</Text>
            <TextInput
              style={styles.textInput}
              placeholder="What's this for? (e.g. Pizza 🍕)"
              placeholderTextColor="#64748b"
              value={memo}
              onChangeText={setMemo}
            />
          </View>
        </View>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]} 
            onPress={handleSend}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <ActivityIndicator color="#0f172a" />
            ) : (
              <Text style={styles.submitButtonText}>Send Money</Text>
            )}
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
    paddingTop: Platform.OS === 'android' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
    width: 60,
  },
  backButtonText: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  currencySymbol: {
    fontSize: 48,
    fontWeight: '700',
    color: '#f8fafc',
    marginRight: 8,
    marginTop: -8, // slight adjustment to align with text input
  },
  amountInput: {
    fontSize: 64,
    fontWeight: '800',
    color: '#f8fafc',
    minWidth: 100,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  inputLabel: {
    width: 50,
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#f8fafc',
  },
  textInputDisabled: {
    flex: 1,
    fontSize: 16,
    color: '#94a3b8',
    fontWeight: '500',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#38bdf8',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#334155',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '700',
  },
});
