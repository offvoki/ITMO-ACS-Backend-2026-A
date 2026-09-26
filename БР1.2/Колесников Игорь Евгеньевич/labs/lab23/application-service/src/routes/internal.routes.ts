import { Router } from 'express';
import { getApplicationsByVacancy } from '../services/application.service';

const router = Router();

router.get('/vacancies/:vacancyId/applications', async (req, res, next) => {
  try {
    if (!process.env.INTERNAL_SECRET || req.headers['x-internal-secret'] !== process.env.INTERNAL_SECRET) {
      res.status(403).json({ statusCode: 403, message: 'Forbidden' });
      return;
    }
    res.json(await getApplicationsByVacancy(req.params.vacancyId));
  } catch (err) {
    next(err);
  }
});

export default router;
