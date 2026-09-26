import { Request, Response, NextFunction } from 'express';
import { VacancyService } from '../services/vacancy.service';
import { AppError } from '../utils/errors';

const service = new VacancyService();

const h =
  (fn: (req: Request, res: Response) => Promise<unknown>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (err) {
      next(err);
    }
  };

export const getVacancies = h(async (req, res) => {
  const integerQuery = (name: string): number | undefined => {
    const raw = req.query[name];
    if (raw === undefined) return undefined;
    const value = Number(raw);
    if (!Number.isInteger(value) || value < 0) {
      throw new AppError(400, `${name} must be a non-negative integer`);
    }
    return value;
  };
  const booleanQuery = req.query.isRemote;
  if (booleanQuery !== undefined && booleanQuery !== 'true' && booleanQuery !== 'false') {
    throw new AppError(400, 'isRemote must be true or false');
  }

  res.json(
    await service.findAll({
      page: integerQuery('page'),
      limit: integerQuery('limit'),
      search: req.query.search as string | undefined,
      cityId: req.query.cityId as string | undefined,
      countryId: req.query.countryId as string | undefined,
      industryId: req.query.industryId as string | undefined,
      employmentTypeId: req.query.employmentTypeId as string | undefined,
      salaryMin: integerQuery('salaryMin'),
      experienceYearsMax: integerQuery('experienceYearsMax'),
      isRemote: booleanQuery === undefined ? undefined : booleanQuery === 'true',
      skillIds:
        typeof req.query.skillIds === 'string'
          ? req.query.skillIds.split(',').map((id) => id.trim()).filter(Boolean)
          : undefined,
    }),
  );
});

export const createVacancy = h(async (req, res) => {
  res.status(201).json(await service.create(req.user!.sub, req.body));
});

export const getVacancy = h(async (req, res) => {
  res.json(await service.findOne(req.params.vacancyId));
});

export const updateVacancy = h(async (req, res) => {
  res.json(await service.update(req.params.vacancyId, req.user!.sub, req.body));
});

export const deleteVacancy = h(async (req, res) => {
  await service.remove(req.params.vacancyId, req.user!.sub);
  res.status(204).send();
});

export const addSkill = h(async (req, res) => {
  res.status(201).json(await service.addSkill(req.params.vacancyId, req.user!.sub, req.body));
});

export const removeSkill = h(async (req, res) => {
  await service.removeSkill(req.params.vacancyId, req.params.skillId, req.user!.sub);
  res.status(204).send();
});

export const getApplications = h(async (req, res) => {
  res.json(await service.getApplications(req.params.vacancyId, req.user!.sub));
});

export const getEmployerVacancies = h(async (req, res) => {
  const page = req.query.page ? parseInt(req.query.page as string) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
  res.json(await service.findByEmployer(req.user!.sub, page, limit));
});
