import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Text, Container, Card, Button, TopNav } from '../components/UI';
import { Colors, Spacing } from '../constants';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getDocuments, updateDocument } from '../lib/db/firestore';
import { User, Role } from '../lib/db/types';

const UserManagement = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const fetchedUsers = await getDocuments<User>('users');
      setUsers(fetchedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: Role) => {
    try {
      await updateDocument<User>('users', userId, { role: newRole });
      
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      
      Alert.alert('Success', 'User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      Alert.alert('Error', 'Failed to update user role. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const UserItem = ({ user }: { user: User }) => {
    const userRole = user.role;
    
    return (
      <Card style={styles.userCard}>
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text variant="h3" weight="bold">{user.name || 'No Name'}</Text>
            <Text style={styles.emailText}>{user.email}</Text>
            <View style={styles.roleContainer}>
              <Text style={styles.label}>Role: </Text>
              <View style={[
                styles.roleBadge, 
                userRole === Role.ADMIN ? styles.adminBadge : 
                userRole === Role.EXPERT ? styles.expertBadge : styles.clientBadge
              ]}>
                <Text style={styles.roleText}>{userRole}</Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setSelectedUser(user)}
          >
            <Ionicons name="create-outline" size={20} color={Colors.primary} />
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  const UserEditModal = () => {
    if (!selectedUser) return null;

    return (
      <View style={styles.modalOverlay}>
        <Card style={styles.modalContainer}>
          <Text variant="h2" weight="bold" style={styles.modalTitle}>
            Edit User
          </Text>
          <Text style={styles.userEmail}>{selectedUser.email}</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Change Role:</Text>
            <View style={styles.roleOptions}>
              {Object.values(Role).map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    selectedUser.role === role && styles.selectedRole,
                    role === Role.ADMIN ? styles.adminOption : 
                    role === Role.EXPERT ? styles.expertOption : styles.clientOption
                  ]}
                  onPress={() => handleUpdateRole(selectedUser.id, role)}
                >
                  <Text 
                    style={{
                      ...(selectedUser.role === role ? styles.selectedRoleText : styles.roleOptionText)
                    }}
                  >
                    {role}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.modalActions}>
            <Button 
              title="Close" 
              onPress={() => setSelectedUser(null)} 
              variant="secondary"
              style={styles.modalButton}
            />
          </View>
        </Card>
      </View>
    );
  };

  return (
    <>
      <TopNav title="User Management" />
      <Container>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users by name or email"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <ScrollView style={styles.userList} showsVerticalScrollIndicator={false}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people" size={48} color={Colors.muted} />
                <Text style={styles.emptyStateText}>
                  {searchQuery ? 'No users matching your search' : 'No users found'}
                </Text>
              </View>
            ) : (
              filteredUsers.map(user => <UserItem key={user.id} user={user} />)
            )}
          </ScrollView>
        )}

        {selectedUser && <UserEditModal />}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  backButton: {
    marginRight: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: Colors.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    color: Colors.muted,
  },
  userList: {
    flex: 1,
  },
  userCard: {
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  userDetails: {
    flex: 1,
  },
  emailText: {
    color: Colors.muted,
    marginBottom: 5,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  label: {
    color: Colors.dark,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 4,
  },
  adminBadge: {
    backgroundColor: Colors.danger + '20',
  },
  expertBadge: {
    backgroundColor: Colors.warning + '20',
  },
  clientBadge: {
    backgroundColor: Colors.success + '20',
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  actionText: {
    marginLeft: 4,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyStateText: {
    color: Colors.muted,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '90%',
    padding: Spacing.lg,
  },
  modalTitle: {
    marginBottom: Spacing.xs,
  },
  userEmail: {
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  roleOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  roleOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.light,
  },
  adminOption: {
    borderColor: Colors.danger,
  },
  expertOption: {
    borderColor: Colors.warning,
  },
  clientOption: {
    borderColor: Colors.success,
  },
  selectedRole: {
    backgroundColor: Colors.primary,
  },
  roleOptionText: {
    fontWeight: '500',
  },
  selectedRoleText: {
    color: Colors.white,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.md,
  },
  modalButton: {
    minWidth: 100,
  },
});

export default UserManagement; 