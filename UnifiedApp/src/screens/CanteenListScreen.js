import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    ActivityIndicator,
    Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { canteenAPI } from '../services/api';
import colors from '../constants/colors';

const CanteenListScreen = ({ navigation }) => {
    const [canteens, setCanteens] = useState([]);
    const [queueStats, setQueueStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showOpenOnly, setShowOpenOnly] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    const fetchData = async () => {
        try {
            const [canteensRes, queueRes] = await Promise.all([
                canteenAPI.getAll(),
                canteenAPI.getAllQueueStatus()
            ]);
            
            setCanteens(canteensRes.data.data);
            
            if (queueRes.data.success) {
                // Convert array to map for easier lookup
                const statsMap = {};
                queueRes.data.data.forEach(stat => {
                    statsMap[stat.canteenId] = stat;
                });
                setQueueStats(statsMap);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Get status priority: 1 = Open & accepting, 2 = Open & not accepting, 3 = Closed
    const getStatusPriority = (canteen) => {
        if (!canteen.isOpen) return 3;
        if (canteen.isOnlineOrdersEnabled) return 1;
        return 2;
    };

    // Sort and filter canteens
    const getSortedCanteens = () => {
        let filtered = canteens;

        // Filter if showOpenOnly is enabled
        if (showOpenOnly) {
            filtered = canteens.filter(c => c.isOpen);
        }

        // Sort by status priority, then alphabetically
        return [...filtered].sort((a, b) => {
            const priorityDiff = getStatusPriority(a) - getStatusPriority(b);
            if (priorityDiff !== 0) return priorityDiff;
            return a.name.localeCompare(b.name);
        });
    };

    const renderCanteen = ({ item }) => {
        const stats = queueStats[item._id] || {};
        const isOpen = item.isOpen;
        const acceptOnline = item.isOnlineOrdersEnabled;
        const showQueueInfo = isOpen && acceptOnline && (stats.queuedOrders > 0 || stats.demandLevel);
        
        let demandColor = colors.textSecondary;
        if (stats.demandLevel === 'HIGH') demandColor = colors.error;
        if (stats.demandLevel === 'MEDIUM') demandColor = colors.warning;
        if (stats.demandLevel === 'LOW') demandColor = colors.success;

        return (
            <TouchableOpacity
                style={[styles.card, !isOpen && styles.cardClosed]}
                onPress={() => navigation.navigate('Menu', { canteen: item })}
                disabled={!isOpen || (isOpen && !acceptOnline)}
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
                        { backgroundColor: isOpen ? colors.statusOpen : colors.statusClosed }
                    ]}>
                        <Text style={styles.statusText}>
                            {isOpen ? 'OPEN' : 'CLOSED'}
                        </Text>
                    </View>
                </View>

                {item.description ? (
                    <Text style={styles.description}>{item.description}</Text>
                ) : null}

                {/* Queue & Demand Info */}
                {showQueueInfo && (
                    <View style={styles.queueInfoContainer}>
                        {stats.queuedOrders > 0 && (
                            <View style={styles.queueChip}>
                                <Ionicons name="time-outline" size={14} color={colors.primary} />
                                <Text style={styles.queueText}>
                                    {stats.queuedOrders} in queue (~{stats.estimatedWaitTime} min)
                                </Text>
                            </View>
                        )}
                        {stats.demandLevel && (
                             <View style={[styles.demandChip, { backgroundColor: demandColor + '15' }]}>
                                <Ionicons name="flame" size={14} color={demandColor} />
                                <Text style={[styles.demandText, { color: demandColor }]}>
                                    {stats.demandLevel} DEMAND
                                </Text>
                            </View>
                        )}
                    </View>
                )}

                {!acceptOnline && isOpen && (
                    <View style={styles.warningContainer}>
                        <Ionicons name="warning-outline" size={16} color={colors.warning} />
                        <Text style={styles.warningText}>Online orders currently disabled</Text>
                    </View>
                )}

                <View style={styles.cardFooter}>
                    <Ionicons name="chevron-forward" size={20} color={colors.primary} />
                </View>
            </TouchableOpacity>
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
            <View style={styles.filterContainer}>
                <Text style={styles.filterLabel}>Show open only</Text>
                <Switch
                    value={showOpenOnly}
                    onValueChange={setShowOpenOnly}
                    trackColor={{ false: colors.border, true: colors.lightBlue }}
                    thumbColor={showOpenOnly ? colors.primary : colors.textSecondary}
                />
            </View>
            <FlatList
                data={getSortedCanteens()}
                renderItem={renderCanteen}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>
                            {showOpenOnly ? 'No open canteens available' : 'No canteens available'}
                        </Text>
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
    queueInfoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
        marginBottom: 4,
    },
    queueChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightBackground,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    queueText: {
        fontSize: 12,
        color: colors.text,
        marginLeft: 6,
        fontWeight: '500',
    },
    demandChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    demandText: {
        fontSize: 11,
        fontWeight: '700',
        marginLeft: 4,
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
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterLabel: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    cardClosed: {
        opacity: 0.5,
    },
});

export default CanteenListScreen;
