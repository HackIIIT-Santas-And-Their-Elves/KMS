import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { orderAPI } from '../services/api';
import colors from '../constants/colors';

const QRScannerScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) return;

        setScanned(true);

        try {
            await orderAPI.complete(orderId, data);
            Alert.alert(
                'Success',
                'Order completed successfully!',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
        } catch (error) {
            Alert.alert(
                'Error',
                error.response?.data?.message || 'Invalid pickup code',
                [{ text: 'Try Again', onPress: () => setScanned(false) }]
            );
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <Text>Requesting camera permission...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text>No access to camera</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <BarCodeScanner
                onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.overlay}>
                <View style={styles.scanArea} />
                <Text style={styles.instructions}>
                    Scan the customer's pickup QR code
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanArea: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: colors.white,
        borderRadius: 12,
        backgroundColor: 'transparent',
    },
    instructions: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 24,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.7)',
        padding: 12,
        borderRadius: 8,
    },
});

export default QRScannerScreen;
