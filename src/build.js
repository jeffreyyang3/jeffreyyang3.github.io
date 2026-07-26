import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { Eta } from "eta";

import {
  projectRoot as defaultProjectRoot,
  readResume,
  validateResume
} from "./validator.js";

const sourceDirectory = dirname(fileURLToPath(import.meta.url));
const eta = new Eta({ autoEscape: true });

function dataUri(path, mimeType) {
  return `data:${mimeType};base64,${readFileSync(path).toString("base64")}`;
}

function load98Css(rootDirectory) {
  const packageDirectory = resolve(rootDirectory, "node_modules/98.css/dist");
  let css = readFileSync(resolve(packageDirectory, "98.css"), "utf8");

  const fonts = [
    ["ms_sans_serif.woff", "font/woff"],
    ["ms_sans_serif.woff2", "font/woff2"],
    ["ms_sans_serif_bold.woff", "font/woff"],
    ["ms_sans_serif_bold.woff2", "font/woff2"]
  ];

  for (const [filename, mimeType] of fonts) {
    css = css.replaceAll(
      `url(${filename})`,
      `url("${dataUri(resolve(packageDirectory, filename), mimeType)}")`
    );
  }

  return css.replace(/\/\*# sourceMappingURL=.*?\*\//u, "");
}

export function formatYearMonth(value) {
  const [year, month] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

export function renderSite({
  resume,
  rootDirectory = defaultProjectRoot,
  template = readFileSync(resolve(sourceDirectory, "resume.eta"), "utf8")
}) {
  const frameworkCss = load98Css(rootDirectory);
  const customCss = readFileSync(resolve(sourceDirectory, "styles.css"), "utf8");
  const phoneUri = `+1${resume.contact.phone.replaceAll("-", "")}`;
  const render = (htmlSizeKiB) =>
    `${eta.renderString(template, {
      resume,
      css: `${frameworkCss}\n${customCss}`,
      phoneUri,
      formatYearMonth,
      htmlSizeKiB
    }).trimEnd()}\n`;

  let htmlSizeKiB = "0.0";

  for (let pass = 0; pass < 20; pass += 1) {
    const html = render(htmlSizeKiB);
    const measuredHtmlSize = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);

    if (measuredHtmlSize === htmlSizeKiB) {
      return html;
    }

    htmlSizeKiB = measuredHtmlSize;
  }

  throw new Error("HTML size label did not converge");
}

export function buildSite({
  rootDirectory = defaultProjectRoot,
  outputDirectory = resolve(rootDirectory, "dist"),
  resume = readResume(rootDirectory)
} = {}) {
  validateResume(resume, { rootDirectory });

  const html = renderSite({ resume, rootDirectory });
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(resolve(outputDirectory, "index.html"), html, "utf8");
  copyFileSync(
    resolve(rootDirectory, resume.download.path),
    resolve(outputDirectory, resume.download.path)
  );

  return { html, outputDirectory };
}

const isDirectInvocation =
  process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectInvocation) {
  try {
    const result = buildSite();
    console.log(`Built ${resolve(result.outputDirectory, "index.html")}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
