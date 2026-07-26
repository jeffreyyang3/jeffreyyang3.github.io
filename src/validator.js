import { readFileSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
export const projectRoot = resolve(sourceDirectory, "..");
const schemaPath = resolve(projectRoot, "schema/resume.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf8"));

const ajv = new Ajv2020({
  allErrors: true,
  strict: true,
});

addFormats(ajv);
ajv.addFormat("year-month", /^(?:19|20|21)\d{2}-(?:0[1-9]|1[0-2])$/);

const validateSchema = ajv.compile(schema);

export class ResumeValidationError extends Error {
  constructor(issues) {
    super(
      `Resume validation failed:\n${issues.map((issue) => `- ${issue}`).join("\n")}`,
    );
    this.name = "ResumeValidationError";
    this.issues = issues;
  }
}

function collectIds(resume) {
  return [
    ...resume.contact.profiles.map(({ id }) => id),
    ...resume.experience.map(({ id }) => id),
    ...resume.education.map(({ id }) => id),
  ];
}

export function readResume(rootDirectory = projectRoot) {
  return JSON.parse(
    readFileSync(resolve(rootDirectory, "resume.json"), "utf8"),
  );
}

export function validateResume(
  resume,
  { rootDirectory = projectRoot, checkDownloads = true } = {},
) {
  const issues = [];

  if (!validateSchema(resume)) {
    issues.push(
      ...validateSchema.errors.map((error) => {
        const location = error.instancePath || "/";
        return `${location} ${error.message}`;
      }),
    );
  }

  if (issues.length === 0) {
    const ids = collectIds(resume);
    const duplicateIds = [
      ...new Set(ids.filter((id, index) => ids.indexOf(id) !== index)),
    ];

    if (duplicateIds.length > 0) {
      issues.push(`duplicate IDs: ${duplicateIds.join(", ")}`);
    }

    for (const role of resume.experience) {
      if (role.endDate !== null && role.endDate < role.startDate) {
        issues.push(`${role.id} ends before it starts`);
      }

      if (
        role.promotedAt &&
        (role.promotedAt < role.startDate ||
          (role.endDate !== null && role.promotedAt > role.endDate))
      ) {
        issues.push(
          `${role.id} promotion date is outside its employment dates`,
        );
      }
    }

    if (checkDownloads) {
      const downloadPath = resolve(rootDirectory, resume.download.path);

      try {
        if (!statSync(downloadPath).isFile()) {
          issues.push(`download is not a file: ${resume.download.path}`);
        }
      } catch {
        issues.push(`download does not exist: ${resume.download.path}`);
      }
    }
  }

  if (issues.length > 0) {
    throw new ResumeValidationError(issues);
  }

  return resume;
}
