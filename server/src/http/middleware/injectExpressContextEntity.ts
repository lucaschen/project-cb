import type { RequestHandler } from "express";

import ExpressContextEntity from "~src/entities/ExpressContextEntity/ExpressContextEntity";

const injectExpressContextEntity: RequestHandler = async (req, res, next) => {
  req.context = await ExpressContextEntity.create({ req, res });

  return next();
};

export default injectExpressContextEntity;
