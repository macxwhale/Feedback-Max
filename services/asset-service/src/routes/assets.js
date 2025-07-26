
const express = require('express');
const multer = require('multer');
const { AssetController } = require('../controllers/AssetController');
const { authenticateToken } = require('../middleware/auth');
const { validateAssetRequest } = require('../middleware/validation');

const router = express.Router();
const assetController = new AssetController();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Asset routes
router.get('/', 
  authenticateToken,
  assetController.getAssets.bind(assetController)
);

router.post('/',
  authenticateToken,
  validateAssetRequest,
  assetController.createAsset.bind(assetController)
);

router.post('/upload',
  authenticateToken,
  upload.single('file'),
  assetController.uploadAsset.bind(assetController)
);

router.put('/:id',
  authenticateToken,
  assetController.updateAsset.bind(assetController)
);

router.delete('/:id',
  authenticateToken,
  assetController.deleteAsset.bind(assetController)
);

// Theme routes
router.get('/themes',
  authenticateToken,
  assetController.getThemes.bind(assetController)
);

router.post('/themes',
  authenticateToken,
  assetController.createTheme.bind(assetController)
);

module.exports = router;
