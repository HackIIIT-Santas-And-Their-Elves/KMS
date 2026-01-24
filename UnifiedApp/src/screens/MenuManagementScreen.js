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
    Image,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { menuAPI } from '../services/api';
import { uploadImageToCloudinary } from '../utils/imageUpload';
import colors from '../constants/colors';

const MenuManagementScreen = () => {
    const { user } = useAuth();
    const [menuItems, setMenuItems] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Snacks',
        isVeg: true,
        imageUrl: '',
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
            setUploading(true);

            let imageUrl = formData.imageUrl;

            // Upload new image if selected
            if (imageUri && imageUri !== formData.imageUrl) {
                console.log('� Uploading image...');
                try {
                    imageUrl = await uploadImageToCloudinary(imageUri);
                } catch (uploadError) {
                    Alert.alert('Upload Error', 'Failed to upload image. Please try again.');
                    setUploading(false);
                    return;
                }
            }

            console.log('�📝 Saving menu item:', {
                canteenId: user.canteenId,
                formData,
                imageUrl,
                isEditing: !!editingItem
            });

            const data = {
                ...formData,
                price: parseFloat(formData.price),
                canteenId: user.canteenId,
                imageUrl: imageUrl || '',
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
        } finally {
            setUploading(false);
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
            imageUrl: item.imageUrl || '',
        });
        setImageUri(item.imageUrl || null);
        setModalVisible(true);
    };

    const resetForm = () => {
        setEditingItem(null);
        setImageUri(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Snacks',
            isVeg: true,
            imageUrl: '',
        });
    };

    // Image picker functions
    const pickImageFromGallery = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to your photo library');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const takePhoto = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please allow access to your camera');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const showImageOptions = () => {
        Alert.alert(
            'Add Photo',
            'Choose an option',
            [
                { text: 'Take Photo', onPress: takePhoto },
                { text: 'Choose from Gallery', onPress: pickImageFromGallery },
                { text: 'Cancel', style: 'cancel' },
            ]
        );
    };

    const removeImage = () => {
        setImageUri(null);
        setFormData({ ...formData, imageUrl: '' });
    };

    const renderMenuItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                {/* Image thumbnail */}
                {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.itemThumbnail} />
                ) : (
                    <View style={styles.noImageThumbnail}>
                        <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                    </View>
                )}

                <View style={styles.itemDetails}>
                    <View style={styles.itemHeader}>
                        <View style={styles.itemInfo}>
                            <View style={styles.itemNameRow}>
                                <View style={[
                                    styles.vegBadge,
                                    item.isVeg ? styles.vegBadgeGreen : styles.vegBadgeRed
                                ]}>
                                    <View style={[
                                        styles.vegDot,
                                        item.isVeg ? styles.vegDotGreen : styles.vegDotRed
                                    ]} />
                                </View>
                                <Text style={styles.itemName}>{item.name}</Text>
                            </View>
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
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <Text style={styles.modalTitle}>
                                {editingItem ? 'Edit Item' : 'Add New Item'}
                            </Text>

                            {/* Image Upload Section */}
                            <Text style={styles.imageLabel}>Item Photo</Text>
                            <View style={styles.imageSection}>
                                {imageUri ? (
                                    <View style={styles.imagePreviewContainer}>
                                        <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                                        <TouchableOpacity
                                            style={styles.removeImageButton}
                                            onPress={removeImage}
                                        >
                                            <Ionicons name="close-circle" size={28} color={colors.error} />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="image-outline" size={48} color={colors.textSecondary} />
                                        <Text style={styles.imagePlaceholderText}>No image selected</Text>
                                    </View>
                                )}

                                <View style={styles.imageButtonsRow}>
                                    <TouchableOpacity
                                        style={styles.imageButton}
                                        onPress={takePhoto}
                                    >
                                        <Ionicons name="camera" size={20} color={colors.white} />
                                        <Text style={styles.imageButtonText}>Camera</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.imageButton}
                                        onPress={pickImageFromGallery}
                                    >
                                        <Ionicons name="images" size={20} color={colors.white} />
                                        <Text style={styles.imageButtonText}>Gallery</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

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

                            {/* Veg/Non-Veg Toggle */}
                            <View style={styles.vegToggleContainer}>
                                <Text style={styles.vegToggleLabel}>Food Type</Text>
                                <View style={styles.vegToggleButtons}>
                                    <TouchableOpacity
                                        style={[
                                            styles.vegToggleButton,
                                            formData.isVeg && styles.vegToggleButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, isVeg: true })}
                                    >
                                        <View style={[styles.vegIndicator, styles.vegIndicatorGreen]} />
                                        <Text style={[
                                            styles.vegToggleText,
                                            formData.isVeg && styles.vegToggleTextActive
                                        ]}>Veg</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.vegToggleButton,
                                            !formData.isVeg && styles.nonVegToggleButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, isVeg: false })}
                                    >
                                        <View style={[styles.vegIndicator, styles.vegIndicatorRed]} />
                                        <Text style={[
                                            styles.vegToggleText,
                                            !formData.isVeg && styles.vegToggleTextActive
                                        ]}>Non-Veg</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.modalButtons}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                    disabled={uploading}
                                >
                                    <Text style={styles.cancelButtonText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton, uploading && styles.disabledButton]}
                                    onPress={handleSave}
                                    disabled={uploading}
                                >
                                    {uploading ? (
                                        <ActivityIndicator size="small" color={colors.white} />
                                    ) : (
                                        <Text style={styles.saveButtonText}>Save</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
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
        padding: 12,
        marginBottom: 12,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'row',
    },
    itemThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
    },
    noImageThumbnail: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemDetails: {
        flex: 1,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
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
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    // Image upload styles
    imageLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    imageSection: {
        marginBottom: 16,
    },
    imagePreviewContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 12,
    },
    imagePreview: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        resizeMode: 'cover',
    },
    removeImageButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: colors.white,
        borderRadius: 14,
    },
    imagePlaceholder: {
        height: 120,
        borderWidth: 2,
        borderColor: colors.border,
        borderStyle: 'dashed',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: colors.surface,
    },
    imagePlaceholderText: {
        marginTop: 8,
        fontSize: 14,
        color: colors.textSecondary,
    },
    imageButtonsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    imageButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 8,
        gap: 8,
    },
    imageButtonText: {
        color: colors.white,
        fontWeight: '600',
        fontSize: 14,
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
        justifyContent: 'center',
        minHeight: 48,
    },
    cancelButton: {
        backgroundColor: colors.surface,
    },
    saveButton: {
        backgroundColor: colors.primary,
    },
    disabledButton: {
        opacity: 0.7,
    },
    cancelButtonText: {
        color: colors.text,
        fontWeight: 'bold',
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    // Veg/Non-Veg toggle styles
    vegToggleContainer: {
        marginBottom: 16,
    },
    vegToggleLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 8,
    },
    vegToggleButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    vegToggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        gap: 8,
    },
    vegToggleButtonActive: {
        borderColor: '#22C55E',
        backgroundColor: '#F0FDF4',
    },
    nonVegToggleButtonActive: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    vegToggleText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    vegToggleTextActive: {
        color: colors.text,
    },
    vegIndicator: {
        width: 16,
        height: 16,
        borderRadius: 3,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vegIndicatorGreen: {
        borderColor: '#22C55E',
    },
    vegIndicatorRed: {
        borderColor: '#EF4444',
    },
    // Veg badge styles for menu item cards
    itemNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    vegBadge: {
        width: 16,
        height: 16,
        borderRadius: 3,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    vegBadgeGreen: {
        borderColor: '#22C55E',
    },
    vegBadgeRed: {
        borderColor: '#EF4444',
    },
    vegDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    vegDotGreen: {
        backgroundColor: '#22C55E',
    },
    vegDotRed: {
        backgroundColor: '#EF4444',
    },
});

export default MenuManagementScreen;
