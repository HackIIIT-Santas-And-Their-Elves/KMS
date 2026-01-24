import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { orderAPI, paymentAPI } from '../services/api';
import colors from '../constants/colors';

const PaymentScreen = ({ navigation }) => {
    const { cart, canteenId, getTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [specialInstructions, setSpecialInstructions] = useState('');

    const handlePayment = async () => {
        try {
            setLoading(true);

            // Create order
            const orderData = {
                canteenId,
                items: cart.map(item => ({
                    menuItem: item._id,
                    quantity: item.quantity,
                })),
                specialInstructions,
            };

            const orderResponse = await orderAPI.create(orderData);
            const order = orderResponse.data.data;

            // Initiate payment
            const paymentResponse = await paymentAPI.initiate(order._id);
            const payment = paymentResponse.data.data;

            // Mock payment confirmation (in production, this would redirect to Paytm)
            Alert.alert(
                'Payment',
                'This is a mock payment. Confirm to proceed?',
                [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                        onPress: () => setLoading(false),
                    },
                    {
                        text: 'Confirm Payment',
                        onPress: async () => {
                            try {
                                // Confirm payment
                                await paymentAPI.confirm(payment.payment._id);

                                // Clear cart
                                clearCart();

                                // Navigate to order tracking
                                navigation.navigate('OrderTracking', { orderId: order._id });
                            } catch (error) {
                                Alert.alert('Error', 'Payment failed. Please try again.');
                                console.error('Payment error:', error);
                            } finally {
                                setLoading(false);
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.response?.data?.message || 'Failed to create order');
            console.error('Order creation error:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    {cart.map((item) => (
                        <View key={item._id} style={styles.orderItem}>
                            <Text style={styles.itemName}>
                                {item.name} x {item.quantity}
                            </Text>
                            <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Total Amount</Text>
                        <Text style={styles.totalAmount}>₹{getTotal()}</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Special Instructions (Optional)</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Any special requests?"
                        value={specialInstructions}
                        onChangeText={setSpecialInstructions}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                    />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    <View style={styles.paymentMethod}>
                        <Ionicons name="card-outline" size={24} color={colors.primary} />
                        <Text style={styles.paymentMethodText}>Paytm UPI (Mock)</Text>
                    </View>
                </View>
            </View>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.payButton, loading && styles.payButtonDisabled]}
                    onPress={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <>
                            <Text style={styles.payButtonText}>Pay ₹{getTotal()}</Text>
                            <Ionicons name="arrow-forward" size={20} color={colors.white} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    orderItem: {
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
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    textArea: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        minHeight: 100,
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: colors.surface,
        borderRadius: 8,
    },
    paymentMethodText: {
        fontSize: 16,
        color: colors.text,
        marginLeft: 12,
        fontWeight: '600',
    },
    footer: {
        backgroundColor: colors.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    payButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
    },
    payButtonDisabled: {
        opacity: 0.6,
    },
    payButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
});

export default PaymentScreen;
