import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { canteenAPI, orderAPI } from '../services/api';
import colors from '../constants/colors';

const DashboardScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const [canteens, setCanteens] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalCanteens: 0,
        openCanteens: 0,
        onlineEnabled: 0,
    });
    const [ordersModalVisible, setOrdersModalVisible] = useState(false);
    const [onlineOrders, setOnlineOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loadingOrders, setLoadingOrders] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await canteenAPI.getAll();
            const canteenData = response.data.data;
            setCanteens(canteenData);

            setStats({
                totalCanteens: canteenData.length,
                openCanteens: canteenData.filter(c => c.isOpen).length,
                onlineEnabled: canteenData.filter(c => c.isOnlineOrdersEnabled).length,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const fetchOnlineOrders = async () => {
        try {
            setLoadingOrders(true);
            const response = await orderAPI.getAll();
            // Filter for active orders (not completed or cancelled)
            const activeOrders = response.data.data.filter(
                order => !['COMPLETED', 'CANCELLED'].includes(order.status)
            );
            setOnlineOrders(activeOrders);
            setOrdersModalVisible(true);
        } catch (error) {
            console.error('Error fetching orders:', error);
            Alert.alert('Error', 'Failed to fetch online orders');
        } finally {
            setLoadingOrders(false);
        }
    };

    const handleStatCardPress = (type) => {
        if (type === 'total') {
            navigation.navigate('CanteenManagement', { filter: 'all' });
        } else if (type === 'open') {
            navigation.navigate('CanteenManagement', { filter: 'open' });
        } else if (type === 'online') {
            fetchOnlineOrders();
        }
    };

    const getStatusStyle = (status) => {
        const statusColors = {
            CREATED: { backgroundColor: '#9E9E9E' },
            PAID: { backgroundColor: '#2196F3' },
            ACCEPTED: { backgroundColor: '#4CAF50' },
            PREPARING: { backgroundColor: '#FF9800' },
            READY: { backgroundColor: '#9C27B0' },
            COMPLETED: { backgroundColor: '#4CAF50' },
            CANCELLED: { backgroundColor: '#F44336' },
        };
        return statusColors[status] || { backgroundColor: '#757575' };
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

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>Admin Dashboard</Text>
                        <Text style={styles.subtitle}>System Overview</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutHeaderButton}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handleStatCardPress('total')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="restaurant" size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.totalCanteens}</Text>
                    <Text style={styles.statLabel}>Total Canteens</Text>
                    <Text style={styles.tapHint}>Tap to view</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handleStatCardPress('open')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                    <Text style={styles.statNumber}>{stats.openCanteens}</Text>
                    <Text style={styles.statLabel}>Currently Open</Text>
                    <Text style={styles.tapHint}>Tap to view</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.statCard}
                    onPress={() => handleStatCardPress('online')}
                    activeOpacity={0.7}
                >
                    <Ionicons name="globe" size={32} color={colors.info} />
                    <Text style={styles.statNumber}>{stats.onlineEnabled}</Text>
                    <Text style={styles.statLabel}>Online Orders</Text>
                    <Text style={styles.tapHint}>Tap to view</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('CanteenManagement')}
                >
                    <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                    <Text style={styles.actionText}>Manage Canteens</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('UserManagement')}
                >
                    <Ionicons name="people-outline" size={24} color={colors.primary} />
                    <Text style={styles.actionText}>Manage Users</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Canteens</Text>
                {canteens.slice(0, 5).map((canteen) => (
                    <View key={canteen._id} style={styles.canteenCard}>
                        <View style={styles.canteenInfo}>
                            <Text style={styles.canteenName}>{canteen.name}</Text>
                            <Text style={styles.canteenLocation}>{canteen.location}</Text>
                        </View>
                        <View style={styles.canteenStatus}>
                            <View style={[styles.statusDot, { backgroundColor: canteen.isOpen ? colors.success : colors.error }]} />
                            <Text style={styles.statusText}>{canteen.isOpen ? 'Open' : 'Closed'}</Text>
                        </View>
                    </View>
                ))}
            </View>

            {/* Online Orders Modal */}
            <Modal
                visible={ordersModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setOrdersModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.ordersModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Online Orders</Text>
                            <TouchableOpacity onPress={() => setOrdersModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {loadingOrders ? (
                            <View style={styles.loadingContainer}>
                                <Text style={styles.loadingText}>Loading orders...</Text>
                            </View>
                        ) : onlineOrders.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="receipt-outline" size={48} color={colors.textSecondary} />
                                <Text style={styles.emptyText}>No active online orders</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={onlineOrders}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={styles.orderCard}
                                        onPress={() => setSelectedOrder(item)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.orderHeader}>
                                            <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
                                            <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                                                <Text style={styles.statusBadgeText}>{item.status}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.orderCustomer}>
                                            {item.userId?.name || 'Unknown Customer'}
                                        </Text>
                                        <Text style={styles.orderCanteen}>
                                            📍 {item.canteenId?.name || 'Unknown Canteen'}
                                        </Text>
                                        <View style={styles.orderFooter}>
                                            <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>
                                            <Text style={styles.orderTime}>
                                                {new Date(item.createdAt).toLocaleTimeString()}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        )}
                    </View>
                </View>
            </Modal>

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
                        style={styles.orderDetailsModal}
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

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Order ID</Text>
                                        <Text style={styles.detailValue}>#{selectedOrder._id.slice(-6)}</Text>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Status</Text>
                                        <View style={[styles.statusBadge, getStatusStyle(selectedOrder.status)]}>
                                            <Text style={styles.statusBadgeText}>{selectedOrder.status}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Customer</Text>
                                        <Text style={styles.detailValue}>{selectedOrder.userId?.name || 'Unknown'}</Text>
                                        <Text style={styles.detailSubValue}>{selectedOrder.userId?.email || ''}</Text>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Canteen</Text>
                                        <Text style={styles.detailValue}>{selectedOrder.canteenId?.name || 'Unknown'}</Text>
                                        <Text style={styles.detailSubValue}>{selectedOrder.canteenId?.location || ''}</Text>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Order Time</Text>
                                        <Text style={styles.detailValue}>
                                            {new Date(selectedOrder.createdAt).toLocaleDateString()} at{' '}
                                            {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                                        </Text>
                                    </View>

                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>Items</Text>
                                        {selectedOrder.items.map((item, index) => (
                                            <View key={index} style={styles.itemRow}>
                                                <View style={styles.itemNameContainer}>
                                                    <View style={[styles.vegIndicator, { borderColor: item.isVeg ? '#22c55e' : '#ef4444' }]}>
                                                        <View style={[styles.vegDot, { backgroundColor: item.isVeg ? '#22c55e' : '#ef4444' }]} />
                                                    </View>
                                                    <Text style={styles.itemName}>
                                                        {item.name} x{item.quantity}
                                                    </Text>
                                                </View>
                                                <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                                            </View>
                                        ))}
                                    </View>

                                    {selectedOrder.specialInstructions && (
                                        <View style={styles.detailSection}>
                                            <Text style={styles.detailLabel}>Special Instructions</Text>
                                            <Text style={styles.detailValue}>{selectedOrder.specialInstructions}</Text>
                                        </View>
                                    )}

                                    <View style={styles.totalSection}>
                                        <Text style={styles.totalLabel}>Total Amount</Text>
                                        <Text style={styles.totalValue}>₹{selectedOrder.totalAmount}</Text>
                                    </View>
                                </>
                            )}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        padding: 16,
        paddingTop: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
    },
    logoutHeaderButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    tapHint: {
        fontSize: 10,
        color: colors.primary,
        marginTop: 6,
        fontWeight: '600',
    },
    section: {
        backgroundColor: colors.white,
        marginTop: 16,
        padding: 16,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: 8,
        marginBottom: 12,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        marginLeft: 12,
    },
    canteenCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    canteenInfo: {
        flex: 1,
    },
    canteenName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    canteenLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    canteenStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    ordersModalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '80%',
        elevation: 5,
    },
    orderDetailsModal: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 20,
        width: '100%',
        maxHeight: '85%',
        elevation: 5,
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
    loadingContainer: {
        padding: 40,
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 12,
    },
    orderCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
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
    statusBadgeText: {
        color: colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    orderCustomer: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    orderCanteen: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 4,
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    orderAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    orderTime: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    // Order Details Modal Styles
    detailSection: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    detailSubValue: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    itemNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    vegIndicator: {
        width: 16,
        height: 16,
        borderWidth: 2,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    itemName: {
        fontSize: 15,
        color: colors.text,
        flex: 1,
    },
    itemPrice: {
        fontSize: 15,
        fontWeight: '600',
        color: colors.primary,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: colors.border,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    totalValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
});

export default DashboardScreen;
