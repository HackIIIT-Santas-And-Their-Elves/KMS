import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import colors from '../constants/colors';

const MenuScreen = ({ route, navigation }) => {
    const { canteen } = route.params;
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, getTotalItems, getItemQuantity, updateQuantity, removeFromCart, getTotal } = useCart();

    useEffect(() => {
        fetchMenu();
    }, []);

    useEffect(() => {
        // Update header with cart count
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity
                    style={styles.cartButton}
                    onPress={() => navigation.navigate('Cart')}
                >
                    <Ionicons name="cart" size={24} color={colors.white} />
                    {getTotalItems() > 0 && (
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{getTotalItems()}</Text>
                        </View>
                    )}
                </TouchableOpacity>
            ),
        });
    }, [getTotalItems()]);

    const fetchMenu = async () => {
        try {
            const response = await menuAPI.getByCanteen(canteen._id);
            setMenuItems(response.data.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
            Alert.alert('Error', 'Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (item) => {
        const result = addToCart({ ...item, canteenId: canteen._id });
        if (!result.success) {
            Alert.alert('Error', result.message);
        }
    };

    const handleIncrement = (item) => {
        const currentQty = getItemQuantity(item._id);
        if (currentQty === 0) {
            handleAddToCart(item);
        } else {
            updateQuantity(item._id, currentQty + 1);
        }
    };

    const handleDecrement = (item) => {
        const currentQty = getItemQuantity(item._id);
        if (currentQty <= 1) {
            removeFromCart(item._id);
        } else {
            updateQuantity(item._id, currentQty - 1);
        }
    };

    const renderQuantitySelector = (item) => {
        const quantity = getItemQuantity(item._id);

        if (quantity === 0) {
            return (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => handleIncrement(item)}
                >
                    <Text style={styles.addButtonText}>ADD</Text>
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.quantityContainer}>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleDecrement(item)}
                >
                    <Ionicons name="remove" size={18} color={colors.white} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => handleIncrement(item)}
                >
                    <Ionicons name="add" size={18} color={colors.white} />
                </TouchableOpacity>
            </View>
        );
    };

    const renderMenuItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {/* Left side - Item details */}
                <View style={styles.itemDetails}>
                    <View style={styles.nameRow}>
                        {item.isVeg !== undefined && (
                            <View style={[styles.vegBadge, { borderColor: item.isVeg ? colors.success : colors.error }]}>
                                <View style={[styles.vegDot, { backgroundColor: item.isVeg ? colors.success : colors.error }]} />
                            </View>
                        )}
                        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    </View>

                    <Text style={styles.price}>₹{item.price}</Text>

                    {item.description ? (
                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    ) : null}

                    <Text style={styles.category}>{item.category}</Text>
                </View>

                {/* Right side - Image with overlapping button */}
                <View style={styles.imageContainer}>
                    {item.imageUrl ? (
                        <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                    ) : (
                        <View style={styles.noImagePlaceholder}>
                            <Ionicons name="fast-food-outline" size={32} color={colors.textSecondary} />
                        </View>
                    )}

                    {/* Overlapping Add Button */}
                    <View style={styles.addButtonWrapper}>
                        {item.isAvailable ? (
                            renderQuantitySelector(item)
                        ) : (
                            <View style={styles.unavailableButton}>
                                <Text style={styles.unavailableText}>Unavailable</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </View>
    );

    const renderBottomCartBar = () => {
        const totalItems = getTotalItems();
        if (totalItems === 0) return null;

        return (
            <View style={styles.bottomCartContainer}>
                <View style={styles.bottomCartContent}>
                    <View>
                        <Text style={styles.cartItemCount}>{totalItems} {totalItems === 1 ? 'Item' : 'Items'} | ₹{getTotal()}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.viewCartButton}
                        onPress={() => navigation.navigate('Cart')}
                    >
                        <Text style={styles.viewCartText}>View Cart</Text>
                        <Ionicons name="cart-outline" size={20} color={colors.white} style={{ marginLeft: 8 }} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.canteenHeader}>
                <Text style={styles.canteenName}>{canteen.name}</Text>
                <Text style={styles.canteenLocation}>{canteen.location}</Text>
            </View>

            <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={[styles.listContainer, getTotalItems() > 0 && { paddingBottom: 100 }]}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="fast-food-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No menu items available</Text>
                    </View>
                }
            />
            {renderBottomCartBar()}
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
    canteenHeader: {
        backgroundColor: colors.white,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    canteenName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    canteenLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        padding: 16,
        paddingBottom: 20
    },
    cardContent: {
        flexDirection: 'row',
    },
    itemDetails: {
        flex: 1,
        paddingRight: 12,
        justifyContent: 'flex-start',
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    vegBadge: {
        width: 18,
        height: 18,
        borderWidth: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginTop: 2,
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        lineHeight: 22,
    },
    price: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 6,
    },
    description: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 6,
        lineHeight: 18,
    },
    category: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    // Image container with overlapping button
    imageContainer: {
        width: 120,
        alignItems: 'center',
    },
    itemImage: {
        width: 120,
        height: 100,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    noImagePlaceholder: {
        width: 120,
        height: 100,
        borderRadius: 12,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Overlapping button wrapper
    addButtonWrapper: {
        position: 'absolute',
        bottom: -10,
        alignSelf: 'center',
    },
    addButton: {
        backgroundColor: colors.white,
        paddingHorizontal: 24,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.primary,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    addButtonText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 14,
    },
    unavailableButton: {
        backgroundColor: colors.surface,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    unavailableText: {
        color: colors.textSecondary,
        fontWeight: 'bold',
        fontSize: 12,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    quantityButton: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
        minWidth: 24,
        textAlign: 'center',
    },
    cartButton: {
        marginRight: 16,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        right: -8,
        top: -8,
        backgroundColor: colors.error,
        borderRadius: 10,
        width: 20,
        height: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
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
    },
    bottomCartContainer: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: colors.primary,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    bottomCartContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    cartItemCount: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    cartExtraInfo: {
        color: colors.white,
        fontSize: 12,
        opacity: 0.9,
    },
    viewCartButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    viewCartText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MenuScreen;
