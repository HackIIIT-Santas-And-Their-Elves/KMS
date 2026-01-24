import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import colors from '../constants/colors';

const CartScreen = ({ navigation }) => {
    const { cart, removeFromCart, updateQuantity, getTotal, getTotalItems, clearCart } = useCart();

    const handleCheckout = () => {
        if (cart.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to cart');
            return;
        }
        navigation.navigate('Payment');
    };

    const handleQuantityChange = (itemId, currentQuantity, change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity > 0) {
            updateQuantity(itemId, newQuantity);
        } else {
            Alert.alert(
                'Remove Item',
                'Do you want to remove this item from cart?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', onPress: () => removeFromCart(itemId), style: 'destructive' },
                ]
            );
        }
    };

    const renderCartItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemPrice}>₹{item.price} each</Text>
            </View>

            <View style={styles.quantityContainer}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item._id, item.quantity, -1)}
                >
                    <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>

                <Text style={styles.quantity}>{item.quantity}</Text>

                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleQuantityChange(item._id, item.quantity, 1)}
                >
                    <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <View style={styles.itemFooter}>
                <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item._id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    if (cart.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color={colors.textSecondary} />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity
                    style={styles.browseButton}
                    onPress={() => navigation.navigate('CanteenList')}
                >
                    <Text style={styles.browseButtonText}>Browse Canteens</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cart}
                renderItem={renderCartItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerText}>
                            {getTotalItems()} {getTotalItems() === 1 ? 'item' : 'items'} in cart
                        </Text>
                        <TouchableOpacity onPress={clearCart}>
                            <Text style={styles.clearText}>Clear All</Text>
                        </TouchableOpacity>
                    </View>
                }
            />

            <View style={styles.footer}>
                <View style={styles.totalContainer}>
                    <Text style={styles.totalLabel}>Total Amount</Text>
                    <Text style={styles.totalAmount}>₹{getTotal()}</Text>
                </View>

                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>Proceed to Payment</Text>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    emptyText: {
        fontSize: 18,
        color: colors.textSecondary,
        marginTop: 18,
        marginBottom: 12,
    },
    browseButton: {
        backgroundColor: colors.primary,
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 28,
        marginTop: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 2,
    },
    browseButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    listContainer: {
        paddingBottom: 120,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 8,
        paddingHorizontal: 8,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    clearText: {
        color: colors.error,
        fontWeight: '600',
        fontSize: 14,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 18,
        marginVertical: 8,
        marginHorizontal: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.10,
        shadowRadius: 10,
        elevation: 3,
    },
    itemInfo: {
        marginBottom: 8,
    },
    itemName: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
    },
    itemPrice: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
    },
    quantityButton: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 6,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: colors.border,
    },
    quantity: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginHorizontal: 8,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    itemTotal: {
        fontSize: 15,
        fontWeight: 'bold',
        color: colors.primary,
    },
    footer: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        padding: 18,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    totalLabel: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    totalAmount: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 18,
    },
    checkoutButton: {
        backgroundColor: colors.action,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        marginTop: 8,
        shadowColor: colors.action,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.13,
        shadowRadius: 7,
        elevation: 2,
    },
    checkoutButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
        marginRight: 8,
    },
});

export default CartScreen;
