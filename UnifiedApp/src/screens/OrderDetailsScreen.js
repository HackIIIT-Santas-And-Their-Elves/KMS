import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { orderAPI } from '../services/api';
import colors from '../constants/colors';

const OrderDetailsScreen = ({ route }) => {
    const { orderId } = route.params;
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, []);

    const fetchOrder = async () => {
        try {
            const response = await orderAPI.getById(orderId);
            setOrder(response.data.data);
        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

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

    return (
        <ScrollView style={styles.container}>
            {order.pickupCode && order.status !== 'COMPLETED' && (
                <View style={styles.qrSection}>
                    <Text style={styles.qrTitle}>Pickup Code</Text>
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={order.pickupCode}
                            size={200}
                            backgroundColor={colors.white}
                        />
                    </View>
                    <Text style={styles.pickupCode}>{order.pickupCode}</Text>
                    <Text style={styles.qrInstructions}>
                        Show this code to the canteen staff for pickup
                    </Text>
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Order ID</Text>
                    <Text style={styles.infoValue}>#{order._id.slice(-8)}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <Text style={[styles.infoValue, styles.statusValue]}>{order.status}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Canteen</Text>
                    <Text style={styles.infoValue}>{order.canteenId.name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Location</Text>
                    <Text style={styles.infoValue}>{order.canteenId.location}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Amount</Text>
                    <Text style={styles.infoValue}>₹{order.totalAmount}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Order Date</Text>
                    <Text style={styles.infoValue}>
                        {new Date(order.createdAt).toLocaleString()}
                    </Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items Ordered</Text>
                {order.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemName}>{item.name}</Text>
                            <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                        </View>
                        <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                    </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalAmount}>₹{order.totalAmount}</Text>
                </View>
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
    qrSection: {
        backgroundColor: colors.white,
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    qrTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    qrContainer: {
        padding: 16,
        backgroundColor: colors.white,
        borderRadius: 12,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pickupCode: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.primary,
        marginTop: 16,
        letterSpacing: 4,
    },
    qrInstructions: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 8,
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
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    infoLabel: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    infoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        textAlign: 'right',
        flex: 1,
        marginLeft: 16,
    },
    statusValue: {
        color: colors.primary,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 4,
    },
    itemQuantity: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    divider: {
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 12,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
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

export default OrderDetailsScreen;
