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
import { canteenAPI } from '../services/api';
import colors from '../constants/colors';

const CanteenListScreen = ({ navigation }) => {
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCanteens();
    }, []);

    const fetchCanteens = async () => {
        try {
            const response = await canteenAPI.getAll();
            setCanteens(response.data.data);
        } catch (error) {
            console.error('Error fetching canteens:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchCanteens();
    };

    const renderCanteen = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('Menu', { canteen: item })}
            disabled={!item.isOpen || !item.isOnlineOrdersEnabled}
        >
            <View style={styles.cardHeader}>
                <View style={styles.canteenInfo}>
                    <Text style={styles.canteenName}>{item.name}</Text>
                    <View style={styles.locationContainer}>
                        <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                        <Text style={styles.location}>{item.location}</Text>
                    </View>
                </View>
                <View style={[
                    styles.statusBadge,
                    { backgroundColor: item.isOpen ? colors.statusOpen : colors.statusClosed }
                ]}>
                    <Text style={styles.statusText}>
                        {item.isOpen ? 'OPEN' : 'CLOSED'}
                    </Text>
                </View>
            </View>

            {item.description ? (
                <Text style={styles.description}>{item.description}</Text>
            ) : null}

            {!item.isOnlineOrdersEnabled && item.isOpen && (
                <View style={styles.warningContainer}>
                    <Ionicons name="warning-outline" size={16} color={colors.warning} />
                    <Text style={styles.warningText}>Online orders disabled</Text>
                </View>
            )}

            <View style={styles.cardFooter}>
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
                data={canteens}
                renderItem={renderCanteen}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>No canteens available</Text>
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
        marginBottom: 16,
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
        marginBottom: 8,
    },
    canteenInfo: {
        flex: 1,
    },
    canteenName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    location: {
        fontSize: 14,
        color: colors.textSecondary,
        marginLeft: 4,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    description: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF3E0',
        padding: 8,
        borderRadius: 6,
        marginTop: 8,
    },
    warningText: {
        fontSize: 12,
        color: colors.warning,
        marginLeft: 6,
        fontWeight: '600',
    },
    cardFooter: {
        alignItems: 'flex-end',
        marginTop: 8,
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

export default CanteenListScreen;
