import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
    TextInput,
    ScrollView,
    ActivityIndicator,
    Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import colors from '../constants/colors';

const ProfileScreen = () => {
    const { user, logout, updateUser } = useAuth();
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [passwordModalVisible, setPasswordModalVisible] = useState(false);
    const [aboutModalVisible, setAboutModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    // Edit Profile State
    const [name, setName] = useState(user?.name || '');

    // Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.updateProfile({ name: name.trim() });
            if (response.data.success) {
                updateUser(response.data.data);
                Alert.alert('Success', 'Profile updated successfully');
                setEditModalVisible(false);
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'All fields are required');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await authAPI.changePassword(currentPassword, newPassword);
            if (response.data.success) {
                Alert.alert('Success', 'Password changed successfully');
                setPasswordModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            }
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = () => {
        setName(user?.name || '');
        setEditModalVisible(true);
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
                <TouchableOpacity style={styles.menuItem} onPress={openEditModal}>
                    <Ionicons name="person-outline" size={24} color={colors.text} />
                    <Text style={styles.menuText}>Edit Profile</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setPasswordModalVisible(true)}>
                    <Ionicons name="lock-closed-outline" size={24} color={colors.text} />
                    <Text style={styles.menuText}>Change Password</Text>
                    <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={() => setAboutModalVisible(true)}>
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

            {/* Edit Profile Modal */}
            <Modal
                visible={editModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setEditModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Edit Profile</Text>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Enter your name"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Email (Cannot be changed)</Text>
                            <TextInput
                                style={[styles.input, styles.inputDisabled]}
                                value={user?.email}
                                editable={false}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setEditModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleUpdateProfile}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                visible={passwordModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setPasswordModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setPasswordModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Change Password</Text>
                            <TouchableOpacity onPress={() => setPasswordModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Current Password</Text>
                            <TextInput
                                style={styles.input}
                                value={currentPassword}
                                onChangeText={setCurrentPassword}
                                placeholder="Enter current password"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>New Password</Text>
                            <TextInput
                                style={styles.input}
                                value={newPassword}
                                onChangeText={setNewPassword}
                                placeholder="Enter new password (min 6 characters)"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputContainer}>
                            <Text style={styles.inputLabel}>Confirm New Password</Text>
                            <TextInput
                                style={styles.input}
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm new password"
                                placeholderTextColor={colors.textSecondary}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setPasswordModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleChangePassword}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color={colors.white} />
                                ) : (
                                    <Text style={styles.saveButtonText}>Change</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>

            {/* About Modal */}
            <Modal
                visible={aboutModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setAboutModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setAboutModalVisible(false)}
                >
                    <TouchableOpacity
                        style={styles.modalContent}
                        activeOpacity={1}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>About</Text>
                            <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
                                <Ionicons name="close" size={28} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.aboutContent}>
                            <Image
                                source={require('../assets/KMSapp2.png')}
                                style={styles.aboutLogo}
                                resizeMode="contain"
                            />
                            <Text style={styles.appVersion}>Version 1.0.0</Text>

                            <View style={styles.divider} />

                            <Text style={styles.madeWithLove}>Made with ❤️ by:</Text>

                            <View style={styles.developersContainer}>
                                <View style={styles.developerItem}>
                                    <Ionicons name="person-circle" size={20} color={colors.primary} />
                                    <Text style={styles.developerName}>DarkVader</Text>
                                </View>
                                <View style={styles.developerItem}>
                                    <Ionicons name="person-circle" size={20} color={colors.primary} />
                                    <Text style={styles.developerName}>Kanao Minori</Text>
                                </View>
                                <View style={styles.developerItem}>
                                    <Ionicons name="person-circle" size={20} color={colors.primary} />
                                    <Text style={styles.developerName}>AnonD</Text>
                                </View>
                                <View style={styles.developerItem}>
                                    <Ionicons name="person-circle" size={20} color={colors.primary} />
                                    <Text style={styles.developerName}>SDawg</Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <Text style={styles.copyright}>© 2026 KMS. All rights reserved.</Text>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text,
        backgroundColor: colors.white,
    },
    inputDisabled: {
        backgroundColor: colors.background,
        color: colors.textSecondary,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cancelButtonText: {
        color: colors.text,
        fontWeight: '600',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
    // About Modal Styles
    aboutContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    aboutLogo: {
        width: 500,
        height: 300,
        marginBottom: 0,
    },
    appVersion: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
    },
    divider: {
        width: '100%',
        height: 1,
        backgroundColor: colors.border,
        marginVertical: 20,
    },
    madeWithLove: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 16,
    },
    developersContainer: {
        width: '100%',
        gap: 12,
    },
    developerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: colors.background,
        borderRadius: 8,
        gap: 12,
    },
    developerName: {
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    copyright: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 8,
    },
});

export default ProfileScreen;
