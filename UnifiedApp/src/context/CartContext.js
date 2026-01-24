import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);
    const [canteenId, setCanteenId] = useState(null);

    const addToCart = (item, quantity = 1) => {
        // Check if item is from same canteen
        if (canteenId && canteenId !== item.canteenId) {
            return {
                success: false,
                message: 'Cannot add items from different canteens'
            };
        }

        const existingItemIndex = cart.findIndex(
            (cartItem) => cartItem._id === item._id
        );

        if (existingItemIndex > -1) {
            const newCart = [...cart];
            newCart[existingItemIndex].quantity += quantity;
            setCart(newCart);
        } else {
            setCart([...cart, { ...item, quantity }]);
            if (!canteenId) {
                setCanteenId(item.canteenId);
            }
        }

        return { success: true };
    };

    const removeFromCart = (itemId) => {
        const newCart = cart.filter((item) => item._id !== itemId);
        setCart(newCart);

        if (newCart.length === 0) {
            setCanteenId(null);
        }
    };

    const updateQuantity = (itemId, quantity) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }

        const newCart = cart.map((item) =>
            item._id === itemId ? { ...item, quantity } : item
        );
        setCart(newCart);
    };

    const clearCart = () => {
        setCart([]);
        setCanteenId(null);
    };

    const getTotal = () => {
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const value = {
        cart,
        canteenId,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotal,
        getTotalItems,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
