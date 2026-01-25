import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderAPI } from '../services/api';
import colors from '../constants/colors';

const OrderHistoryScreen = ({ navigation }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await orderAPI.getMy();
            setOrders(response.data.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PAID':
            case 'ACCEPTED':
                return colors.info;
            case 'PREPARING':
                return colors.warning;
            case 'READY':
                return colors.success;
            case 'COMPLETED':
                return colors.success;
            case 'CANCELLED':
            case 'FAILED':
                return colors.error;
            default:
                return colors.textSecondary;
        }
    };

    const renderOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetails', { orderId: item._id })}
        >
            <View style={styles.cardHeader}>
                <View style={styles.orderInfo}>
                    <Text style={styles.canteenName}>{item.canteenId.name}</Text>
                    <Text style={styles.orderDate}>
                        {new Date(item.createdAt).toLocaleDateString()} at{' '}
                        {new Date(item.createdAt).toLocaleTimeString()}
                    </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                    <Text style={styles.statusText}>
                        {item.status === 'CANCELLED' && item.cancelledBy === 'CANTEEN'
                            ? 'CANCELLED (CANTEEN)'
                            : item.status}
                    </Text>
                </View>
            </View>

            <View style={styles.itemsContainer}>
                <Text style={styles.itemsLabel}>Items:</Text>
                {item.items.slice(0, 2).map((orderItem, index) => (
                    <View key={index} style={styles.itemTextRow}>
                        <View style={[styles.vegIndicator, { borderColor: orderItem.isVeg ? '#22c55e' : '#ef4444' }]}>
                            <View style={[styles.vegDot, { backgroundColor: orderItem.isVeg ? '#22c55e' : '#ef4444' }]} />
                        </View>
                        <Text style={styles.itemText}>
                            {orderItem.name} x {orderItem.quantity}
                        </Text>
                    </View>
                ))}
                {item.items.length > 2 && (
                    <Text style={styles.moreItems}>+{item.items.length - 2} more items</Text>
                )}
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.totalAmount}>₹{item.totalAmount}</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.primary} />
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={orders}
                renderItem={renderOrder}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="receipt-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No orders yet</Text>
                        <TouchableOpacity
                            style={styles.browseButton}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.browseButtonText}>Browse Canteens</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
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
    listContainer: {
        padding: 16,
    },
    card: {
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
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    orderInfo: {
        flex: 1,
    },
    canteenName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    orderDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    itemsContainer: {
        marginBottom: 12,
    },
    itemsLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    itemTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
        marginVertical: 2,
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
        color: colors.textSecondary,
    },
    moreItems: {
        fontSize: 13,
        color: colors.primary,
        marginLeft: 8,
        fontStyle: 'italic',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 16,
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    browseButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrderHistoryScreen;
