import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, Platform, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export default function SearchScreen() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // We can do a basic text search by fetching users and filtering locally, 
  // or use Firestore query. Firestore doesn't have native partial text search, 
  // so for MVP we will fetch all users (or up to a limit) and filter locally.
  useEffect(() => {
    const fetchUsers = async () => {
      if (searchQuery.trim().length < 1) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(50));
        const querySnapshot = await getDocs(q);
        
        const fetchedUsers: UserProfile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as UserProfile;
          // Don't show the current user in search results
          if (data.uid !== user?.uid) {
            const lowerQuery = searchQuery.toLowerCase();
            const matchesName = data.displayName?.toLowerCase().includes(lowerQuery);
            const matchesEmail = data.email?.toLowerCase().includes(lowerQuery);
            if (matchesName || matchesEmail) {
              fetchedUsers.push(data);
            }
          }
        });
        setResults(fetchedUsers);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, user]);

  const handleSelectUser = (selectedUser: UserProfile) => {
    // Navigate to send screen with recipient parameters
    router.push({
      pathname: '/send',
      params: { 
        recipientId: selectedUser.uid,
        recipientName: selectedUser.displayName || selectedUser.email 
      }
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Find Friends</Text>
          <View style={{ width: 60 }} />
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or email..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            autoCapitalize="none"
          />
        </View>

        {/* Results List */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} color="#38bdf8" />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.uid}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <Text style={styles.emptyText}>
                {searchQuery.length > 0 ? 'No users found.' : 'Type to start searching...'}
              </Text>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.userCard} onPress={() => handleSelectUser(item)}>
                <Image source={{ uri: item.photoURL }} style={styles.avatar} />
                <View style={styles.userInfo}>
                  <Text style={styles.userName}>{item.displayName}</Text>
                  <Text style={styles.userEmail}>{item.email}</Text>
                </View>
                <View style={styles.sendIconContainer}>
                  <Text style={styles.sendIconText}>Send</Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

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
    marginBottom: 24,
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
  searchContainer: {
    marginBottom: 24,
  },
  searchInput: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 16,
    color: '#f8fafc',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  listContainer: {
    paddingBottom: 24,
  },
  emptyText: {
    color: '#64748b',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f8fafc',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#94a3b8',
  },
  sendIconContainer: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  sendIconText: {
    color: '#38bdf8',
    fontSize: 14,
    fontWeight: '600',
  }
});
