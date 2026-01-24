import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import colors from '../constants/colors';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();

    const validateBasicFields = () => {
        if (!name || !email || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all required fields');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return false;
        }

        return true;
    };

    const handleRegister = async () => {
        // Basic validation for all roles
        if (!validateBasicFields()) {
            return;
        }

        setLoading(true);
        
        const registrationData = {
            name,
            email,
            password,
            role: 'STUDENT',
        };

        console.log('🔐 Attempting registration with data:', {
            name,
            email
        });

        const result = await register(registrationData);
        setLoading(false);

        if (!result.success) {
            console.error('❌ Registration failed:', result.message);
            Alert.alert('Registration Failed', result.message);
        } else {
            console.log('✅ Registration successful! User:', result.data.email);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.form}>
                    {/* Full Name Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Full Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your name"
                            value={name}
                            onChangeText={setName}
                            autoCapitalize="words"
                            editable={!loading}
                        />
                    </View>

                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!loading}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    {/* Confirm Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            editable={!loading}
                        />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Already have an account?{' '}
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.linkText}>Login</Text>
                            </TouchableOpacity>
                        </Text>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 24,
    },
    form: {
        backgroundColor: colors.surface,
        borderRadius: 18,
        padding: 24,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.10,
        shadowRadius: 16,
        elevation: 6,
    },
    inputContainer: {
        marginBottom: 18,
    },
    label: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.secondary,
        marginBottom: 6,
        marginLeft: 2,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.text,
        marginBottom: 2,
    },
    button: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 18,
        shadowColor: colors.action,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: colors.textSecondary,
        fontSize: 15,
    },
    linkText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    roleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    roleButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        backgroundColor: colors.white,
    },
    roleButtonActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    roleButtonText: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
    },
    roleButtonTextActive: {
        color: colors.white,
        fontWeight: 'bold',
    },
    infoBox: {
        backgroundColor: colors.lightBlue || '#E3F2FD',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    infoText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
});

export default RegisterScreen;
