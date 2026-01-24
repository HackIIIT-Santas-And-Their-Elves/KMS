import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    Modal,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { canteenAPI } from '../services/api';
import colors from '../constants/colors';

const CanteenManagementScreen = ({ route }) => {
    const filter = route?.params?.filter || 'all';
    const [canteens, setCanteens] = useState([]);
    const [filteredCanteens, setFilteredCanteens] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCanteen, setEditingCanteen] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        description: '',
        maxBulkSize: '50',
    });

    useEffect(() => {
        fetchCanteens();
    }, []);

    useEffect(() => {
        if (filter === 'open') {
            setFilteredCanteens(canteens.filter(c => c.isOpen));
        } else {
            setFilteredCanteens(canteens);
        }
    }, [canteens, filter]);

    const fetchCanteens = async () => {
        try {
            const response = await canteenAPI.getAll();
            setCanteens(response.data.data);
        } catch (error) {
            console.error('Error fetching canteens:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.location) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        try {
            const data = {
                ...formData,
                maxBulkSize: parseInt(formData.maxBulkSize),
            };

            if (editingCanteen) {
                await canteenAPI.update(editingCanteen._id, data);
                Alert.alert('Success', 'Canteen updated successfully');
            } else {
                const response = await canteenAPI.create(data);
                const { credentials } = response.data;

                // Show credentials to admin
                Alert.alert(
                    'Canteen Created Successfully!',
                    `Canteen Login Credentials:\n\n` +
                    `Email: ${credentials.email}\n` +
                    `Password: ${credentials.password}\n` +
                    `Canteen ID: ${credentials.canteenId}\n\n` +
                    `Please save these credentials!`,
                    [{ text: 'OK' }]
                );
            }

            setModalVisible(false);
            resetForm();
            fetchCanteens();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to save canteen');
        }
    };

    const handleDelete = (canteen) => {
        Alert.alert(
            'Delete Canteen',
            `Are you sure you want to delete ${canteen.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await canteenAPI.delete(canteen._id);
                            fetchCanteens();
                            Alert.alert('Success', 'Canteen deleted successfully');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete canteen');
                        }
                    },
                },
            ]
        );
    };

    const openEditModal = (canteen) => {
        setEditingCanteen(canteen);
        setFormData({
            name: canteen.name,
            location: canteen.location,
            description: canteen.description || '',
            maxBulkSize: canteen.maxBulkSize.toString(),
        });
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingCanteen(null);
        setFormData({
            name: '',
            location: '',
            description: '',
            maxBulkSize: '50',
        });
    };

    const renderCanteen = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.canteenInfo}>
                    <Text style={styles.canteenName}>{item.name}</Text>
                    <Text style={styles.canteenLocation}>{item.location}</Text>
                    {item.description && (
                        <Text style={styles.canteenDescription}>{item.description}</Text>
                    )}
                    <Text style={styles.canteenId}>ID: {item._id}</Text>
                </View>
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                        <Ionicons name="create-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item)} style={{ marginLeft: 12 }}>
                        <Ionicons name="trash-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.cardFooter}>
                <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: item.isOpen ? colors.success : colors.error }]}>
                        <Text style={styles.statusText}>{item.isOpen ? 'OPEN' : 'CLOSED'}</Text>
                    </View>
                    {item.isOnlineOrdersEnabled && (
                        <View style={[styles.statusBadge, { backgroundColor: colors.info }]}>
                            <Text style={styles.statusText}>ONLINE</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.bulkSize}>Max Bulk: {item.maxBulkSize}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {filter === 'open' && (
                <View style={styles.filterBanner}>
                    <Ionicons name="filter" size={18} color={colors.white} />
                    <Text style={styles.filterText}>Showing only open canteens</Text>
                </View>
            )}
            <FlatList
                data={filteredCanteens}
                renderItem={renderCanteen}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchCanteens} />}
                ListHeaderComponent={
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            resetForm();
                            setModalVisible(true);
                        }}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.white} />
                        <Text style={styles.addButtonText}>Add New Canteen</Text>
                    </TouchableOpacity>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="restaurant-outline" size={64} color={colors.textSecondary} />
                        <Text style={styles.emptyText}>
                            {filter === 'open' ? 'No open canteens' : 'No canteens yet'}
                        </Text>
                    </View>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingCanteen ? 'Edit Canteen' : 'Add New Canteen'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Canteen Name *"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Location *"
                            value={formData.location}
                            onChangeText={(text) => setFormData({ ...formData, location: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Description (optional)"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                            multiline
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Max Bulk Size"
                            value={formData.maxBulkSize}
                            onChangeText={(text) => setFormData({ ...formData, maxBulkSize: text })}
                            keyboardType="numeric"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                            >
                                <Text style={styles.saveButtonText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    filterBanner: {
        backgroundColor: colors.success,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        gap: 8,
    },
    filterText: {
        color: colors.white,
        fontSize: 14,
        fontWeight: '600',
    },
    list: {
        padding: 16,
    },
    addButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
    },
    addButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    canteenInfo: {
        flex: 1,
    },
    canteenName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    canteenLocation: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    canteenDescription: {
        fontSize: 13,
        color: colors.textSecondary,
        fontStyle: 'italic',
    },
    canteenId: {
        fontSize: 11,
        color: colors.textSecondary,
        fontFamily: 'monospace',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    statusContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusText: {
        color: colors.white,
        fontSize: 11,
        fontWeight: 'bold',
    },
    bulkSize: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingTop: 60,
    },
    emptyText: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 24,
        width: '90%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: colors.surface,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    cancelButtonText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
});

export default CanteenManagementScreen;
