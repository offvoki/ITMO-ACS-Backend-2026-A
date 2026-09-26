import { Router } from 'express';
import { requireInternalSecret } from '../middleware/internal';
import * as ctrl from '../controllers/internal.controller';

const router = Router();

router.use(requireInternalSecret);

router.get('/seekers/by-user/:userId', ctrl.getSeekerByUser);
router.get('/employers/by-user/:userId', ctrl.getEmployerByUser);
router.patch('/employers/by-user/:userId/company', ctrl.setEmployerCompany);

export default router;
