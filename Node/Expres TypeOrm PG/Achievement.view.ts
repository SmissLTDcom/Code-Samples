import { Router } from "express";
import { UserType } from "../entities";
import { Authenticate, HasOneOfRoles } from "../middlewares";
import { AchievementRepository } from "../repositories";
import { NextErrorHandler } from "../types";
import { ValidationError } from "../utils";

export const AchievementRouter = Router();

AchievementRouter.use(Authenticate);
AchievementRouter.use(HasOneOfRoles([UserType.SUPERADMIN, UserType.ADMIN]));

AchievementRouter.get("/", async (req, res) => {
  const {
    query: { search },
    user: { tenant },
  } = req;
  const achievements = await AchievementRepository.findAllAchievements(
    tenant,
    String(search)
  );
  res.send(achievements);
});

AchievementRouter.get("/:id", async (req, res) => {
  const achievement = await AchievementRepository.findAchievementById(
    req.params.id
  );
  res.send(achievement);
});

AchievementRouter.post("/", (req, res, next) => {
  AchievementRepository.createFromBody(req.body, req.user)
    .then((instance) => res.status(201).send(instance))
    .catch((error) => ValidationError(next, error));
});

AchievementRouter.post("/:id/upload-image", (req, res, next) => {
  const image = req.files.find((file) => file.fieldname == "image");
  if (!image)
    return next({ code: 400, error: { message: "image is required field" } });
  AchievementRepository.uploadImage(image, req.params.id)
    .then((instance) => res.send(instance))
    .catch(next);
});

AchievementRouter.put("/:id", (req, res, next: NextErrorHandler) => {
  AchievementRepository.updateFromBody(req.body, req.params.id)
    .then((instance) => res.send(instance))
    .catch(next);
});

AchievementRouter.delete("/:id", (req, res, next: NextErrorHandler) => {
  AchievementRepository.deleteInstance(req.params.id)
    .then((_) => res.status(204).send())
    .catch((_) => next({ code: 404, error: { message: "Not found" } }));
});
