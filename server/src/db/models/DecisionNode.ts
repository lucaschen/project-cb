import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
  Sequelize,
} from "sequelize";

import { ComparisonOperation } from "~sharedTypes/enums";

export class DecisionNode extends Model<
  InferAttributes<DecisionNode>,
  InferCreationAttributes<DecisionNode>
> {
  declare id: string;
  declare name: string;
  declare flowId: string;
  declare targetValue: string | null;
  declare operation: ComparisonOperation;
  declare comparisonValue: string | null;
  declare x: number;
  declare y: number;

  static initModel(sequelize: Sequelize) {
    DecisionNode.init(
      {
        id: { type: DataTypes.STRING, primaryKey: true },
        name: { type: DataTypes.STRING, allowNull: false },
        flowId: { type: DataTypes.STRING, allowNull: false },
        targetValue: { type: DataTypes.STRING, allowNull: true },
        operation: {
          type: DataTypes.ENUM(...Object.values(ComparisonOperation)),
          allowNull: false,
        },
        comparisonValue: { type: DataTypes.STRING, allowNull: true },
        x: { type: DataTypes.FLOAT, allowNull: false },
        y: { type: DataTypes.FLOAT, allowNull: false },
      },
      {
        sequelize,
        tableName: "decisionNodes",
        indexes: [{ fields: ["flowId"] }],
      }
    );
    return DecisionNode;
  }
}
