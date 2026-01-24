import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { menuAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import colors from '../constants/colors';

const MenuScreen = ({ route, navigation }) => {
    const { canteen } = route.params;
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, getTotalItems } = useCart();

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
        if (result.success) {
            Alert.alert('Success', `${item.name} added to cart`);
        } else {
            Alert.alert('Error', result.message);
        }
    };

    const renderMenuItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                    <View style={styles.nameRow}>
                        <Text style={styles.itemName}>{item.name}</Text>
                        {item.isVeg !== undefined && (
                            <View style={[styles.vegBadge, { borderColor: item.isVeg ? colors.success : colors.error }]}>
                                <View style={[styles.vegDot, { backgroundColor: item.isVeg ? colors.success : colors.error }]} />
                            </View>
                        )}
                    </View>
                    {item.description ? (
                        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
                    ) : null}
                    <Text style={styles.category}>{item.category}</Text>
                </View>
            </View>

            <View style={styles.itemFooter}>
                <Text style={styles.price}>₹{item.price}</Text>
                {item.isAvailable ? (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => handleAddToCart(item)}
                    >
                        <Text style={styles.addButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.unavailableButton}>
                        <Text style={styles.unavailableText}>Unavailable</Text>
                    </View>
                )}
            </View>
        </View>
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
            <View style={styles.canteenHeader}>
                <Text style={styles.canteenName}>{canteen.name}</Text>
                <Text style={styles.canteenLocation}>{canteen.location}</Text>
            </View>

            <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="fast-food-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No menu items available</Text>
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    itemHeader: {
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
    },
    vegBadge: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    category: {
        fontSize: 12,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    addButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    unavailableButton: {
        backgroundColor: colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    unavailableText: {
        color: colors.textSecondary,
        fontWeight: 'bold',
        fontSize: 14,
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
});

export default MenuScreen;
