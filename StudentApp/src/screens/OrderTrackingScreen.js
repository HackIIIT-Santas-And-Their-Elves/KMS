import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { orderAPI } from '../services/api';
import colors from '../constants/colors';

const OrderTrackingScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchOrder();
        // Poll for updates every 10 seconds
        const interval = setInterval(fetchOrder, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrder = async () => {
        try {
            const response = await orderAPI.getById(orderId);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrder();
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
            default:
                return colors.textSecondary;
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'PAID':
                return 'checkmark-circle';
            case 'ACCEPTED':
                return 'checkmark-done-circle';
            case 'PREPARING':
                return 'restaurant';
            case 'READY':
                return 'alarm';
            case 'COMPLETED':
                return 'checkmark-circle';
            default:
                return 'time';
        }
    };

    const statusSteps = ['PAID', 'ACCEPTED', 'PREPARING', 'READY'];

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!order) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Order not found</Text>
            </View>
        );
    }

    const currentStepIndex = statusSteps.indexOf(order.status);

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <Ionicons
                    name={getStatusIcon(order.status)}
                    size={64}
                    color={getStatusColor(order.status)}
                />
                <Text style={styles.statusText}>{order.status}</Text>
                <Text style={styles.orderIdText}>Order #{order._id.slice(-6)}</Text>
            </View>

            {order.status === 'READY' && (
                <TouchableOpacity
                    style={styles.qrButton}
                    onPress={() => navigation.navigate('OrderDetails', { orderId: order._id })}
                >
                    <Ionicons name="qr-code" size={24} color={colors.white} />
                    <Text style={styles.qrButtonText}>Show Pickup Code</Text>
                </TouchableOpacity>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Progress</Text>
                <View style={styles.timeline}>
                    {statusSteps.map((step, index) => (
                        <View key={step} style={styles.timelineItem}>
                            <View style={styles.timelineIconContainer}>
                                <View
                                    style={[
                                        styles.timelineIcon,
                                        {
                                            backgroundColor:
                                                index <= currentStepIndex
                                                    ? getStatusColor(step)
                                                    : colors.border,
                                        },
                                    ]}
                                >
                                    {index <= currentStepIndex && (
                                        <Ionicons name="checkmark" size={16} color={colors.white} />
                                    )}
                                </View>
                                {index < statusSteps.length - 1 && (
                                    <View
                                        style={[
                                            styles.timelineLine,
                                            {
                                                backgroundColor:
                                                    index < currentStepIndex ? getStatusColor(step) : colors.border,
                                            },
                                        ]}
                                    />
                                )}
                            </View>
                            <Text
                                style={[
                                    styles.timelineText,
                                    {
                                        color: index <= currentStepIndex ? colors.text : colors.textSecondary,
                                        fontWeight: index <= currentStepIndex ? 'bold' : 'normal',
                                    },
                                ]}
                            >
                                {step}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Details</Text>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Canteen</Text>
                    <Text style={styles.detailValue}>{order.canteenId.name}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>{order.canteenId.location}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Amount</Text>
                    <Text style={styles.detailValue}>₹{order.totalAmount}</Text>
                </View>
                {order.isBulkOrder && (
                    <View style={styles.bulkBadge}>
                        <Text style={styles.bulkText}>Bulk Order</Text>
                    </View>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items</Text>
                {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>
                            {item.name} x {item.quantity}
                        </Text>
                        <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                    </View>
                ))}
            </View>

            {order.specialInstructions && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Special Instructions</Text>
                    <Text style={styles.instructions}>{order.specialInstructions}</Text>
                </View>
            )}
        </ScrollView>
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
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    statusText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 12,
    },
    orderIdText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    qrButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        margin: 16,
        borderRadius: 8,
    },
    qrButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    section: {
        backgroundColor: colors.white,
        padding: 16,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    timeline: {
        paddingLeft: 8,
    },
    timelineItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    timelineIconContainer: {
        alignItems: 'center',
        marginRight: 16,
    },
    timelineIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    timelineLine: {
        width: 2,
        height: 24,
        marginTop: 4,
    },
    timelineText: {
        fontSize: 16,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    detailLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    bulkBadge: {
        backgroundColor: colors.warning,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    bulkText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    itemName: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    instructions: {
        fontSize: 14,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
    },
});

export default OrderTrackingScreen;
