import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '../constants/colors';

const UserManagementScreen = () => {
    return (
        <View style={styles.container}>
            <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>
                User management features coming soon...
            </Text>
            <Text style={styles.info}>
                For now, create users via API using the setup guide
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    info: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});

export default UserManagementScreen;
