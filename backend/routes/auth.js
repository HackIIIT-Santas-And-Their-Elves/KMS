const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Canteen = require('../models/Canteen');
const { generateToken } = require('../middleware/auth');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').isIn(['STUDENT', 'CANTEEN', 'ADMIN']).withMessage('Invalid role')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('❌ Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { name, email, password, role, canteenName, canteenLocation } = req.body;

        console.log('📝 Register request:', {
            name,
            email,
            role,
            hasCanteenName: !!canteenName,
            hasCanteenLocation: !!canteenLocation
        });

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            console.error('❌ User already exists:', email);
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }

        let canteenId = null;  // Initialize as null instead of undefined

        // For CANTEEN role, create a canteen and link it
        if (role === 'CANTEEN') {
            console.log('🍽️ Creating canteen for CANTEEN user');
            
            if (!canteenName || !canteenLocation) {
                console.error('❌ Missing canteen fields:', { canteenName, canteenLocation });
                return res.status(400).json({
                    success: false,
                    message: 'Canteen name and location are required for canteen registration'
                });
            }

            // Check if canteen name already exists
            const canteenExists = await Canteen.findOne({ name: canteenName });
            if (canteenExists) {
                console.error('❌ Canteen already exists:', canteenName);
                return res.status(400).json({
                    success: false,
                    message: 'Canteen with this name already exists'
                });
            }

            // Create canteen
            const canteen = await Canteen.create({
                name: canteenName,
                location: canteenLocation,
                isOpen: false,
                isOnlineOrdersEnabled: true
            });

            canteenId = canteen._id;
            console.log('✅ Canteen created:', canteenId);
        }

        // Create user - only include canteenId if it's set
        const userData = {
            name,
            email,
            password,
            role
        };

        // Only add canteenId if role is CANTEEN (and it exists)
        if (role === 'CANTEEN') {
            userData.canteenId = canteenId;
        }

        const user = await User.create(userData);

        const token = generateToken(user._id);

        console.log('✅ User registered successfully:', user._id, 'Role:', role);

        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                canteenId: user.canteenId,
                token
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error.message, error.stack);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const token = generateToken(user._id);

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                canteenId: user.canteenId,
                token
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
