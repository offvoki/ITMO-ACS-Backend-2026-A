import { Request, Response, NextFunction } from 'express';
import { VacancyService } from '../services/vacancy.service';
import { AppError } from '../utils/errors';

const service = new VacancyService();

export async function getVacancies(req: Request, res: Response, next: NextFunction) {
  try {
    const integerQuery = (name: string, min: number): number | undefined => {
      const raw = req.query[name];
      if (raw === undefined) return undefined;
      if (typeof raw !== 'string' || !/^\d+$/.test(raw) || Number(raw) < min || !Number.isSafeInteger(Number(raw))) {
        throw new AppError(400, `${name} must be an integer greater than or equal to ${min}`);
      }
      return Number(raw);
    };
    const stringQuery = (name: string): string | undefined => {
      const raw = req.query[name];
      if (raw === undefined) return undefined;
      if (typeof raw !== 'string') throw new AppError(400, `${name} must be a string`);
      return raw;
    };
    const uuidQuery = (name: string): string | undefined => {
      const value = stringQuery(name);
      if (value && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)) {
        throw new AppError(400, `${name} must be a UUID`);
      }
      return value;
    };
    const remote = stringQuery('isRemote');
    if (remote !== undefined && remote !== 'true' && remote !== 'false') {
      throw new AppError(400, 'isRemote must be true or false');
    }
    const skillIds = stringQuery('skillIds')?.split(',').map((id) => id.trim()).filter(Boolean);
    if (skillIds?.some((id) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))) {
      throw new AppError(400, 'skillIds must contain UUIDs');
    }
    res.json(await service.findAll({
      page: integerQuery('page', 1),
      limit: integerQuery('limit', 1),
      search: stringQuery('search'),
      cityId: uuidQuery('cityId'),
      industryId: uuidQuery('industryId'),
      employmentTypeId: uuidQuery('employmentTypeId'),
      salaryMin: integerQuery('salaryMin', 0),
      experienceYearsMax: integerQuery('experienceYearsMax', 0),
      isRemote: remote === undefined ? undefined : remote === 'true',
      skillIds,
    }));
  } catch (err) {
    next(err);
  }
}

export async function getVacancy(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.findOne(req.params.vacancyId));
  } catch (err) {
    next(err);
  }
}

export async function createVacancy(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await service.create(req.user!.sub, req.body));
  } catch (err) {
    next(err);
  }
}

export async function updateVacancy(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.update(req.params.vacancyId, req.user!.sub, req.body));
  } catch (err) {
    next(err);
  }
}

export async function deleteVacancy(req: Request, res: Response, next: NextFunction) {
  try {
    await service.remove(req.params.vacancyId, req.user!.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function addSkill(req: Request, res: Response, next: NextFunction) {
  try {
    res.status(201).json(await service.addSkill(req.params.vacancyId, req.user!.sub, req.body));
  } catch (err) {
    next(err);
  }
}

export async function removeSkill(req: Request, res: Response, next: NextFunction) {
  try {
    await service.removeSkill(req.params.vacancyId, req.params.skillId, req.user!.sub);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getApplications(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await service.getApplications(req.params.vacancyId, req.user!.sub));
  } catch (err) {
    next(err);
  }
}

export async function getEmployerVacancies(req: Request, res: Response, next: NextFunction) {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    res.json(await service.findByEmployer(req.user!.sub, page, limit));
  } catch (err) {
    next(err);
  }
}
