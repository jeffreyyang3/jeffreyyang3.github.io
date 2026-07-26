import { readResume, validateResume } from "./validator.js";

try {
  validateResume(readResume());
  console.log("resume.json is valid");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
