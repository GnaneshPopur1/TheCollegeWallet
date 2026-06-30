import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Platform, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { addTransaction } from '../services/transactionService';

// Stripe JS imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Replace with the user's actual publishable key later. 
// Standard test key for now.
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx'); 

const CheckoutForm = ({ amount, onSuccess }: { amount: number, onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!stripe || !elements || !amount) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // 1. Fetch Payment Intent from our backend
      const response = await fetch('http://localhost:4242/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      const { clientSecret } = await response.json();

      // 2. Confirm the payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const paymentResult = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
        },
      });

      if (paymentResult.error) {
        setError(paymentResult.error.message || 'Payment failed');
      } else if (paymentResult.paymentIntent?.status === 'succeeded') {
        onSuccess(); // Payment succeeded!
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.formContainer}>
      <View style={styles.cardContainer}>
        {Platform.OS === 'web' ? (
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#f8fafc',
                  '::placeholder': { color: '#64748b' },
                  iconColor: '#38bdf8',
                },
                invalid: { color: '#ef4444' },
              },
            }} 
          />
        ) : (
          <Text style={{color: 'white'}}>Stripe UI not supported natively in this demo.</Text>
        )}
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity 
        style={[styles.submitButton, (!stripe || processing || amount <= 0) && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={!stripe || processing || amount <= 0}
      >
        {processing ? (
          <ActivityIndicator color="#0f172a" />
        ) : (
          <Text style={styles.submitButtonText}>Pay ${amount.toFixed(2)}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default function AddMoneyScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [amountInput, setAmountInput] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const amount = parseFloat(amountInput) || 0;

  const handlePaymentSuccess = async () => {
    if (!user) return;
    try {
      await addTransaction(user.uid, 'Added Funds via Stripe', amount, 'income', '💳');
      setIsSuccess(true);
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (e) {
      console.error(e);
      alert("Payment processed, but failed to log transaction.");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Money</Text>
          <View style={{ width: 60 }} />
        </View>

        {isSuccess ? (
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successText}>Successfully Added ${amount.toFixed(2)}!</Text>
          </View>
        ) : (
          <>
            {/* Amount Input */}
            <View style={styles.amountContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="rgba(248, 250, 252, 0.3)"
                value={amountInput}
                onChangeText={setAmountInput}
                autoFocus
              />
            </View>

            {/* Stripe Elements Provider */}
            {Platform.OS === 'web' && (
              <Elements stripe={stripePromise}>
                <CheckoutForm amount={amount} onSuccess={handlePaymentSuccess} />
              </Elements>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0f172a' },
  container: { flex: 1, padding: 24, paddingTop: Platform.OS === 'android' ? 40 : 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 },
  backButton: { padding: 8, marginLeft: -8, width: 60 },
  backButtonText: { color: '#38bdf8', fontSize: 16, fontWeight: '500' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#f8fafc' },
  amountContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40 },
  currencySymbol: { fontSize: 48, fontWeight: '700', color: '#f8fafc', marginRight: 8, marginTop: -8 },
  amountInput: { fontSize: 64, fontWeight: '800', color: '#f8fafc', minWidth: 100, textAlign: 'center' },
  formContainer: { backgroundColor: '#1e293b', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)' },
  cardContainer: { backgroundColor: '#0f172a', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)', marginBottom: 20 },
  submitButton: { backgroundColor: '#38bdf8', padding: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#38bdf8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  submitButtonDisabled: { backgroundColor: '#334155', shadowOpacity: 0, elevation: 0 },
  submitButtonText: { color: '#0f172a', fontSize: 18, fontWeight: '700' },
  errorText: { color: '#ef4444', marginBottom: 16, textAlign: 'center' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  successIcon: { fontSize: 80, marginBottom: 16 },
  successText: { fontSize: 24, fontWeight: '700', color: '#f8fafc', textAlign: 'center' }
});
