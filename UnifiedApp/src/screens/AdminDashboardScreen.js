import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { canteenAPI } from '../services/api';
import colors from '../constants/colors';

const DashboardScreen = ({ navigation }) => {
    const { logout } = useAuth();
    const [canteens, setCanteens] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalCanteens: 0,
        openCanteens: 0,
        onlineEnabled: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await canteenAPI.getAll();
            const canteenData = response.data.data;
            setCanteens(canteenData);

            setStats({
                totalCanteens: canteenData.length,
                openCanteens: canteenData.filter(c => c.isOpen).length,
                onlineEnabled: canteenData.filter(c => c.isOnlineOrdersEnabled).length,
            });
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: logout,
                },
            ]
        );
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.title}>Admin Dashboard</Text>
                        <Text style={styles.subtitle}>System Overview</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.logoutHeaderButton}
                        onPress={handleLogout}
                    >
                        <Ionicons name="log-out-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Ionicons name="restaurant" size={32} color={colors.primary} />
                    <Text style={styles.statNumber}>{stats.totalCanteens}</Text>
                    <Text style={styles.statLabel}>Total Canteens</Text>
                </View>

                <View style={styles.statCard}>
                    <Ionicons name="checkmark-circle" size={32} color={colors.success} />
                    <Text style={styles.statNumber}>{stats.openCanteens}</Text>
                    <Text style={styles.statLabel}>Currently Open</Text>
                </View>

                <View style={styles.statCard}>
                    <Ionicons name="globe" size={32} color={colors.info} />
                    <Text style={styles.statNumber}>{stats.onlineEnabled}</Text>
                    <Text style={styles.statLabel}>Online Orders</Text>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('CanteenManagement')}
                >
                    <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                    <Text style={styles.actionText}>Manage Canteens</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('UserManagement')}
                >
                    <Ionicons name="people-outline" size={24} color={colors.primary} />
                    <Text style={styles.actionText}>Manage Users</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Canteens</Text>
                {canteens.slice(0, 5).map((canteen) => (
                    <View key={canteen._id} style={styles.canteenCard}>
                        <View style={styles.canteenInfo}>
                            <Text style={styles.canteenName}>{canteen.name}</Text>
                            <Text style={styles.canteenLocation}>{canteen.location}</Text>
                        </View>
                        <View style={styles.canteenStatus}>
                            <View style={[styles.statusDot, { backgroundColor: canteen.isOpen ? colors.success : colors.error }]} />
                            <Text style={styles.statusText}>{canteen.isOpen ? 'Open' : 'Closed'}</Text>
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        padding: 16,
        paddingTop: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.white,
        opacity: 0.9,
    },
    logoutHeaderButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 4,
        textAlign: 'center',
    },
    section: {
        backgroundColor: colors.white,
        marginTop: 16,
        padding: 16,
    },
    sectionHeader: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.surface,
        borderRadius: 8,
        marginBottom: 12,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        marginLeft: 12,
    },
    canteenCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    canteenInfo: {
        flex: 1,
    },
    canteenName: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    canteenLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    canteenStatus: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 12,
        color: colors.textSecondary,
    },
});

export default DashboardScreen;
