import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Image,
    Linking,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react-native';

// --- NEW PROFESSIONAL THEME ---
const theme = {
    primary: '#726ceaff',   // Indigo 600 - Professional Brand Color
    action: '#D97706',    // Amber 600 - Distinct "Call to Action" button
    secondary: '#1E293B', // Slate 800 - Deep, readable text
    background: '#F8FAFC', // Slate 50 - Crisp, clean background
    surface: '#FFFFFF',   // Pure White input background
    text: '#0F172A',      // Slate 900
    textSecondary: '#64748B', // Slate 500
    border: '#E2E8F0',    // Slate 200
    error: '#EF4444',
};

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [casLoading, setCasLoading] = useState(false);
    const { login, loginWithCAS } = useAuth();

    // CAS Configuration
    const CAS_LOGIN_URL = 'https://login.iiit.ac.in/cas/login';
    const CAS_SERVICE_URL = 'kms://cas-callback';

    // Handle deep link for CAS callback
    useEffect(() => {
        const handleDeepLink = async (event) => {
            const url = event.url;
            console.log('🔗 Deep link received:', url);

            if (url && url.includes('cas-callback')) {
                // Extract ticket from URL
                const ticketMatch = url.match(/ticket=([^&]+)/);
                if (ticketMatch && ticketMatch[1]) {
                    const ticket = ticketMatch[1];
                    console.log('🎫 CAS ticket extracted');

                    setCasLoading(true);
                    try {
                        const result = await loginWithCAS(ticket, CAS_SERVICE_URL);
                        if (!result.success) {
                            Alert.alert('CAS Login Failed', result.message);
                        } else {
                            Alert.alert('Success', `Welcome ${result.data.name}!`);
                        }
                    } catch (error) {
                        Alert.alert('Error', 'CAS authentication failed');
                    } finally {
                        setCasLoading(false);
                    }
                }
            }
        };

        // Listen for deep links
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Check if app was opened from a deep link
        Linking.getInitialURL().then((url) => {
            if (url) {
                handleDeepLink({ url });
            }
        });

        return () => {
            subscription.remove();
        };
    }, [loginWithCAS]);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            const result = await login(email, password);

            if (!result.success) {
                Alert.alert('Login Failed', result.message);
            } else {
                const role = result.data?.role;
                const roleText = role === 'STUDENT' ? 'Student' : role === 'CANTEEN' ? 'Canteen' : 'Admin';
                Alert.alert('Success', `Welcome ${roleText}!`);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCASLogin = async () => {
        setCasLoading(true);
        try {
            // Open CAS login page in browser
            const casUrl = `${CAS_LOGIN_URL}?service=${encodeURIComponent(CAS_SERVICE_URL)}`;
            console.log('🔐 Opening CAS login:', casUrl);

            const supported = await Linking.canOpenURL(casUrl);
            if (supported) {
                await Linking.openURL(casUrl);
            } else {
                Alert.alert('Error', 'Cannot open CAS login page');
            }
        } catch (error) {
            console.error('CAS login error:', error);
            Alert.alert('Error', 'Failed to open CAS login');
        } finally {
            // Keep loading state until we get the callback
            // It will be reset in the deep link handler
            setTimeout(() => setCasLoading(false), 30000); // Timeout after 30s
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <View style={styles.content}>
                    {/* Header Section with Image */}
                    <View style={styles.header}>
                        {/* Make sure 'logo.png' exists in your 'assets' folder.
                           Adjust width/height in styles.logo to fit your specific image aspect ratio.
                        */}
                        <Image
                            source={require('../assets/KMSapp2.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Mail size={20} color={theme.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="student@university.edu"
                                    placeholderTextColor={theme.textSecondary}
                                    value={email}
                                    onChangeText={setEmail}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                />
                            </View>
                        </View>

                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color={theme.textSecondary} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={theme.textSecondary}
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    autoCapitalize="none"
                                />
                                <TouchableOpacity
                                    onPress={() => setShowPassword(!showPassword)}
                                    style={styles.eyeIcon}
                                >
                                    {showPassword ? (
                                        <EyeOff size={20} color={theme.textSecondary} />
                                    ) : (
                                        <Eye size={20} color={theme.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.forgotPassword}
                            onPress={() => Alert.alert('Info', 'Feature coming soon!')}
                        >
                            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, loading && styles.buttonDisabled]}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <Text style={styles.buttonText}>
                                {loading ? 'Signing In...' : 'Sign In'}
                            </Text>
                        </TouchableOpacity>

                        {/* OR Divider */}
                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* CAS Login Button */}
                        <TouchableOpacity
                            style={[styles.casButton, casLoading && styles.buttonDisabled]}
                            onPress={handleCASLogin}
                            disabled={casLoading}
                        >
                            <GraduationCap size={22} color="#FFFFFF" style={{ marginRight: 10 }} />
                            <Text style={styles.casButtonText}>
                                {casLoading ? 'Redirecting to IIIT...' : 'Login with IIIT CAS'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>New to KMS? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.linkText}>Create an account</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    keyboardView: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    // New Logo Style
    logo: {
        width: 500,  // Adjust based on your image size
        height: 400, // Adjust based on your image size
        marginBottom: -100,
    },
    form: {
        width: '100%',
    },
    inputWrapper: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.secondary,
        marginBottom: 8,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        paddingHorizontal: 12,
        height: 56,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: theme.text,
        height: '100%',
    },
    eyeIcon: {
        padding: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: theme.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    button: {
        backgroundColor: theme.primary,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 24,
    },
    footerText: {
        color: theme.textSecondary,
        fontSize: 15,
    },
    linkText: {
        color: theme.primary,
        fontWeight: 'bold',
        fontSize: 15,
    },
    // CAS Login styles
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.border,
    },
    dividerText: {
        color: theme.textSecondary,
        paddingHorizontal: 16,
        fontSize: 14,
        fontWeight: '600',
    },
    casButton: {
        backgroundColor: '#1E40AF', // Dark Blue for IIIT branding
        height: 56,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1E40AF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    casButtonText: {
        color: '#FFFFFF',
        fontSize: 17,
        fontWeight: 'bold',
    },
});

export default LoginScreen;