import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { auth } from '../config/firebase';
import { Transaction, subscribeToUserTransactions, addTransaction, calculateBalance } from '../services/transactionService';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) return;

    // Listen to real-time updates from Firestore
    const unsubscribe = subscribeToUserTransactions(user.uid, (data) => {
      setTransactions(data);
      setBalance(calculateBalance(data));
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = () => {
    auth.signOut();
  };

  const handleAddTestMoney = async () => {
    if (!user) return;
    const amount = Math.floor(Math.random() * 50) + 10; // Random amount between 10 and 60
    await addTransaction(user.uid, 'Venmo from Mom', amount, 'income', '💸');
  };

  const handleAddTestExpense = async () => {
    if (!user) return;
    const amount = Math.floor(Math.random() * 20) + 5; // Random amount between 5 and 25
    await addTransaction(user.uid, 'Campus Coffee', amount, 'expense', '☕');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.displayName || 'Student'}</Text>
          </View>
          <TouchableOpacity onPress={handleSignOut}>
            <Image 
              source={{ uri: user?.photoURL || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }} 
              style={styles.avatar} 
            />
          </TouchableOpacity>
        </View>

        {/* BALANCE CARD */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <Text style={styles.cardNumber}>**** **** **** 1920</Text>
          
          <View style={styles.circlesContainer}>
            <View style={[styles.circle, styles.circleLeft]} />
            <View style={[styles.circle, styles.circleRight]} />
          </View>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/send')}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>💸</Text>
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>📥</Text>
            </View>
            <Text style={styles.actionText}>Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleAddTestMoney}>
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>➕</Text>
            </View>
            <Text style={styles.actionText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* TRANSACTIONS */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 && (
            <Text style={{color: '#94a3b8', textAlign: 'center', marginTop: 20}}>No transactions yet. Click 'Add Money'!</Text>
          )}

          {transactions.map((tx) => (
            <View key={tx.id} style={styles.transactionItem}>
              <View style={styles.txLeft}>
                <View style={styles.txIconContainer}>
                  <Text style={styles.txIcon}>{tx.icon}</Text>
                </View>
                <View>
                  <Text style={styles.txTitle}>{tx.title}</Text>
                  <Text style={styles.txDate}>
                    {tx.date?.toDate ? tx.date.toDate().toLocaleDateString() : 'Just now'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.txAmount, tx.type === 'income' ? styles.txIncome : styles.txExpense]}>
                {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    padding: 24,
    paddingTop: Platform.OS === 'android' ? 40 : 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 4,
  },
  username: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#38bdf8',
  },
  balanceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 5,
    position: 'relative',
  },
  balanceLabel: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 8,
    zIndex: 2,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: 24,
    zIndex: 2,
  },
  cardNumber: {
    fontSize: 14,
    color: '#cbd5e1',
    letterSpacing: 2,
    zIndex: 2,
  },
  circlesContainer: {
    position: 'absolute',
    right: -20,
    bottom: -40,
    flexDirection: 'row',
    zIndex: 1,
    opacity: 0.2,
  },
  circle: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  circleLeft: {
    backgroundColor: '#38bdf8',
    marginRight: -40,
  },
  circleRight: {
    backgroundColor: '#818cf8',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  actionIcon: {
    fontSize: 24,
  },
  actionText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '500',
  },
  transactionsSection: {
    flex: 1,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#f8fafc',
  },
  seeAllText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  txLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  txIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txIcon: {
    fontSize: 20,
  },
  txTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 13,
    color: '#94a3b8',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  txIncome: {
    color: '#4ade80', // green
  },
  txExpense: {
    color: '#f8fafc',
  }
});
