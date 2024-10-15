import express from 'express';
import { getCMDBData } from '../controllers/cmdbController.js';

const router = express.Router();

// GET route to fetch CMDB data by hostname in the URL parameter
router.get('/:hostname', getCMDBData);

export default router;