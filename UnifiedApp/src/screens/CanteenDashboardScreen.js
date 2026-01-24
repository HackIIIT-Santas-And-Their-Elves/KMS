import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    RefreshControl,
    Alert,
    Modal,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { canteenAPI, orderAPI } from '../services/api';
import colors from '../constants/colors';

const DashboardScreen = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [canteen, setCanteen] = useState(null);
    const [orders, setOrders] = useState([]);
    const [completedOrders, setCompletedOrders] = useState([]);
    const [earnings, setEarnings] = useState({ daily: 0, monthly: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        if (user?.canteenId) {
            fetchData();
            const interval = setInterval(fetchData, 15000); // Refresh every 15 seconds
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [canteenRes, ordersRes, completedRes] = await Promise.all([
                canteenAPI.getById(user.canteenId),
                orderAPI.getByCanteen(user.canteenId),
                orderAPI.getCompletedByCanteen(user.canteenId),
            ]);
            setCanteen(canteenRes.data.data);
            setOrders(ordersRes.data.data);
            setCompletedOrders(completedRes.data.data);
            setEarnings(completedRes.data.earnings);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleToggleOpen = async () => {
        try {
            console.log('🔄 Toggling canteen open status:', user.canteenId);

            // If canteen is currently open (about to close), also turn off online orders
            if (canteen.isOpen && canteen.isOnlineOrdersEnabled) {
                console.log('🔄 Canteen closing - also disabling online orders');
                await canteenAPI.toggleOnlineOrders(user.canteenId);
            }

            await canteenAPI.toggleOpen(user.canteenId);
            fetchData();
        } catch (error) {
            console.error('❌ Error toggling canteen status:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to toggle canteen status';
            Alert.alert('Error', errorMsg);
        }
    };

    const handleToggleOnlineOrders = async () => {
        // Prevent enabling online orders if canteen is closed
        if (!canteen.isOpen && !canteen.isOnlineOrdersEnabled) {
            Alert.alert('Cannot Enable', 'Please open the canteen first before enabling online orders.');
            return;
        }

        try {
            console.log('🔄 Toggling online orders:', user.canteenId);
            await canteenAPI.toggleOnlineOrders(user.canteenId);
            fetchData();
        } catch (error) {
            console.error('❌ Error toggling online orders:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to toggle online orders';
            Alert.alert('Error', errorMsg);
        }
    };

    const handleOrderAction = async (orderId, action) => {
        try {
            await orderAPI[action](orderId);
            fetchData();
            Alert.alert('Success', `Order ${action}ed successfully`);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || `Failed to ${action} order`);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    const renderOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => setSelectedOrder(item)}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <Text style={styles.customerName}>{item.userId.name}</Text>

            {/* Items List */}
            <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Items to prepare:</Text>
                {item.items.map((orderItem, index) => (
                    <View key={index} style={styles.itemTextRow}>
                        <View style={[styles.vegIndicator, { borderColor: orderItem.isVeg ? '#22c55e' : '#ef4444' }]}>
                            <View style={[styles.vegDot, { backgroundColor: orderItem.isVeg ? '#22c55e' : '#ef4444' }]} />
                        </View>
                        <Text style={styles.itemText}>
                            {orderItem.name} x{orderItem.quantity}
                        </Text>
                    </View>
                ))}
            </View>

            <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>

            <View style={styles.orderActions}>
                {item.status === 'PAID' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleOrderAction(item._id, 'accept');
                        }}
                    >
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'ACCEPTED' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleOrderAction(item._id, 'prepare');
                        }}
                    >
                        <Text style={styles.actionButtonText}>Start Preparing</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'PREPARING' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            handleOrderAction(item._id, 'ready');
                        }}
                    >
                        <Text style={styles.actionButtonText}>Mark Ready</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'READY' && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.scanButton]}
                        onPress={(e) => {
                            e.stopPropagation();
                            navigation.navigate('QRScanner', { orderId: item._id });
                        }}
                    >
                        <Ionicons name="qr-code-outline" size={16} color={colors.white} />
                        <Text style={styles.actionButtonText}> Scan Pickup</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    const renderCompletedOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => setSelectedOrder(item)}
            activeOpacity={0.7}
        >
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
                <View style={[styles.statusBadge, styles.completedBadge]}>
                    <Text style={styles.statusText}>COMPLETED</Text>
                </View>
            </View>

            <Text style={styles.customerName}>{item.userId.name}</Text>
            <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>
            <Text style={styles.orderDate}>
                {new Date(item.updatedAt).toLocaleDateString()} at {new Date(item.updatedAt).toLocaleTimeString()}
            </Text>
        </TouchableOpacity>
    );

    const getStatusStyle = (status) => {
        const colors = {
            PAID: { backgroundColor: '#2196F3' },
            ACCEPTED: { backgroundColor: '#4CAF50' },
            PREPARING: { backgroundColor: '#FF9800' },
            READY: { backgroundColor: '#9C27B0' },
        };
        return colors[status] || { backgroundColor: '#757575' };
    };

    if (!canteen) {
        return (
            <View style={styles.centerContainer}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.canteenName}>{canteen.name}</Text>
                        <Text style={styles.ownerEmail}>{user?.email}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutHeaderButton}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>

                {/* Status Cards */}
                <View style={styles.statusCardsContainer}>
                    {/* Canteen Open/Close Button */}
                    <TouchableOpacity
                        style={[
                            styles.statusCard,
                            canteen.isOpen ? styles.statusCardOpen : styles.statusCardClosed
                        ]}
                        onPress={handleToggleOpen}
                        activeOpacity={0.8}
                    >
                        <View style={[
                            styles.statusIconContainer,
                            canteen.isOpen ? styles.iconContainerOpen : styles.iconContainerClosed
                        ]}>
                            <Ionicons
                                name={canteen.isOpen ? "storefront" : "storefront-outline"}
                                size={28}
                                color={colors.white}
                            />
                        </View>
                        <Text style={styles.statusCardTitle}>Canteen</Text>
                        <Text style={[
                            styles.statusCardValue,
                            canteen.isOpen ? styles.statusValueOpen : styles.statusValueClosed
                        ]}>
                            {canteen.isOpen ? 'OPEN' : 'CLOSED'}
                        </Text>
                        <Text style={styles.statusCardHint}>
                            Tap to {canteen.isOpen ? 'close' : 'open'}
                        </Text>
                    </TouchableOpacity>

                    {/* Online Orders Button */}
                    <TouchableOpacity
                        style={[
                            styles.statusCard,
                            !canteen.isOpen && !canteen.isOnlineOrdersEnabled && styles.statusCardDisabled,
                            canteen.isOnlineOrdersEnabled ? styles.statusCardOnline : styles.statusCardOffline
                        ]}
                        onPress={handleToggleOnlineOrders}
                        activeOpacity={0.8}
                        disabled={!canteen.isOpen && !canteen.isOnlineOrdersEnabled}
                    >
                        <View style={[
                            styles.statusIconContainer,
                            canteen.isOnlineOrdersEnabled ? styles.iconContainerOnline : styles.iconContainerOffline,
                            !canteen.isOpen && !canteen.isOnlineOrdersEnabled && styles.iconContainerDisabled
                        ]}>
                            <Ionicons
                                name={canteen.isOnlineOrdersEnabled ? "globe" : "globe-outline"}
                                size={28}
                                color={colors.white}
                            />
                        </View>
                        <Text style={[
                            styles.statusCardTitle,
                            !canteen.isOpen && !canteen.isOnlineOrdersEnabled && styles.textDisabled
                        ]}>Online Orders</Text>
                        <Text style={[
                            styles.statusCardValue,
                            canteen.isOnlineOrdersEnabled ? styles.statusValueOnline : styles.statusValueOffline,
                            !canteen.isOpen && !canteen.isOnlineOrdersEnabled && styles.textDisabled
                        ]}>
                            {canteen.isOnlineOrdersEnabled ? 'ENABLED' : 'DISABLED'}
                        </Text>
                        <Text style={[
                            styles.statusCardHint,
                            !canteen.isOpen && !canteen.isOnlineOrdersEnabled && styles.textDisabled
                        ]}>
                            {!canteen.isOpen && !canteen.isOnlineOrdersEnabled
                                ? 'Open canteen first'
                                : `Tap to ${canteen.isOnlineOrdersEnabled ? 'disable' : 'enable'}`
                            }
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Manage Menu Button */}
                <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => navigation.navigate('MenuManagement')}
                    activeOpacity={0.8}
                >
                    <Ionicons name="restaurant" size={20} color={colors.white} />
                    <Text style={styles.menuButtonText}>Manage Menu</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.white} />
                </TouchableOpacity>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'active' && styles.activeTab]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
                        Active Orders ({orders.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
                    onPress={() => setActiveTab('completed')}
                >
                    <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
                        Completed ({completedOrders.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Earnings Summary (only show in completed tab) */}
            {activeTab === 'completed' && (
                <View style={styles.earningsContainer}>
                    <View style={styles.earningsCard}>
                        <Text style={styles.earningsLabel}>Today's Earnings</Text>
                        <Text style={styles.earningsAmount}>₹{earnings.daily.toFixed(2)}</Text>
                    </View>
                    <View style={styles.earningsCard}>
                        <Text style={styles.earningsLabel}>This Month</Text>
                        <Text style={styles.earningsAmount}>₹{earnings.monthly.toFixed(2)}</Text>
                    </View>
                </View>
            )}

            {/* Orders List */}
            <View style={styles.ordersSection}>
                <FlatList
                    data={activeTab === 'active' ? orders : completedOrders}
                    renderItem={activeTab === 'active' ? renderOrder : renderCompletedOrder}
                    keyExtractor={(item) => item._id}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                            <Text style={styles.emptyText}>
                                {activeTab === 'active' ? 'No active orders' : 'No completed orders'}
                            </Text>
                        </View>
                    }
                />
            </View>

            {/* Order Details Modal */}
            <Modal
                visible={selectedOrder !== null}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedOrder(null)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setSelectedOrder(null)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {selectedOrder && (
                                <>
                                    <View style={styles.modalHeader}>
                                        <Text style={styles.modalTitle}>Order Details</Text>
                                        <TouchableOpacity onPress={() => setSelectedOrder(null)}>
                                            <Ionicons name="close" size={28} color={colors.text} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalLabel}>Order ID</Text>
                                        <Text style={styles.modalValue}>#{selectedOrder._id.slice(-6)}</Text>
                                    </View>

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalLabel}>Status</Text>
                                        <View style={[styles.statusBadge, getStatusStyle(selectedOrder.status)]}>
                                            <Text style={styles.statusText}>{selectedOrder.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalLabel}>Customer</Text>
                                        <Text style={styles.modalValue}>{selectedOrder.userId.name}</Text>
                                        <Text style={styles.modalSubValue}>{selectedOrder.userId.email}</Text>
                                    </View>

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalLabel}>Order Time</Text>
                                        <Text style={styles.modalValue}>
                                            {new Date(selectedOrder.createdAt).toLocaleDateString()} at{' '}
                                            {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                                        </Text>
                                    </View>

                                    {selectedOrder.status === 'COMPLETED' && (
                                        <View style={styles.modalSection}>
                                            <Text style={styles.modalLabel}>Completed At</Text>
                                            <Text style={styles.modalValue}>
                                                {new Date(selectedOrder.updatedAt).toLocaleDateString()} at{' '}
                                                {new Date(selectedOrder.updatedAt).toLocaleTimeString()}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalLabel}>Items</Text>
                                        {selectedOrder.items.map((item, index) => (
                                            <View key={index} style={styles.modalItemRow}>
                                                <View style={styles.modalItemNameContainer}>
                                                    <View style={[styles.vegIndicatorModal, { borderColor: item.isVeg ? '#22c55e' : '#ef4444' }]}>
                                                        <View style={[styles.vegDotModal, { backgroundColor: item.isVeg ? '#22c55e' : '#ef4444' }]} />
                                                    </View>
                                                    <Text style={styles.modalItemName}>
                                                        {item.name} x{item.quantity}
                                                    </Text>
                                                </View>
                                                <Text style={styles.modalItemPrice}>₹{item.price * item.quantity}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {selectedOrder.specialInstructions && (
                                        <View style={styles.modalSection}>
                                            <Text style={styles.modalLabel}>Special Instructions</Text>
                                            <Text style={styles.modalValue}>{selectedOrder.specialInstructions}</Text>
                                        </View>
                                    )}

                                    <View style={styles.modalTotalSection}>
                                        <Text style={styles.modalTotalLabel}>Total Amount</Text>
                                        <Text style={styles.modalTotalValue}>₹{selectedOrder.totalAmount}</Text>
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        backgroundColor: colors.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    canteenName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    ownerEmail: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    logoutHeaderButton: {
        padding: 8,
    },
    // Status Cards
    statusCardsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statusCard: {
        flex: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
    },
    statusCardOpen: {
        backgroundColor: '#E8F5E9',
        borderWidth: 2,
        borderColor: colors.success,
    },
    statusCardClosed: {
        backgroundColor: '#FFEBEE',
        borderWidth: 2,
        borderColor: colors.error,
    },
    statusCardOnline: {
        backgroundColor: '#E3F2FD',
        borderWidth: 2,
        borderColor: colors.info || '#2196F3',
    },
    statusCardOffline: {
        backgroundColor: '#FFF3E0',
        borderWidth: 2,
        borderColor: '#FF9800',
    },
    statusCardDisabled: {
        backgroundColor: '#F5F5F5',
        borderColor: colors.border,
        opacity: 0.7,
    },
    statusIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainerOpen: {
        backgroundColor: colors.success,
    },
    iconContainerClosed: {
        backgroundColor: colors.error,
    },
    iconContainerOnline: {
        backgroundColor: colors.info || '#2196F3',
    },
    iconContainerOffline: {
        backgroundColor: '#FF9800',
    },
    iconContainerDisabled: {
        backgroundColor: colors.textSecondary,
    },
    statusCardTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    statusCardValue: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    statusValueOpen: {
        color: colors.success,
    },
    statusValueClosed: {
        color: colors.error,
    },
    statusValueOnline: {
        color: colors.info || '#2196F3',
    },
    statusValueOffline: {
        color: '#FF9800',
    },
    statusCardHint: {
        fontSize: 11,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    textDisabled: {
        color: colors.textSecondary,
    },
    // Menu Button
    menuButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14,
        borderRadius: 12,
        gap: 8,
        elevation: 3,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    menuButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    activeTabText: {
        color: colors.primary,
    },
    earningsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
        backgroundColor: colors.background,
    },
    earningsCard: {
        flex: 1,
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    earningsLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 8,
        fontWeight: '600',
    },
    earningsAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.success,
    },
    ordersSection: {
        flex: 1,
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    orderCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    completedBadge: {
        backgroundColor: '#4CAF50',
    },
    statusText: {
        color: colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    customerName: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    orderAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 12,
    },
    orderDate: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
    },
    orderActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
    },
    scanButton: {
        backgroundColor: colors.success,
    },
    actionButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 40,
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 8,
    },
    itemsContainer: {
        marginVertical: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    itemsLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 4,
    },
    itemTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        marginTop: 2,
    },
    vegIndicator: {
        width: 14,
        height: 14,
        borderWidth: 1.5,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    vegDot: {
        width: 7,
        height: 7,
        borderRadius: 3.5,
    },
    itemText: {
        fontSize: 13,
        color: colors.text,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalSection: {
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    modalValue: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    modalSubValue: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    modalItemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    modalItemNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    vegIndicatorModal: {
        width: 16,
        height: 16,
        borderWidth: 2,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    vegDotModal: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    modalItemName: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
    },
    modalItemPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },
    modalTotalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: colors.border,
    },
    modalTotalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    modalTotalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
});

export default DashboardScreen;
