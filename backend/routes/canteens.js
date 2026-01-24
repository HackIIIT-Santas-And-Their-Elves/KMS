const express = require('express');
const router = express.Router();
const Canteen = require('../models/Canteen');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/canteens
// @desc    Get all canteens
// @access  Public
router.get('/', async (req, res) => {
    try {
        const canteens = await Canteen.find();
        res.json({
            success: true,
            count: canteens.length,
            data: canteens
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   GET /api/canteens/:id
// @desc    Get single canteen
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({
                success: false,
                message: 'Canteen not found'
            });
        }

        res.json({
            success: true,
            data: canteen
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/canteens
// @desc    Create new canteen (auto-creates canteen user)
// @access  Private (Admin only)
router.post('/', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const User = require('../models/User');

        // Create the canteen
        const canteen = await Canteen.create(req.body);

        // Generate default credentials
        const canteenEmail = `${canteen.name.toLowerCase().replace(/\s+/g, '')}@kms.com`;
        const defaultPassword = 'canteen123';

        // Create canteen user
        const canteenUser = await User.create({
            name: `${canteen.name} Staff`,
            email: canteenEmail,
            password: defaultPassword,
            role: 'CANTEEN',
            canteenId: canteen._id
        });

        res.status(201).json({
            success: true,
            data: canteen,
            credentials: {
                email: canteenEmail,
                password: defaultPassword,
                canteenId: canteen._id
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/canteens/:id
// @desc    Update canteen
// @access  Private (Admin or Canteen owner)
router.put('/:id', protect, authorize('ADMIN', 'CANTEEN'), async (req, res) => {
    try {
        let canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({
                success: false,
                message: 'Canteen not found'
            });
        }

        // Check if user is canteen owner
        if (req.user.role === 'CANTEEN' && req.user.canteenId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this canteen'
            });
        }

        canteen = await Canteen.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({
            success: true,
            data: canteen
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/canteens/:id/toggle-open
// @desc    Toggle canteen open/close status
// @access  Private (Canteen owner only)
router.post('/:id/toggle-open', protect, authorize('CANTEEN', 'ADMIN'), async (req, res) => {
    try {
        const canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({
                success: false,
                message: 'Canteen not found'
            });
        }

        // Check if user is canteen owner
        if (req.user.role === 'CANTEEN' && req.user.canteenId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this canteen'
            });
        }

        canteen.isOpen = !canteen.isOpen;
        await canteen.save();

        res.json({
            success: true,
            data: canteen
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   POST /api/canteens/:id/toggle-online-orders
// @desc    Toggle online orders enabled/disabled
// @access  Private (Canteen owner only)
router.post('/:id/toggle-online-orders', protect, authorize('CANTEEN', 'ADMIN'), async (req, res) => {
    try {
        const canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({
                success: false,
                message: 'Canteen not found'
            });
        }

        // Check if user is canteen owner
        if (req.user.role === 'CANTEEN' && req.user.canteenId.toString() !== req.params.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this canteen'
            });
        }

        canteen.isOnlineOrdersEnabled = !canteen.isOnlineOrdersEnabled;
        await canteen.save();

        res.json({
            success: true,
            data: canteen
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/canteens/:id
// @desc    Delete canteen
// @access  Private (Admin only)
router.delete('/:id', protect, authorize('ADMIN'), async (req, res) => {
    try {
        const canteen = await Canteen.findById(req.params.id);

        if (!canteen) {
            return res.status(404).json({
                success: false,
                message: 'Canteen not found'
            });
        }

        await canteen.deleteOne();

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
