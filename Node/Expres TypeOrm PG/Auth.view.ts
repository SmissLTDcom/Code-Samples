import { Request, Response, Router } from "express";
import { OAuth2Client } from "google-auth-library";
import momenttz from "moment-timezone";
import { AsyncErrorsCatcher, Authenticate } from "../middlewares";
import {
  AccessTokenRepository,
  PassResetTokenRepository,
} from "../repositories";
import { AuthService } from "../services/Auth.service";
import { GenericHttpError, NextErrorHandler } from "../types";
import { ValidationError } from "../utils";
import {
  ChangePasswordValidator,
  ForgotPasswordValidator,
  SignInValidator,
  SignUpValidator,
  Validate,
} from "../utils/validators";
import { verifyTelegramInfo } from "../utils/verifyTelegramInfo";

export const AuthRouter = Router();

AuthRouter.get("/timezones", (_, res) =>
  res.send({ timezones: momenttz.tz.names() })
);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
AuthRouter.get("/sentry-test", () => sentryError());
AuthRouter.get("/test-sentry", () => {
  throw new Error(`Error from NODE JS ${Date.now()}`);
});

AuthRouter.post("/login", AsyncErrorsCatcher(login));
AuthRouter.post("/registration", AsyncErrorsCatcher(registration));
AuthRouter.post("/login/google", AsyncErrorsCatcher(googleLogin));
AuthRouter.post("/login/telegram", AsyncErrorsCatcher(telegramLogin));
AuthRouter.post("/forgot-password", AsyncErrorsCatcher(forgotPassword));
AuthRouter.post(
  "/change-password/:passResetToken",
  AsyncErrorsCatcher(confirmPasswordReset)
);
AuthRouter.get(
  "/change-password/:passResetToken/validate",
  AsyncErrorsCatcher(validatePasswordResetToken)
);
AuthRouter.use(Authenticate);
AuthRouter.post("/logout", logout);
AuthRouter.post("/change-password", changePassword);
AuthRouter.post("/set-password", AsyncErrorsCatcher(setPassword));
AuthRouter.get(
  "/pass-reset-token-date/:userId",
  AsyncErrorsCatcher(getUserPassResetTokenDate)
);

async function login(req: Request, res: Response, next: NextErrorHandler) {
  const { body } = req;
  try {
    await Validate(body, SignInValidator);
  } catch (error) {
    return ValidationError(next, error);
  }
  const user = await AuthService.loginUser(body.email, body.password);
  if (user) {
    if (!user.isActive) {
      return next({ code: 401, error: { message: "User deactivated" } });
    } else {
      res.send(user);
    }
  } else {
    next({ code: 401, error: { message: "Authorization failed" } });
  }
}

async function registration(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  const { body } = req;
  try {
    await Validate(body, SignUpValidator);
    const { email, tenant_name, timezone, password } = body;
    const user = await AuthService.registerUser(
      email,
      tenant_name,
      timezone,
      password
    );
    res.send(user);
  } catch (error) {
    next({ code: 400, error: { message: "Validation failed", error: error } });
  }
}

async function googleLogin(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  const { body } = req;
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: body.token_id,
    audience: process.env.GOOGLE_ID || "",
  });
  const payload = ticket.getPayload();
  if (!payload?.email)
    return next({ code: 401, error: { message: "Payload is required" } });
  const user = await AuthService.getUserByEmail(payload.email);
  if (user) {
    const authenticatedUser = await AuthService.authenticateUser(user);
    res.send(authenticatedUser);
  } else {
    next({
      code: 401,
      error: { message: "No users associated with this google account" },
    });
  }
}

async function telegramLogin(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  const { body } = req;

  if (!verifyTelegramInfo(body)) {
    next({ code: 401, error: { message: "Hash is not verified!" } });
  }

  const user = await AuthService.getUserByTelegramId(body.id);

  if (user) {
    const authenticatedUser = await AuthService.authenticateUser(user);
    res.send(authenticatedUser);
  } else {
    next({
      code: 401,
      error: { message: "No users associated with this telegram account" },
    });
  }
}

async function forgotPassword(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  try {
    await Validate(req.body, ForgotPasswordValidator);
  } catch (error) {
    return ValidationError(next, error);
  }
  try {
    await PassResetTokenRepository.createResetPassToken(req.body);
    res.status(201).send();
  } catch (error) {
    next(error as Error | GenericHttpError);
  }
}

async function setPassword(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  AuthService.setPassword(req.user, req.body)
    .then((resp) => res.send(resp))
    .catch(next);
}

async function changePassword(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  AuthService.changePassword(req.user, req.body)
    .then((resp) => res.send(resp))
    .catch(next);
}

async function validatePasswordResetToken(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  PassResetTokenRepository.validateToken(req.params.passResetToken)
    .then(() => res.send())
    .catch(next);
}

async function confirmPasswordReset(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  try {
    await Validate(req.body, ChangePasswordValidator);
  } catch (error) {
    return ValidationError(next, error);
  }
  try {
    const user = await PassResetTokenRepository.changePassFromBody(
      req.body,
      req.params.passResetToken
    );
    res.send(user);
  } catch (error) {
    next(error as Error | GenericHttpError);
  }
}

async function getUserPassResetTokenDate(
  req: Request,
  res: Response,
  next: NextErrorHandler
) {
  try {
    const result: Date | undefined =
      await PassResetTokenRepository.getUserPassResetTokenDate(
        Number(req.params.userId)
      );
    res.send({ userPassResetTokenDate: result });
  } catch (error) {
    next(error as Error | GenericHttpError);
  }
}

function logout(req: Request, res: Response, next: NextErrorHandler) {
  const token = req.headers.authorization!.split("Access-Token ")[1];
  AccessTokenRepository.delete({ token })
    .then((_) => res.send(204))
    .catch((error) => ValidationError(next, error));
}
