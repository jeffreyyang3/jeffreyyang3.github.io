import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

import { parse } from "parse5";

import { buildSite, renderSite } from "../src/build.js";
import {
  projectRoot,
  readResume,
  ResumeValidationError,
  validateResume
} from "../src/validator.js";

const resume = readResume();

function clone(value) {
  return structuredClone(value);
}

function elements(root) {
  const result = [];

  function visit(node) {
    if (node.tagName) {
      result.push(node);
    }

    for (const child of node.childNodes ?? []) {
      visit(child);
    }
  }

  visit(root);
  return result;
}

function attribute(element, name) {
  return element.attrs?.find((item) => item.name === name)?.value;
}

function hasAttribute(element, name) {
  return element.attrs?.some((item) => item.name === name) ?? false;
}

function classes(element) {
  return (attribute(element, "class") ?? "").split(/\s+/u).filter(Boolean);
}

function textContent(node) {
  if (node.nodeName === "#text") {
    return node.value;
  }

  return (node.childNodes ?? []).map(textContent).join("");
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function expectInvalid(mutator, expectedMessage) {
  const candidate = clone(resume);
  mutator(candidate);

  assert.throws(
    () => validateResume(candidate, { checkDownloads: false }),
    (error) =>
      error instanceof ResumeValidationError &&
      expectedMessage.test(error.message)
  );
}

test("canonical resume validates and preserves the source facts", () => {
  assert.equal(validateResume(resume), resume);
  assert.equal(resume.summary, "Senior software engineer with 5+ years of full-stack experience across consumer and enterprise products.");
  assert.deepEqual(
    resume.experience.map(({ company, title, startDate, endDate }) => ({
      company,
      title,
      startDate,
      endDate
    })),
    [
      {
        company: "Celonis",
        title: "Senior Software Engineer",
        startDate: "2023-01",
        endDate: null
      },
      {
        company: "Opendoor",
        title: "Software Engineer",
        startDate: "2022-03",
        endDate: "2022-11"
      },
      {
        company: "Poshmark",
        title: "Software Engineer",
        startDate: "2021-01",
        endDate: "2022-02"
      }
    ]
  );
  assert.equal(resume.experience[0].promotedAt, "2025-10");
  assert.deepEqual(resume.experience.map(({ highlights }) => highlights.length), [8, 5, 4]);
  assert.deepEqual(resume.education, [
    {
      id: "uc-santa-cruz",
      institution: "University of California, Santa Cruz",
      degree: "B.S. Computer Science",
      graduationYear: 2020,
      location: "Santa Cruz, CA"
    }
  ]);
});

test("schema rejects missing, unknown, and malformed data", () => {
  expectInvalid((candidate) => {
    delete candidate.summary;
  }, /must have required property 'summary'/u);

  expectInvalid((candidate) => {
    candidate.unexpected = true;
  }, /must NOT have additional properties/u);

  expectInvalid((candidate) => {
    candidate.experience[0].unexpected = true;
  }, /must NOT have additional properties/u);

  expectInvalid((candidate) => {
    candidate.experience[0].startDate = "Jan 2023";
  }, /year-month/u);

  expectInvalid((candidate) => {
    candidate.experience[0].startDate = "2023-13";
  }, /year-month/u);

  expectInvalid((candidate) => {
    candidate.contact.email = "not-an-email";
  }, /email/u);

  expectInvalid((candidate) => {
    candidate.contact.profiles[0].url = "not a URL";
  }, /uri/u);
});

test("custom validation rejects duplicate IDs and impossible chronology", () => {
  expectInvalid((candidate) => {
    candidate.education[0].id = candidate.experience[0].id;
  }, /duplicate IDs: celonis/u);

  expectInvalid((candidate) => {
    candidate.experience[1].endDate = "2022-01";
  }, /opendoor ends before it starts/u);

  expectInvalid((candidate) => {
    candidate.experience[1].promotedAt = "2023-01";
  }, /promotion date is outside/u);
});

test("validation rejects a missing PDF", () => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "resume-validation-"));

  try {
    assert.throws(
      () => validateResume(resume, { rootDirectory: temporaryRoot }),
      /download does not exist/u
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("invalid input fails before the output directory is created", () => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "resume-invalid-build-"));
  const outputDirectory = resolve(temporaryRoot, "not-created");
  const candidate = clone(resume);
  delete candidate.summary;

  try {
    assert.throws(
      () => buildSite({ resume: candidate, outputDirectory }),
      ResumeValidationError
    );
    assert.equal(existsSync(outputDirectory), false);
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("build is deterministic and copies the PDF unchanged", () => {
  const temporaryRoot = mkdtempSync(join(tmpdir(), "resume-build-"));
  const first = resolve(temporaryRoot, "first");
  const second = resolve(temporaryRoot, "second");

  try {
    buildSite({ outputDirectory: first });
    buildSite({ outputDirectory: second });

    assert.equal(
      readFileSync(resolve(first, "index.html"), "utf8"),
      readFileSync(resolve(second, "index.html"), "utf8")
    );
    assert.equal(
      sha256(resolve(projectRoot, resume.download.path)),
      sha256(resolve(first, resume.download.path))
    );
    assert.equal(
      sha256(resolve(first, resume.download.path)),
      sha256(resolve(second, resume.download.path))
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("generated HTML has the required semantic structure and links", () => {
  const html = renderSite({ resume });
  const document = parse(html);
  const nodes = elements(document);

  assert.equal(
    nodes.filter((element) => classes(element).includes("window")).length,
    1
  );

  const titleBar = nodes.find((element) =>
    classes(element).includes("app-title-bar")
  );
  const titleBarControls = elements(titleBar).find((element) =>
    classes(element).includes("dummy-window-controls")
  );
  const titleBarButtons = elements(titleBarControls).filter(
    (element) => element.tagName === "button"
  );
  assert.equal(attribute(titleBarControls, "aria-hidden"), "true");
  assert.deepEqual(
    titleBarButtons.map((button) => attribute(button, "aria-label")),
    ["Minimize", "Maximize", "Close"]
  );
  for (const button of titleBarButtons) {
    assert.equal(attribute(button, "type"), "button");
    assert.equal(attribute(button, "tabindex"), "-1");
  }

  for (const tagName of [
    "main",
    "header",
    "address",
    "article",
    "section",
    "time"
  ]) {
    assert.ok(nodes.some((element) => element.tagName === tagName), `missing <${tagName}>`);
  }

  const summarySection = nodes.find(
    (element) => attribute(element, "id") === "summary"
  );
  assert.equal(attribute(summarySection, "aria-label"), "Summary");
  assert.equal(
    elements(summarySection).filter((element) => element.tagName === "h2").length,
    0
  );

  const links = nodes.filter((element) => element.tagName === "a");
  assert.ok(
    links.some(
      (link) =>
        attribute(link, "href") === "mailto:jeffreydavidyang@gmail.com"
    )
  );
  assert.ok(
    links.some((link) => attribute(link, "href") === "tel:+16268182618")
  );
  assert.ok(
    links.some(
      (link) =>
        attribute(link, "href") === "https://github.com/jeffreyyang3"
    )
  );
  assert.ok(
    links.some(
      (link) =>
        attribute(link, "href") ===
        "https://www.linkedin.com/in/jeffreyyang3"
    )
  );
  assert.ok(
    links.some(
      (link) =>
        attribute(link, "href") === "https://jdan.github.io/98.css/" &&
        textContent(link) === "98.css"
    )
  );
  const externalLinks = links.filter((link) =>
    /^https:\/\//u.test(attribute(link, "href") ?? "")
  );
  assert.ok(externalLinks.length > 0);
  for (const link of externalLinks) {
    assert.equal(attribute(link, "target"), "_blank");
    assert.equal(attribute(link, "rel"), "noopener noreferrer");
  }

  const pdfLink = links.find(
    (link) => attribute(link, "href") === resume.download.path
  );
  assert.ok(pdfLink);
  assert.ok(hasAttribute(pdfLink, "download"));
  assert.equal(attribute(pdfLink, "download"), resume.download.path);
  assert.equal(attribute(pdfLink, "type"), "application/pdf");
  assert.equal(textContent(pdfLink), "Download Resume");
  assert.equal(hasAttribute(pdfLink, "target"), false);
  assert.doesNotMatch(html, /r\u00e9sum\u00e9/iu);
});

test("resume uses one flat window surface with a solid desktop", () => {
  const html = renderSite({ resume });
  const document = parse(html);
  const nodes = elements(document);
  const resumeDocument = nodes.find((element) =>
    classes(element).includes("resume-document")
  );
  const documentNodes = elements(resumeDocument);

  assert.ok(classes(resumeDocument).includes("resume-document"));
  assert.equal(nodes.filter((element) => element.tagName === "aside").length, 0);
  assert.equal(nodes.filter((element) => element.tagName === "nav").length, 0);
  assert.equal(nodes.filter((element) => element.tagName === "button").length, 3);
  assert.equal(nodes.filter((element) => element.tagName === "script").length, 0);
  assert.ok(
    documentNodes.some(
      (element) =>
        element.tagName === "header" && classes(element).includes("resume-heading")
    )
  );
  assert.ok(
    documentNodes.some(
      (element) =>
        element.tagName === "article" && classes(element).includes("resume-article")
    )
  );

  const css = nodes
    .filter((element) => element.tagName === "style")
    .map(textContent)
    .join("\n");
  const headingRules = css.match(/\.resume-heading\s*\{([^}]*)\}/u)?.[1] ?? "";
  const articleRules = css.match(/\.resume-article\s*\{([^}]*)\}/u)?.[1] ?? "";
  const documentRules = css.match(/\.resume-document\s*\{([^}]*)\}/u)?.[1] ?? "";
  const bodyRules = [...css.matchAll(/body\s*\{([^}]*)\}/gu)]
    .map((match) => match[1])
    .join("\n");

  assert.doesNotMatch(headingRules, /background|box-shadow/u);
  assert.doesNotMatch(articleRules, /background|box-shadow/u);
  assert.match(
    documentRules,
    /font-family: Arial, Helvetica, sans-serif;/u
  );
  assert.doesNotMatch(articleRules, /font-family/u);
  const nameRules =
    css.match(/\.resume-heading h1\s*\{([^}]*)\}/u)?.[1] ?? "";
  const sectionHeadingRules =
    css.match(/\.resume-article h2\s*\{([^}]*)\}/u)?.[1] ?? "";
  const downloadRules =
    css.match(/\.download-link\s*\{([^}]*)\}/u)?.[1] ?? "";
  const statusRules = [...css.matchAll(/\.status-bar\s*\{([^}]*)\}/gu)]
    .map((match) => match[1])
    .join("\n");
  const statusCreditRules =
    css.match(/\.status-bar-field:last-child\s*\{([^}]*)\}/u)?.[1] ?? "";
  assert.match(
    nameRules,
    /font-family: Arial, Helvetica, sans-serif;/u
  );
  assert.match(nameRules, /margin: 6px 0 8px;/u);
  assert.doesNotMatch(sectionHeadingRules, /Pixelated MS Sans Serif/u);
  assert.match(
    downloadRules,
    /font-family: "Pixelated MS Sans Serif", Arial, sans-serif;/u
  );
  assert.match(
    statusRules,
    /font-family: "Pixelated MS Sans Serif", Arial, sans-serif;/u
  );
  assert.match(statusCreditRules, /text-align: right;/u);
  assert.match(
    css,
    /\.dummy-window-controls\s*\{\s*pointer-events: none;\s*\}/u
  );
  assert.match(bodyRules, /background: #008080;/u);
  assert.match(bodyRules, /font-size: 13px;/u);
  assert.doesNotMatch(bodyRules, /gradient|background-image/u);
  for (const expectedSize of [
    "font-size: 12px",
    "font-size: 13px",
    "font-size: 14px",
    "font-size: 15px",
    "font-size: 17px",
    "font-size: 18px",
    "font-size: 21px",
    "font-size: clamp(29px, calc(5vw + 1px), 45px)"
  ]) {
    assert.ok(css.includes(expectedSize), `missing ${expectedSize}`);
  }
  assert.doesNotMatch(
    `${html}\n${css}`,
    /resume-explorer|explorer-toggle|resume-workspace|Hide summary|Show summary/u
  );
});

test("all JSON-derived text is escaped by the template", () => {
  const candidate = clone(resume);
  candidate.summary = `<script>alert("unsafe")</script> & "quoted"`;
  const html = renderSite({ resume: candidate });
  const document = parse(html);
  const scripts = elements(document).filter((element) => element.tagName === "script");

  assert.equal(scripts.length, 0);
  assert.doesNotMatch(html, /<script>alert\("unsafe"\)<\/script>/u);
  assert.match(
    html,
    /&lt;script&gt;alert\(&quot;unsafe&quot;\)&lt;\/script&gt; &amp; &quot;quoted&quot;/u
  );
});

test("page has no runtime network dependencies", () => {
  const html = renderSite({ resume });
  const document = parse(html);
  const nodes = elements(document);

  assert.equal(nodes.filter((element) => element.tagName === "link").length, 0);
  assert.equal(
    nodes.filter(
      (element) => element.tagName === "script" && attribute(element, "src")
    ).length,
    0
  );
  assert.equal(
    nodes.filter(
      (element) =>
        ["img", "iframe", "audio", "video", "source"].includes(element.tagName) &&
        attribute(element, "src")
    ).length,
    0
  );

  const css = nodes
    .filter((element) => element.tagName === "style")
    .map(textContent)
    .join("\n");

  assert.doesNotMatch(css, /@import/u);
  assert.doesNotMatch(css, /sourceMappingURL/u);
  assert.doesNotMatch(css, /url\(\s*["']?https?:/u);
  assert.doesNotMatch(css, /url\(\s*["']?ms_sans_serif/u);
  assert.match(css, /data:font\/woff;base64,/u);
  assert.match(css, /data:font\/woff2;base64,/u);
});

test("status reports the final UTF-8 HTML size", () => {
  const html = renderSite({ resume });
  const displayedSize = html.match(/HTML: (\d+\.\d) KiB/u)?.[1];
  const actualSize = (Buffer.byteLength(html, "utf8") / 1024).toFixed(1);

  assert.equal(displayedSize, actualSize);
  assert.doesNotMatch(html, /Gzip:/u);
  assert.match(
    html,
    /<p class="status-bar-field">Made with <a href="https:\/\/jdan\.github\.io\/98\.css\/" target="_blank" rel="noopener noreferrer">98\.css<\/a><\/p>/u
  );
});
