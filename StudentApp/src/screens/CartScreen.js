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
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
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
    listContainer: {
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    clearText: {
        fontSize: 14,
        color: colors.error,
        fontWeight: '600',
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
    itemInfo: {
        marginBottom: 12,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantity: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginHorizontal: 16,
        minWidth: 30,
        textAlign: 'center',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    itemTotal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    footer: {
        backgroundColor: colors.white,
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    totalLabel: {
        fontSize: 16,
        color: colors.text,
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.primary,
    },
    checkoutButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        borderRadius: 8,
    },
    checkoutButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: 8,
    },
});

export default CartScreen;
