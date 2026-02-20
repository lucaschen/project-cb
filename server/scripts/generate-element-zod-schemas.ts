import fs from "fs";
import path from "path";

import { initModels } from "~db/models";
import { sequelize } from "~db/sequelize";
import { ElementPropertyTypes } from "~sharedTypes/index";

// Function to generate Zod schema for element properties
function generateElementPropertiesSchema(
  properties: Array<{
    id: string;
    elementId: string;
    description: string;
    propertyName: string;
    propertyType: ElementPropertyTypes;
    required: boolean;
    defaultValue: string;
  }>,
): string {
  const propertiesSchema: string[] = [];

  properties.forEach((prop) => {
    let schema: string;

    switch (prop.propertyType) {
      case ElementPropertyTypes.STRING:
        schema = "z.string()";
        break;
      case ElementPropertyTypes.NUMBER:
        schema = "z.number()";
        break;
      case ElementPropertyTypes.BOOLEAN:
        schema = "z.boolean()";
        break;
      case ElementPropertyTypes.ARRAY:
        schema = "z.array(z.unknown())";
        break;
      case ElementPropertyTypes.OBJECT:
        schema = "z.record(z.string(), z.unknown())";
        break;
      default:
        schema = "z.unknown()";
    }

    // Add default value if provided
    if (prop.defaultValue) {
      try {
        const defaultValue = JSON.parse(prop.defaultValue);
        schema = `${schema}.default(${JSON.stringify(defaultValue)})`;
      } catch {
        // If parsing fails, just use the string default
        schema = `${schema}.default(${JSON.stringify(prop.defaultValue)})`;
      }
    }

    // Make required if specified
    if (!prop.required) {
      schema = `${schema}.optional()`;
    }

    propertiesSchema.push(`${prop.propertyName}: ${schema}`);
  });

  return `z.object({${propertiesSchema.join(", ")}})`;
}

// Main function to generate all schemas
async function generateAllSchemas() {
  try {
    // Authenticate with database
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Initialize models
    const models = initModels(sequelize);

    // Fetch all elements
    const elements = await models.Element.findAll();

    // Create output directory
    const outputDir = path.join(
      __dirname,
      "../../packages/shared/src/generated/elements",
    );
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Process each element
    for (const element of elements) {
      // Fetch properties for this element
      const properties = await models.ElementProperties.findAll({
        where: { elementId: element.id },
      });

      // Generate schema for properties
      const propertiesSchema = generateElementPropertiesSchema(
        properties.map((property) => ({
          id: property.id,
          elementId: property.elementId,
          description: property.description,
          propertyName: property.propertyName,
          propertyType: property.propertyType,
          required: property.required,
          defaultValue: property.defaultValue,
        })),
      );

      // Create elementName based on element ID
      const elementName = `${element.id}Element`;
      const propertiesName = `${element.id}ElementProperties`;

      // Generate TypeScript code
      const fileContent = `
import { z } from "zod";

// Schema for the properties of the ${element.name} element
export const ${propertiesName} = ${propertiesSchema};

// Schema for the ${element.name} element
const ${elementName}Schema = z.object({
  id: z.literal("${element.id}"),
  name: z.string(),
  description: z.string(),
  properties: ${propertiesName},
});

// Infer TypeScript types from schemas
export type ${propertiesName}Type = z.infer<typeof ${propertiesName}>;
export type ${elementName}Type = z.infer<typeof ${elementName}Schema>;

// Default export for the ${element.name} element schema
export default ${elementName}Schema;
`;

      // Write to file
      const filePath = path.join(outputDir, `${elementName}.ts`);
      fs.writeFileSync(filePath, fileContent.trim());

      console.log("Generated schema for element:", element.id);
    }

    // Generate index.ts bundling all schemas
    const elementsList = elements.map((element) => `${element.id}Element`);
    const indexContent = `// Bundled exports from generated element Zod schemas

${elementsList.map((elementName) => `export { ${elementName}Type, ${elementName}Properties, ${elementName}PropertiesType } from "./${elementName}";`).join("\n")}

// Discriminated union schema for all element types
import { z } from "zod";

${elementsList.map((elementName) => `import ${elementName}Schema from "./${elementName}";`).join("\n")}

export const elementSchema = z.discriminatedUnion("id", [
  ${elementsList.map((elementName) => `${elementName}Schema`).join(",\n  ")}
]);

export type ElementType = z.infer<typeof elementSchema>;

export {
  ${elementsList.map((elementName) => `${elementName}Schema`).join(",\n  ")}
}
`;
    const indexPath = path.join(outputDir, "index.ts");
    fs.writeFileSync(indexPath, indexContent.trim());

    console.log("Generated index.ts bundling all schemas");
    console.log("All schemas generated successfully!");
  } catch (error) {
    console.error("Error generating schemas:", error);
    process.exit(1);
  }
}

// Run the script
generateAllSchemas();
