import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

const ProfileScreen = () => {
    const { user, logout } = useAuth();

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
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={48} color={colors.white} />
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role}</Text>
                </View>
            </View>

            <View style={styles.section}>
                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="person-outline" size={24} color={colors.text} />
                    <Text style={styles.menuText}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="notifications-outline" size={24} color={colors.text} />
                    <Text style={styles.menuText}>Notifications</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="help-circle-outline" size={24} color={colors.text} />
                    <Text style={styles.menuText}>Help & Support</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Ionicons name="information-circle-outline" size={24} color={colors.text} />
                    <Text style={styles.menuText}>About</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Ionicons name="log-out-outline" size={24} color={colors.error} />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.version}>Version 1.0.0</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        backgroundColor: colors.primary,
        alignItems: 'center',
        padding: 32,
        paddingTop: 48,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    avatarContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: colors.action,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: colors.surface,
    },
    name: {
        fontSize: 26,
        fontWeight: '800',
        color: colors.white,
        marginBottom: 2,
    },
    email: {
        fontSize: 15,
        color: colors.white,
        opacity: 0.92,
        marginBottom: 10,
    },
    roleBadge: {
        backgroundColor: colors.surface,
        paddingHorizontal: 18,
        paddingVertical: 7,
        borderRadius: 14,
        marginTop: 6,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    roleText: {
        color: colors.primary,
        fontSize: 13,
        fontWeight: '700',
    },
    section: {
        marginTop: 32,
        backgroundColor: colors.surface,
        borderRadius: 18,
        marginHorizontal: 18,
        paddingVertical: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    menuText: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
        marginLeft: 16,
        fontWeight: '600',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 32,
        backgroundColor: colors.error,
        borderRadius: 12,
        paddingVertical: 14,
        marginHorizontal: 32,
        shadowColor: colors.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        elevation: 3,
    },
    logoutText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 8,
    },
    version: {
        textAlign: 'center',
        color: colors.textSecondary,
        marginTop: 18,
        fontSize: 13,
    },
});

export default ProfileScreen;
