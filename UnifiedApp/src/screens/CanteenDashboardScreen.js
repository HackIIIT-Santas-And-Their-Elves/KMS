import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    FlatList,
    RefreshControl,
    Alert,
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
            await canteenAPI.toggleOpen(user.canteenId);
            fetchData();
        } catch (error) {
            console.error('❌ Error toggling canteen status:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to toggle canteen status';
            Alert.alert('Error', errorMsg);
        }
    };

    const handleToggleOnlineOrders = async () => {
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
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <Text style={styles.orderId}>#{item._id.slice(-6)}</Text>
                <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
                    <Text style={styles.statusText}>{item.status}</Text>
                </View>
            </View>

            <Text style={styles.customerName}>{item.userId.name}</Text>
            <Text style={styles.orderAmount}>₹{item.totalAmount}</Text>

            <View style={styles.orderActions}>
                {item.status === 'PAID' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOrderAction(item._id, 'accept')}
                    >
                        <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'ACCEPTED' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOrderAction(item._id, 'prepare')}
                    >
                        <Text style={styles.actionButtonText}>Start Preparing</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'PREPARING' && (
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleOrderAction(item._id, 'ready')}
                    >
                        <Text style={styles.actionButtonText}>Mark Ready</Text>
                    </TouchableOpacity>
                )}
                {item.status === 'READY' && (
                    <TouchableOpacity
                        style={[styles.actionButton, styles.scanButton]}
                        onPress={() => navigation.navigate('QRScanner', { orderId: item._id })}
                    >
                        <Ionicons name="qr-code-outline" size={16} color={colors.white} />
                        <Text style={styles.actionButtonText}> Scan Pickup</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const renderCompletedOrder = ({ item }) => (
        <View style={styles.orderCard}>
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
        </View>
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

                <View style={styles.toggleContainer}>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Canteen Open</Text>
                        <Switch
                            value={canteen.isOpen}
                            onValueChange={handleToggleOpen}
                            trackColor={{ false: colors.border, true: colors.success }}
                            thumbColor={colors.white}
                        />
                    </View>

                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Online Orders</Text>
                        <Switch
                            value={canteen.isOnlineOrdersEnabled}
                            onValueChange={handleToggleOnlineOrders}
                            trackColor={{ false: colors.border, true: colors.success }}
                            thumbColor={colors.white}
                        />
                    </View>
                </View>

                <View style={styles.menuButton}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => navigation.navigate('MenuManagement')}
                    >
                        <Ionicons name="restaurant" size={20} color={colors.white} />
                        <Text style={styles.buttonText}> Manage Menu</Text>
                    </TouchableOpacity>
                </View>
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
        marginBottom: 16,
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
    toggleContainer: {
        marginBottom: 16,
    },
    toggleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    toggleLabel: {
        fontSize: 16,
        color: colors.text,
    },
    menuButton: {
        marginTop: 8,
    },
    button: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
    },
    buttonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
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
});

export default DashboardScreen;
