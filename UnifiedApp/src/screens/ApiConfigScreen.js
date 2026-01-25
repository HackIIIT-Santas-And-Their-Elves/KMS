import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApiConfig } from '../context/ApiConfigContext';
import colors from '../constants/colors';
import axios from 'axios';

const ApiConfigScreen = () => {
    const { saveApiUrl } = useApiConfig();
    const [customUrl, setCustomUrl] = useState('');
    const [selectedOption, setSelectedOption] = useState(null); // 'custom' or 'deployed'
    const [testing, setTesting] = useState(false);

    const DEPLOYED_URL = 'https://canteenapp-wsu0.onrender.com/api';

    const testConnection = async (url) => {
        try {
            setTesting(true);
            const response = await axios.get(`${url}/health`, { timeout: 5000 });
            return response.data.success === true;
        } catch (error) {
            console.error('Connection test failed:', error.message);
            return false;
        } finally {
            setTesting(false);
        }
    };

    const handleSaveUrl = async (url) => {
        if (!url || url.trim() === '') {
            Alert.alert('Error', 'Please enter a valid URL');
            return;
        }

        // Clean the URL
        let cleanUrl = url.trim();

        // Remove trailing slash
        if (cleanUrl.endsWith('/')) {
            cleanUrl = cleanUrl.slice(0, -1);
        }

        // Test connection
        const isConnected = await testConnection(cleanUrl);

        if (!isConnected) {
            Alert.alert(
                'Connection Failed',
                'Unable to connect to the backend server. Do you want to save this URL anyway?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Save Anyway',
                        onPress: async () => {
                            const result = await saveApiUrl(cleanUrl);
                            if (result.success) {
                                Alert.alert('Success', 'API URL saved successfully!');
                            } else {
                                Alert.alert('Error', result.message);
                            }
                        },
                    },
                ]
            );
            return;
        }

        // Connection successful
        const result = await saveApiUrl(cleanUrl);
        if (result.success) {
            Alert.alert('Success', 'Connected to backend successfully! ✅');
        } else {
            Alert.alert('Error', result.message);
        }
    };

    const handleDeployedUrl = () => {
        setSelectedOption('deployed');
        handleSaveUrl(DEPLOYED_URL);
    };

    const handleCustomUrl = () => {
        if (selectedOption === 'custom' && customUrl) {
            handleSaveUrl(customUrl);
        } else {
            setSelectedOption('custom');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Ionicons name="server-outline" size={60} color={colors.primary} />
                        <Text style={styles.title}>Backend Configuration</Text>
                        <Text style={styles.subtitle}>
                            Choose your backend server to get started
                        </Text>
                    </View>

                    {/* Deployed API Option */}
                    <TouchableOpacity
                        style={[
                            styles.optionCard,
                            selectedOption === 'deployed' && styles.optionCardSelected,
                        ]}
                        onPress={handleDeployedUrl}
                        disabled={testing}
                    >
                        <View style={styles.optionHeader}>
                            <Ionicons name="cloud-outline" size={32} color={colors.primary} />
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Deployed Server</Text>
                                <Text style={styles.optionSubtitle}>Use production API</Text>
                            </View>
                        </View>
                        <View style={styles.urlContainer}>
                            <Text style={styles.urlText} numberOfLines={1}>
                                {DEPLOYED_URL}
                            </Text>
                        </View>
                        {selectedOption === 'deployed' && (
                            <View style={styles.selectedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.selectedText}>Selected</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    {/* Custom URL Option */}
                    <View
                        style={[
                            styles.optionCard,
                            selectedOption === 'custom' && styles.optionCardSelected,
                        ]}
                    >
                        <View style={styles.optionHeader}>
                            <Ionicons name="laptop-outline" size={32} color={colors.primary} />
                            <View style={styles.optionTextContainer}>
                                <Text style={styles.optionTitle}>Local/Custom Server</Text>
                                <Text style={styles.optionSubtitle}>Enter your backend IP</Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.input}
                            placeholder="http://192.168.x.x:5000/api"
                            placeholderTextColor={colors.textSecondary}
                            value={customUrl}
                            onChangeText={setCustomUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                            onFocus={() => setSelectedOption('custom')}
                        />

                        <TouchableOpacity
                            style={[
                                styles.connectButton,
                                (!customUrl || testing) && styles.connectButtonDisabled,
                            ]}
                            onPress={handleCustomUrl}
                            disabled={!customUrl || testing}
                        >
                            {testing ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <>
                                    <Ionicons name="link-outline" size={20} color={colors.white} />
                                    <Text style={styles.connectButtonText}>Connect</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        {selectedOption === 'custom' && customUrl && (
                            <View style={styles.selectedBadge}>
                                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                                <Text style={styles.selectedText}>Selected</Text>
                            </View>
                        )}
                    </View>

                    {/* Info Box */}
                    <View style={styles.infoBox}>
                        <Ionicons name="information-circle-outline" size={24} color={colors.info} />
                        <Text style={styles.infoText}>
                            For local development, find your PC's IP address and use the format:{' '}
                            <Text style={styles.infoTextBold}>http://YOUR_IP:5000/api</Text>
                        </Text>
                    </View>

                    {testing && (
                        <View style={styles.testingContainer}>
                            <ActivityIndicator size="small" color={colors.primary} />
                            <Text style={styles.testingText}>Testing connection...</Text>
                        </View>
                    )}
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        padding: 20,
        paddingTop: 40,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginTop: 20,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    optionCard: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: 20,
        marginBottom: 20,
        borderWidth: 2,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: '#f0f9ff',
    },
    optionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    optionTextContainer: {
        marginLeft: 12,
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    optionSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 2,
    },
    urlContainer: {
        backgroundColor: colors.background,
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    urlText: {
        fontSize: 12,
        color: colors.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: colors.text,
        marginTop: 8,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    connectButton: {
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    connectButtonDisabled: {
        backgroundColor: colors.textSecondary,
        opacity: 0.5,
    },
    connectButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    selectedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        padding: 8,
        backgroundColor: '#d1fae5',
        borderRadius: 8,
    },
    selectedText: {
        color: colors.success,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: '#e0f2fe',
        padding: 16,
        borderRadius: 8,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 13,
        color: colors.info,
        marginLeft: 12,
        lineHeight: 20,
    },
    infoTextBold: {
        fontWeight: 'bold',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    testingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    testingText: {
        marginLeft: 10,
        fontSize: 14,
        color: colors.textSecondary,
    },
});

export default ApiConfigScreen;
