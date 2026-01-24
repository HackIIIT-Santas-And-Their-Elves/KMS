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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { menuAPI } from '../services/api';
import colors from '../constants/colors';

const MenuManagementScreen = () => {
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Snacks',
        isVeg: true,
    });

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const response = await menuAPI.getByCanteen(user.canteenId);
            setMenuItems(response.data.data);
        } catch (error) {
            console.error('Error fetching menu:', error);
        }
    };

    const handleSave = async () => {
        try {
            console.log('📝 Saving menu item:', {
                canteenId: user.canteenId,
                formData,
                isEditing: !!editingItem
            });

            const data = {
                ...formData,
                price: parseFloat(formData.price),
                canteenId: user.canteenId,
            };

            if (editingItem) {
                await menuAPI.update(editingItem._id, data);
            } else {
                await menuAPI.create(data);
            }

            setModalVisible(false);
            resetForm();
            fetchMenu();
            Alert.alert('Success', `Item ${editingItem ? 'updated' : 'created'} successfully`);
        } catch (error) {
            console.error('❌ Error saving menu item:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to save item';
            Alert.alert('Error', errorMsg);
        }
    };

    const handleToggleAvailability = async (id) => {
        try {
            console.log('🔄 Toggling availability for item:', id);
            await menuAPI.toggleAvailability(id);
            fetchMenu();
        } catch (error) {
            console.error('❌ Error toggling availability:', error.response?.data || error.message);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to toggle availability';
            Alert.alert('Error', errorMsg);
        }
    };

    const handleDelete = (id) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await menuAPI.delete(id);
                            fetchMenu();
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete item');
                        }
                    },
                },
            ]
        );
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description || '',
            price: item.price.toString(),
            category: item.category,
            isVeg: item.isVeg,
        });
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Snacks',
            isVeg: true,
        });
    };

    const renderMenuItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => openEditModal(item)}>
                        <Ionicons name="create-outline" size={24} color={colors.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item._id)}>
                        <Ionicons name="trash-outline" size={24} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.itemFooter}>
                <Text style={styles.category}>{item.category}</Text>
                <TouchableOpacity
                    style={[styles.availabilityButton, !item.isAvailable && styles.unavailable]}
                    onPress={() => handleToggleAvailability(item._id)}
                >
                    <Text style={styles.availabilityText}>
                        {item.isAvailable ? 'Available' : 'Unavailable'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={menuItems}
                renderItem={renderMenuItem}
                keyExtractor={(item) => item._id}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => {
                            resetForm();
                            setModalVisible(true);
                        }}
                    >
                        <Ionicons name="add-circle" size={24} color={colors.white} />
                        <Text style={styles.addButtonText}>Add New Item</Text>
                    </TouchableOpacity>
                }
            />

            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {editingItem ? 'Edit Item' : 'Add New Item'}
                        </Text>

                        <TextInput
                            style={styles.input}
                            placeholder="Item Name"
                            value={formData.name}
                            onChangeText={(text) => setFormData({ ...formData, name: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Description (optional)"
                            value={formData.description}
                            onChangeText={(text) => setFormData({ ...formData, description: text })}
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Price"
                            value={formData.price}
                            onChangeText={(text) => setFormData({ ...formData, price: text })}
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
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemInfo: {
        flex: 1,
    },
    itemName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    itemActions: {
        flexDirection: 'row',
        gap: 12,
    },
    itemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    category: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    availabilityButton: {
        backgroundColor: colors.success,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    unavailable: {
        backgroundColor: colors.error,
    },
    availabilityText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
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

export default MenuManagementScreen;
