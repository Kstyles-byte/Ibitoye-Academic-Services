import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { Container, Text, Button, Card } from '../components/UI';
import { Colors, Spacing, Layout } from '../constants';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Mock data for transactions
const MOCK_TRANSACTIONS = [
  {
    id: 'txn-001',
    date: '2023-11-15',
    amount: 250,
    type: 'payment',
    status: 'completed',
    serviceTitle: 'Research Paper on Climate Change',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'txn-002',
    date: '2023-11-08',
    amount: 150,
    type: 'payment',
    status: 'completed',
    serviceTitle: 'Linear Algebra Assignment',
    paymentMethod: 'PayPal',
  },
  {
    id: 'txn-003',
    date: '2023-10-30',
    amount: 75,
    type: 'refund',
    status: 'completed',
    serviceTitle: 'Economics Case Study Analysis',
    paymentMethod: 'Original Payment Method',
  },
  {
    id: 'txn-004',
    date: '2023-10-22',
    amount: 300,
    type: 'payment',
    status: 'completed',
    serviceTitle: 'Marketing Strategy Presentation',
    paymentMethod: 'Mastercard •••• 8765',
  },
  {
    id: 'txn-005',
    date: '2023-10-15',
    amount: 180,
    type: 'payment',
    status: 'pending',
    serviceTitle: 'Biochemistry Lab Report',
    paymentMethod: 'Bank Transfer',
  },
  {
    id: 'txn-006',
    date: '2023-10-10',
    amount: 50,
    type: 'deposit',
    status: 'completed',
    serviceTitle: 'Account Deposit',
    paymentMethod: 'Visa •••• 4242',
  },
  {
    id: 'txn-007',
    date: '2023-10-05',
    amount: 200,
    type: 'payment',
    status: 'failed',
    serviceTitle: 'Python Programming Project',
    paymentMethod: 'Visa •••• 9999',
  },
  {
    id: 'txn-008',
    date: '2023-10-01',
    amount: 200,
    type: 'payment',
    status: 'completed',
    serviceTitle: 'Python Programming Project',
    paymentMethod: 'PayPal',
  },
];

// Mock data for payment methods
const MOCK_PAYMENT_METHODS = [
  {
    id: 'pm-001',
    type: 'visa',
    last4: '4242',
    expMonth: 12,
    expYear: 2025,
    isDefault: true,
  },
  {
    id: 'pm-002',
    type: 'mastercard',
    last4: '8765',
    expMonth: 8,
    expYear: 2024,
    isDefault: false,
  },
  {
    id: 'pm-003',
    type: 'paypal',
    email: 'john.doe@example.com',
    isDefault: false,
  },
];

// Type definitions
type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: 'payment' | 'refund' | 'deposit';
  status: 'completed' | 'pending' | 'failed';
  serviceTitle: string;
  paymentMethod: string;
};

type PaymentMethod = {
  id: string;
  type: string;
  last4?: string;
  expMonth?: number;
  expYear?: number;
  email?: string;
  isDefault: boolean;
};

type FilterOptions = {
  search: string;
  type: string;
  dateRange: string;
};

const PaymentsPage = () => {
  const router = useRouter();
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    type: 'all',
    dateRange: 'all',
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'methods'>('history');

  // Filter types and date ranges
  const transactionTypes = ['all', 'payment', 'refund', 'deposit'];
  const dateRanges = ['all', 'last-30-days', 'last-90-days', 'this-year'];

  // Format price
  const formatPrice = (amount: number, type: string) => {
    return `${type === 'refund' ? '-' : type === 'deposit' ? '+' : ''}$${amount.toFixed(2)}`;
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Apply filters
  const applyFilters = () => {
    let result = [...transactions];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        transaction => 
          transaction.serviceTitle.toLowerCase().includes(searchLower) ||
          transaction.paymentMethod.toLowerCase().includes(searchLower)
      );
    }

    // Apply transaction type filter
    if (filters.type !== 'all') {
      result = result.filter(transaction => transaction.type === filters.type);
    }

    // Apply date range filter
    const today = new Date();
    if (filters.dateRange === 'last-30-days') {
      const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
      result = result.filter(transaction => new Date(transaction.date) >= thirtyDaysAgo);
    } else if (filters.dateRange === 'last-90-days') {
      const ninetyDaysAgo = new Date(today.setDate(today.getDate() - 90));
      result = result.filter(transaction => new Date(transaction.date) >= ninetyDaysAgo);
    } else if (filters.dateRange === 'this-year') {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      result = result.filter(transaction => new Date(transaction.date) >= startOfYear);
    }

    setFilteredTransactions(result);
  };

  // Update filter
  const updateFilter = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: value };
      return newFilters;
    });
    applyFilters();
  };

  // Calculate totals
  const calculateTotals = () => {
    let totalSpent = 0;
    let pendingAmount = 0;

    transactions.forEach(transaction => {
      if (transaction.status === 'completed') {
        if (transaction.type === 'payment') {
          totalSpent += transaction.amount;
        } else if (transaction.type === 'refund') {
          totalSpent -= transaction.amount;
        }
      } else if (transaction.status === 'pending' && transaction.type === 'payment') {
        pendingAmount += transaction.amount;
      }
    });

    return { totalSpent, pendingAmount };
  };

  const { totalSpent, pendingAmount } = calculateTotals();

  // Get card icon
  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa':
        return 'card-outline';
      case 'mastercard':
        return 'card-outline';
      case 'paypal':
        return 'logo-paypal';
      default:
        return 'wallet-outline';
    }
  };

  // Get transaction icon
  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'failed') return 'alert-circle-outline';
    
    switch (type) {
      case 'payment':
        return 'arrow-up-outline';
      case 'refund':
        return 'arrow-down-outline';
      case 'deposit':
        return 'add-circle-outline';
      default:
        return 'cash-outline';
    }
  };

  // Get transaction color
  const getTransactionColor = (type: string, status: string) => {
    if (status === 'failed') return Colors.danger;
    if (status === 'pending') return Colors.warning;
    
    switch (type) {
      case 'payment':
        return '#ff7043';
      case 'refund':
        return '#66bb6a';
      case 'deposit':
        return '#42a5f5';
      default:
        return Colors.primary;
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  // Render transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => {
    return (
      <TouchableOpacity 
        style={styles.transactionItem}
        onPress={() => {
          // View transaction details
          // For now, just show an alert
          Alert.alert('Transaction Details', `Transaction ID: ${item.id}`);
        }}
      >
        <View style={styles.transactionIconContainer}>
          <View 
            style={[
              styles.transactionIcon, 
              { backgroundColor: getTransactionColor(item.type, item.status) }
            ]}
          >
            <Ionicons 
              name={getTransactionIcon(item.type, item.status)} 
              size={20} 
              color="white" 
            />
          </View>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.serviceTitle}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
            <Text style={styles.transactionMethod}>{item.paymentMethod}</Text>
          </View>
          {item.status === 'failed' && (
            <Text style={styles.failedText}>Payment failed</Text>
          )}
          {item.status === 'pending' && (
            <Text style={styles.pendingText}>Processing</Text>
          )}
        </View>
        
        <View style={styles.transactionAmount}>
          <Text 
            style={[
              styles.amountText,
              item.type === 'refund' ? styles.refundAmount : null,
              item.type === 'deposit' ? styles.depositAmount : null,
              item.status === 'failed' ? styles.failedAmount : null,
              item.status === 'pending' ? styles.pendingAmount : null,
            ]}
          >
            {formatPrice(item.amount, item.type)}
          </Text>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render payment method
  const renderPaymentMethod = ({ item }: { item: PaymentMethod }) => {
    return (
      <Card style={styles.paymentMethodCard}>
        <View style={styles.paymentMethodHeader}>
          <View style={styles.cardIconContainer}>
            <Ionicons name={getCardIcon(item.type)} size={24} color={Colors.primary} />
          </View>
          
          <View style={styles.cardInfo}>
            {item.type === 'paypal' ? (
              <Text style={styles.cardTitle}>PayPal</Text>
            ) : (
              <Text style={styles.cardTitle}>
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)} •••• {item.last4}
              </Text>
            )}
            
            {item.expMonth && item.expYear ? (
              <Text style={styles.cardExpiry}>
                Expires {item.expMonth}/{item.expYear}
              </Text>
            ) : item.email ? (
              <Text style={styles.cardExpiry}>{item.email}</Text>
            ) : null}
          </View>
          
          {item.isDefault && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultText}>Default</Text>
            </View>
          )}
        </View>
        
        <View style={styles.paymentMethodActions}>
          <TouchableOpacity 
            style={[styles.paymentMethodAction, !item.isDefault && styles.setDefaultAction]}
            onPress={() => {
              // Set as default payment method
              if (!item.isDefault) {
                // Update payment methods
                const updatedMethods = paymentMethods.map(method => ({
                  ...method,
                  isDefault: method.id === item.id,
                }));
                setPaymentMethods(updatedMethods);
              }
            }}
            disabled={item.isDefault}
          >
            <Text 
              style={[
                styles.actionText, 
                !item.isDefault && styles.setDefaultText
              ]}
            >
              {item.isDefault ? 'Default Method' : 'Set as Default'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.paymentMethodAction}
            onPress={() => {
              // Edit payment method
              // This would navigate to an edit screen
              Alert.alert('Edit Payment Method', `Edit ${item.type} payment method`);
            }}
          >
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.paymentMethodAction, styles.removeAction]}
            onPress={() => {
              // Remove payment method
              if (item.isDefault) {
                Alert.alert(
                  'Cannot Remove Default',
                  'Please set another payment method as default before removing this one.'
                );
                return;
              }
              
              Alert.alert(
                'Remove Payment Method',
                `Are you sure you want to remove this ${item.type} payment method?`,
                [
                  {
                    text: 'Cancel',
                    style: 'cancel',
                  },
                  {
                    text: 'Remove',
                    onPress: () => {
                      // Update payment methods
                      setPaymentMethods(
                        paymentMethods.filter(method => method.id !== item.id)
                      );
                    },
                    style: 'destructive',
                  },
                ]
              );
            }}
          >
            <Text style={styles.removeText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[0]}>
        <View style={styles.stickyHeader}>
          <Container>
            <View style={styles.header}>
              <Text variant="h2" weight="bold" style={styles.title}>
                Payments
              </Text>
              <Button
                variant="primary"
                title="Add Payment Method"
                onPress={() => {
                  // Navigate to add payment method screen
                  Alert.alert('Add Payment Method', 'This would navigate to an add payment method screen');
                }}
                size="small"
                style={styles.addButton}
              />
            </View>

            {/* Summary Cards */}
            <View style={styles.summaryCards}>
              <Card style={[styles.summaryCard, styles.spentCard]}>
                <Text style={styles.summaryLabel}>Total Spent</Text>
                <Text style={styles.summaryAmount}>${totalSpent.toFixed(2)}</Text>
              </Card>
              
              <Card style={[styles.summaryCard, styles.pendingCard]}>
                <Text style={styles.summaryLabel}>Pending</Text>
                <Text style={styles.summaryAmount}>${pendingAmount.toFixed(2)}</Text>
              </Card>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'history' && styles.activeTab]}
                onPress={() => setActiveTab('history')}
              >
                <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                  Transaction History
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'methods' && styles.activeTab]}
                onPress={() => setActiveTab('methods')}
              >
                <Text style={[styles.tabText, activeTab === 'methods' && styles.activeTabText]}>
                  Payment Methods
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transaction History Filters */}
            {activeTab === 'history' && (
              <View style={styles.searchContainer}>
                <View style={styles.searchInputContainer}>
                  <Ionicons name="search" size={20} color={Colors.muted} style={styles.searchIcon} />
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChangeText={(text) => updateFilter('search', text)}
                  />
                  {filters.search ? (
                    <TouchableOpacity onPress={() => updateFilter('search', '')}>
                      <Ionicons name="close-circle" size={18} color={Colors.muted} />
                    </TouchableOpacity>
                  ) : null}
                </View>
                <TouchableOpacity 
                  style={styles.filterButton}
                  onPress={() => setIsFilterVisible(!isFilterVisible)}
                >
                  <Ionicons 
                    name={isFilterVisible ? "options" : "options-outline"} 
                    size={22} 
                    color={isFilterVisible ? Colors.primary : Colors.dark} 
                  />
                </TouchableOpacity>
              </View>
            )}

            {/* Filters */}
            {activeTab === 'history' && isFilterVisible && (
              <View style={styles.filtersContainer}>
                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Type:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                    {transactionTypes.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.filterItem,
                          filters.type === type && styles.filterItemActive
                        ]}
                        onPress={() => updateFilter('type', type)}
                      >
                        <Text 
                          style={[
                            styles.filterItemText,
                            filters.type === type && styles.filterItemTextActive
                          ]}
                        >
                          {type === 'all' ? 'All Types' : 
                            type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.filterSection}>
                  <Text style={styles.filterLabel}>Date Range:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
                    {dateRanges.map((range) => (
                      <TouchableOpacity
                        key={range}
                        style={[
                          styles.filterItem,
                          filters.dateRange === range && styles.filterItemActive
                        ]}
                        onPress={() => updateFilter('dateRange', range)}
                      >
                        <Text 
                          style={[
                            styles.filterItemText,
                            filters.dateRange === range && styles.filterItemTextActive
                          ]}
                        >
                          {range === 'all' ? 'All Time' : 
                            range === 'last-30-days' ? 'Last 30 Days' :
                            range === 'last-90-days' ? 'Last 90 Days' : 'This Year'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </Container>
        </View>

        <Container style={styles.contentContainer}>
          {/* Transaction History Tab */}
          {activeTab === 'history' && (
            <>
              <Text style={styles.resultsText}>
                {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
              </Text>
              
              {filteredTransactions.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="receipt-outline" size={60} color={Colors.muted} />
                  <Text style={styles.emptyStateTitle}>No transactions found</Text>
                  <Text style={styles.emptyStateText}>
                    Try adjusting your filters or request a new service
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={filteredTransactions}
                  renderItem={renderTransactionItem}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.transactionsList}
                />
              )}
            </>
          )}
          
          {/* Payment Methods Tab */}
          {activeTab === 'methods' && (
            <>
              <Text style={styles.resultsText}>
                {paymentMethods.length} payment method{paymentMethods.length !== 1 ? 's' : ''}
              </Text>
              
              {paymentMethods.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="wallet-outline" size={60} color={Colors.muted} />
                  <Text style={styles.emptyStateTitle}>No payment methods</Text>
                  <Text style={styles.emptyStateText}>
                    Add a payment method to easily pay for your services
                  </Text>
                  <Button
                    title="Add Payment Method"
                    onPress={() => {
                      // Navigate to add payment method screen
                      Alert.alert('Add Payment Method', 'This would navigate to an add payment method screen');
                    }}
                    style={styles.emptyStateButton}
                  />
                </View>
              ) : (
                <FlatList
                  data={paymentMethods}
                  renderItem={renderPaymentMethod}
                  keyExtractor={item => item.id}
                  scrollEnabled={false}
                  contentContainerStyle={styles.paymentMethodsList}
                />
              )}
            </>
          )}
        </Container>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light,
  },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: Colors.light,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: {
    flex: 1,
  },
  addButton: {
    minWidth: 160,
  },
  summaryCards: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  summaryCard: {
    flex: 1,
    marginHorizontal: Spacing.xs / 2,
    padding: Spacing.md,
  },
  spentCard: {
    backgroundColor: '#e3f2fd',
  },
  pendingCard: {
    backgroundColor: '#fff8e1',
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: Spacing.xs / 2,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    padding: Spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#eee',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontWeight: '500',
    color: Colors.muted,
  },
  activeTabText: {
    color: Colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: Layout.borderRadius.medium,
    paddingHorizontal: Spacing.sm,
    height: 45,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 45,
    fontSize: 16,
  },
  filterButton: {
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.xs,
    borderRadius: Layout.borderRadius.medium,
    backgroundColor: '#f5f5f5',
  },
  filtersContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: '#f9f9f9',
    borderRadius: Layout.borderRadius.medium,
  },
  filterSection: {
    marginBottom: Spacing.sm,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: Colors.dark,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filterItem: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.small,
    backgroundColor: '#eee',
    marginRight: Spacing.xs,
  },
  filterItemActive: {
    backgroundColor: Colors.primary,
  },
  filterItemText: {
    fontSize: 14,
    color: Colors.dark,
  },
  filterItemTextActive: {
    color: Colors.white,
  },
  contentContainer: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.muted,
    marginBottom: Spacing.md,
  },
  transactionsList: {
    gap: Spacing.sm,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: Layout.borderRadius.medium,
    ...Layout.shadows.small,
  },
  transactionIconContainer: {
    marginRight: Spacing.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.dark,
    marginBottom: 2,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionDate: {
    fontSize: 13,
    color: Colors.muted,
    marginRight: Spacing.xs,
  },
  transactionMethod: {
    fontSize: 13,
    color: Colors.muted,
  },
  failedText: {
    fontSize: 13,
    color: Colors.danger,
    marginTop: 2,
  },
  pendingText: {
    fontSize: 13,
    color: Colors.warning,
    marginTop: 2,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  refundAmount: {
    color: '#66bb6a',
  },
  depositAmount: {
    color: '#42a5f5',
  },
  failedAmount: {
    textDecorationLine: 'line-through',
    color: Colors.muted,
  },
  pendingAmount: {
    color: Colors.warning,
  },
  statusText: {
    fontSize: 12,
    color: Colors.muted,
  },
  paymentMethodsList: {
    gap: Spacing.md,
  },
  paymentMethodCard: {
    padding: Spacing.md,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 2,
  },
  cardExpiry: {
    fontSize: 14,
    color: Colors.muted,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.primary + '20',
    borderRadius: Layout.borderRadius.pill,
    marginLeft: Spacing.sm,
  },
  defaultText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  paymentMethodActions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: Spacing.md,
  },
  paymentMethodAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xs,
  },
  actionText: {
    fontSize: 14,
    color: Colors.muted,
  },
  setDefaultAction: {
    borderRadius: Layout.borderRadius.small,
  },
  setDefaultText: {
    color: Colors.primary,
  },
  removeAction: {
    borderRadius: Layout.borderRadius.small,
  },
  removeText: {
    color: Colors.danger,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
    color: Colors.dark,
  },
  emptyStateText: {
    fontSize: 14,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateButton: {
    minWidth: 200,
  },
});

export default PaymentsPage; 