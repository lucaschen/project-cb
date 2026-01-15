import { initModels, Models } from "../models";
import { sequelize } from "../sequelize";
import { seedElementProperties } from "./elementProperties.seed";
import { seedElements } from "./elements.seed";
import { seedFlows } from "./flows.seed";
import { seedOrganizations } from "./organizations.seed";
import { seedUsers } from "./users.seed";

export async function clearDatabase(models: Models) {
  await models.StepElementProperties.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.StepElement.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.ElementProperties.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.Element.destroy({ where: {}, truncate: true, cascade: true });

  await models.Step.destroy({ where: {}, truncate: true, cascade: true });
  await models.DecisionNode.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.DecisionNodeConditions.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.NodeCoordinates.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.Node.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });

  await models.Flow.destroy({ where: {}, truncate: true, cascade: true });

  await models.OrganizationUser.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.OrganizationUserInvitation.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.UserSession.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });
  await models.User.destroy({ where: {}, truncate: true, cascade: true });
  await models.Organization.destroy({
    where: {},
    truncate: true,
    cascade: true,
  });

  console.log("🧹 Database cleared");
}

export async function runSeeds() {
  const models = initModels(sequelize);

  await clearDatabase(models);

  try {
    await sequelize.authenticate();
    console.log("🌱 Connected to DB");

    const env = process.env.NODE_ENV;
    if (env === "development" || env === "test") {
      console.log(
        "⚠️ Running destructive sync with force: true (env:",
        env || "undefined",
        ")"
      );
      await sequelize.sync({ force: true });
    } else {
      console.log(
        "⚠️ Skipping destructive sync; running non-destructive sequelize.sync() because NODE_ENV is",
        env || "undefined"
      );
      await sequelize.sync();
    }

    await seedOrganizations(models);
    await seedUsers(models);
    await seedElements(models);
    await seedElementProperties(models);
    await seedFlows(models);

    console.log("✅ Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed", err);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeeds();
}
