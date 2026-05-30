/**
 * Deterministic ATS engine.
 *
 * Everything in this file is pure, reproducible JavaScript — no LLM calls.
 * It gives the agent an objective ground truth (exact keyword overlap,
 * formatting/readability signals, a reproducible ATS score) that the LLM
 * stage is then grounded against. This is what stops the report from being
 * "model-subjective vibes" and makes the keyword analysis trustworthy.
 */

const STOPWORDS = new Set(
  `a an the and or but if then else for to of in on at by with without from into over under
   is are was were be been being am do does did doing have has had having will would shall should
   can could may might must this that these those it its as we you they he she them our your their
   i me my mine ours yours his her hers who whom whose which what when where why how all any both each
   few more most other some such no nor not only own same so than too very just about above below up
   down out off again further once here there also per via etc using use used able across within
   role job position candidate company team work working experience years year strong good great
   plus prefer preferred required requirement requirements responsibility responsibilities ability
   including include includes help helps including ensure ensuring building build builds new`
    .split(/\s+/)
    .filter(Boolean)
);

/**
 * Curated skill lexicon: canonical name -> alias list.
 * Aliases are matched as whole tokens/phrases (case-insensitive) so that
 * "JS", "Javascript" and "ECMAScript" all collapse to "JavaScript", and
 * "k8s" collapses to "Kubernetes". High precision matters more than recall
 * here, because the LLM stage covers the long tail.
 */
const SKILL_LEXICON = {
  JavaScript: ["javascript", "js", "ecmascript", "es6", "es2015"],
  TypeScript: ["typescript", "ts"],
  Python: ["python", "py"],
  Java: ["java"],
  "C++": ["c++", "cpp"],
  "C#": ["c#", "csharp", ".net", "dotnet", "asp.net"],
  Go: ["golang", "go lang"],
  Rust: ["rust"],
  Ruby: ["ruby", "rails", "ruby on rails"],
  PHP: ["php", "laravel"],
  Swift: ["swift"],
  Kotlin: ["kotlin"],
  Scala: ["scala"],
  React: ["react", "react.js", "reactjs"],
  "Next.js": ["next.js", "nextjs", "next js"],
  Angular: ["angular", "angularjs"],
  "Vue.js": ["vue", "vue.js", "vuejs"],
  "Node.js": ["node", "node.js", "nodejs"],
  Express: ["express", "express.js", "expressjs"],
  Django: ["django"],
  Flask: ["flask"],
  FastAPI: ["fastapi", "fast api"],
  Spring: ["spring", "spring boot", "springboot"],
  GraphQL: ["graphql"],
  "REST APIs": ["rest", "restful", "rest api", "rest apis"],
  gRPC: ["grpc"],
  HTML: ["html", "html5"],
  CSS: ["css", "css3"],
  "Tailwind CSS": ["tailwind", "tailwindcss"],
  SQL: ["sql"],
  PostgreSQL: ["postgres", "postgresql", "psql"],
  MySQL: ["mysql"],
  MongoDB: ["mongodb", "mongo"],
  Redis: ["redis"],
  Elasticsearch: ["elasticsearch", "elastic search", "elk"],
  DynamoDB: ["dynamodb", "dynamo"],
  Cassandra: ["cassandra"],
  Snowflake: ["snowflake"],
  AWS: ["aws", "amazon web services", "ec2", "s3", "lambda"],
  Azure: ["azure"],
  GCP: ["gcp", "google cloud", "google cloud platform"],
  Docker: ["docker", "containers", "containerization"],
  Kubernetes: ["kubernetes", "k8s"],
  Terraform: ["terraform"],
  Ansible: ["ansible"],
  Jenkins: ["jenkins"],
  "CI/CD": ["ci/cd", "cicd", "ci cd", "continuous integration", "continuous delivery", "continuous deployment"],
  Git: ["git", "github", "gitlab", "bitbucket", "version control"],
  Linux: ["linux", "unix", "bash", "shell scripting"],
  Kafka: ["kafka"],
  RabbitMQ: ["rabbitmq"],
  Airflow: ["airflow"],
  Spark: ["spark", "pyspark", "apache spark"],
  Hadoop: ["hadoop"],
  "Machine Learning": ["machine learning", "ml", "deep learning", "neural networks"],
  "Data Science": ["data science", "data scientist"],
  TensorFlow: ["tensorflow"],
  PyTorch: ["pytorch", "torch"],
  "scikit-learn": ["scikit-learn", "sklearn", "scikit learn"],
  Pandas: ["pandas"],
  NumPy: ["numpy"],
  NLP: ["nlp", "natural language processing"],
  "Computer Vision": ["computer vision", "cv", "opencv"],
  LLMs: ["llm", "llms", "large language models", "genai", "generative ai"],
  Tableau: ["tableau"],
  "Power BI": ["power bi", "powerbi"],
  Looker: ["looker"],
  dbt: ["dbt"],
  ETL: ["etl", "elt", "data pipelines", "data pipeline"],
  Agile: ["agile", "scrum", "kanban", "sprint", "sprints"],
  Jira: ["jira"],
  Figma: ["figma"],
  Sketch: ["sketch"],
  "Adobe XD": ["adobe xd", "xd"],
  "UI/UX": ["ui/ux", "ux", "ui", "user experience", "user interface"],
  "Product Management": ["product management", "product manager", "roadmap", "roadmaps"],
  "A/B Testing": ["a/b testing", "ab testing", "split testing"],
  SEO: ["seo", "search engine optimization"],
  Microservices: ["microservices", "microservice", "service-oriented"],
  "System Design": ["system design", "distributed systems", "scalability", "high availability"],
  "Object-Oriented": ["oop", "object-oriented", "object oriented"],
  "Test Automation": ["test automation", "selenium", "cypress", "playwright", "jest", "pytest", "junit"],
  TDD: ["tdd", "test-driven", "test driven development"],
  Salesforce: ["salesforce"],
  SAP: ["sap"],
  Excel: ["excel", "spreadsheets"],
  "Project Management": ["project management", "pmp", "stakeholder management"],
  Leadership: ["leadership", "mentoring", "mentorship", "team lead", "tech lead", "people management"],
  Communication: ["communication", "stakeholder", "presentation", "cross-functional"],
  Bash: ["bash", "shell", "zsh", "powershell"],
  ".NET Core": [".net core", "dotnet core"],
  Svelte: ["svelte", "sveltekit"],
  Remix: ["remix"],
  Nuxt: ["nuxt", "nuxt.js"],
  Webpack: ["webpack"],
  Vite: ["vite"],
  Babel: ["babel"],
  Sass: ["sass", "scss"],
  Bootstrap: ["bootstrap"],
  "Material UI": ["material ui", "mui", "material-ui"],
  Redux: ["redux", "redux toolkit"],
  "React Native": ["react native"],
  Flutter: ["flutter", "dart"],
  iOS: ["ios", "swiftui", "uikit", "xcode"],
  Android: ["android", "jetpack compose"],
  Firebase: ["firebase", "firestore"],
  Supabase: ["supabase"],
  Vercel: ["vercel"],
  Netlify: ["netlify"],
  Heroku: ["heroku"],
  Nginx: ["nginx"],
  Prometheus: ["prometheus"],
  Grafana: ["grafana"],
  Datadog: ["datadog"],
  Splunk: ["splunk"],
  Sentry: ["sentry"],
  OAuth: ["oauth", "oauth2", "openid", "sso", "saml"],
  JWT: ["jwt", "json web token"],
  WebSockets: ["websocket", "websockets", "socket.io"],
  OpenAPI: ["openapi", "swagger"],
  Maven: ["maven"],
  Gradle: ["gradle"],
  ".NET": [".net framework"],
  Hibernate: ["hibernate", "jpa"],
  Celery: ["celery"],
  "Vector Databases": ["pinecone", "weaviate", "vector database", "vector db", "pgvector", "chroma"],
  RAG: ["rag", "retrieval augmented generation", "retrieval-augmented"],
  LangChain: ["langchain", "llamaindex"],
  Databricks: ["databricks"],
  BigQuery: ["bigquery"],
  Redshift: ["redshift"],
  Athena: ["athena"],
  Fivetran: ["fivetran", "stitch"],
  "Data Warehousing": ["data warehouse", "data warehousing", "data lake", "lakehouse"],
  "Data Modeling": ["data modeling", "dimensional modeling", "star schema"],
  "Statistical Analysis": ["statistics", "statistical analysis", "regression", "hypothesis testing"],
  "Time Series": ["time series", "forecasting"],
  "Recommendation Systems": ["recommendation", "recommender", "ranking"],
  MLOps: ["mlops", "model deployment", "model serving", "mlflow"],
  "Cloud Architecture": ["cloud architecture", "serverless", "lambda", "well-architected"],
  "Incident Management": ["incident management", "on-call", "oncall", "sre", "site reliability"],
  Observability: ["observability", "monitoring", "logging", "tracing", "telemetry"],
  Cybersecurity: ["security", "cybersecurity", "infosec", "penetration testing", "owasp", "vulnerability"],
  Compliance: ["compliance", "gdpr", "hipaa", "soc 2", "soc2", "pci"],
  "Stakeholder Management": ["stakeholder management", "stakeholder engagement"],
  "Go-to-Market": ["go-to-market", "gtm", "product launch"],
  "User Research": ["user research", "usability", "customer interviews", "user testing"],
  Analytics: ["analytics", "google analytics", "mixpanel", "amplitude", "segment"],
  "Growth": ["growth", "growth hacking", "funnel", "retention", "activation"],
  "Content Strategy": ["content strategy", "copywriting", "content marketing"],
  "Email Marketing": ["email marketing", "mailchimp", "hubspot", "marketo"],
  "Paid Acquisition": ["ppc", "google ads", "facebook ads", "paid acquisition", "sem"],
  Wireframing: ["wireframe", "wireframing", "prototyping", "prototype"],
  "Design Systems": ["design system", "design systems", "component library"],
  Accessibility: ["accessibility", "a11y", "wcag"],
  Photoshop: ["photoshop"],
  Illustrator: ["illustrator"],
  "After Effects": ["after effects", "motion graphics"],
};

// Reverse alias index with a precompiled, boundary-aware regex per alias.
// Boundaries use alphanumeric lookarounds so a trailing period/comma ("AWS.",
// "Docker,") still matches, while intra-token punctuation ("node.js", "c++",
// "ci/cd") is preserved and not split.
function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const ALIAS_INDEX = [];
for (const [canonical, aliases] of Object.entries(SKILL_LEXICON)) {
  for (const alias of aliases) {
    const a = alias.toLowerCase();
    ALIAS_INDEX.push({
      canonical,
      alias: a,
      regex: new RegExp(`(?<![a-z0-9])${escapeRegex(a)}(?![a-z0-9])`, "g"),
    });
  }
}
// Match longer aliases first ("rest api" before "rest").
ALIAS_INDEX.sort((a, b) => b.alias.length - a.alias.length);

const ACTION_VERBS = new Set(
  `led built created designed developed implemented launched delivered drove owned managed
   shipped scaled optimized improved increased reduced cut grew automated architected engineered
   spearheaded established founded migrated refactored streamlined accelerated negotiated mentored
   coordinated analyzed researched produced generated boosted championed pioneered`
    .split(/\s+/)
    .filter(Boolean)
);

function normalizeText(text) {
  return ` ${text.toLowerCase().replace(/[^a-z0-9+#./\-\s]/g, " ").replace(/\s+/g, " ")} `;
}

/**
 * Find which canonical skills from the lexicon appear in a block of text.
 * Returns a Map<canonical, occurrenceCount>.
 */
function detectSkills(text) {
  const haystack = normalizeText(text);
  const found = new Map();
  for (const { canonical, regex } of ALIAS_INDEX) {
    regex.lastIndex = 0;
    const matches = haystack.match(regex);
    if (matches && matches.length) {
      found.set(canonical, (found.get(canonical) || 0) + matches.length);
    }
  }
  return found;
}

/**
 * Generic important-term extraction from the JD as a fallback for skills that
 * aren't in the lexicon (domain words, tools, certifications). We take frequent
 * non-stopword unigrams/bigrams that look meaningful.
 */
function extractSalientTerms(jdText, limit = 25) {
  const words = normalizeText(jdText)
    .split(" ")
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOPWORDS.has(w) && !/^\d+$/.test(w));

  const freq = new Map();
  const bump = (term) => freq.set(term, (freq.get(term) || 0) + 1);

  for (let i = 0; i < words.length; i++) {
    bump(words[i]);
    if (i < words.length - 1 && !STOPWORDS.has(words[i + 1])) {
      bump(`${words[i]} ${words[i + 1]}`);
    }
  }

  return [...freq.entries()]
    .filter(([term, count]) => count >= 2 || term.includes(" "))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([term, count]) => ({ term, count }));
}

function countMatches(text, regex) {
  const m = text.match(regex);
  return m ? m.length : 0;
}

function analyzeFormatting(cvText) {
  const lower = cvText.toLowerCase();
  const words = cvText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const lines = cvText.split(/\n/);
  const nonEmptyLines = lines.filter((l) => l.trim().length > 0);

  const hasEmail = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i.test(cvText);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(cvText);
  const hasLinkedIn = /linkedin\.com|github\.com|gitlab\.com|portfolio|behance|dribbble/i.test(cvText);

  const sectionHeaders = {
    experience: /(work\s+)?experience|employment|professional\s+(background|experience)|career\s+history/i.test(cvText),
    education: /education|academic|qualifications|degree/i.test(cvText),
    skills: /skills|technical\s+skills|competencies|technologies|expertise/i.test(cvText),
    summary: /summary|profile|objective|about\s+me/i.test(cvText),
  };

  const bulletLines = nonEmptyLines.filter((l) => /^\s*([•▪◦‣·*\-–—]|\d+[.)])\s+/.test(l));
  const bulletCount = bulletLines.length;

  const quantifiedBullets = bulletLines.filter((l) =>
    /(\d+\s*%|\$\s*\d|\d[\d,]*\s*(k|m|million|billion|users|customers|hours|days|x)\b|\b\d{2,}\b)/i.test(l)
  ).length;

  const actionVerbBullets = bulletLines.filter((l) => {
    const firstWord = l.replace(/^\s*([•▪◦‣·*\-–—]|\d+[.)])\s*/, "").trim().split(/\s+/)[0] || "";
    return ACTION_VERBS.has(firstWord.toLowerCase());
  }).length;

  const yearsMentioned = countMatches(cvText, /\b(19|20)\d{2}\b/g);

  // Things that genuinely confuse ATS parsers.
  const tableLikeLines = nonEmptyLines.filter((l) => (l.match(/\t/g) || []).length >= 2 || /\s{4,}\S+\s{4,}\S+/.test(l)).length;
  const longParagraphs = nonEmptyLines.filter((l) => l.split(/\s+/).length > 60).length;

  return {
    wordCount,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    sectionHeaders,
    bulletCount,
    quantifiedBullets,
    actionVerbBullets,
    yearsMentioned,
    tableLikeLines,
    longParagraphs,
  };
}

function buildFormatChecks(fmt) {
  const checks = [];
  const add = (id, label, status, detail) => checks.push({ id, label, status, detail });

  add(
    "contact",
    "Contact details parseable",
    fmt.hasEmail && fmt.hasPhone ? "pass" : fmt.hasEmail || fmt.hasPhone ? "warn" : "fail",
    fmt.hasEmail && fmt.hasPhone
      ? "Email and phone detected in plain text."
      : "Missing a plain-text email and/or phone — ATS may fail to capture contact info."
  );

  add(
    "links",
    "Professional links present",
    fmt.hasLinkedIn ? "pass" : "warn",
    fmt.hasLinkedIn ? "LinkedIn/portfolio/GitHub link detected." : "Add a LinkedIn, GitHub or portfolio URL."
  );

  const missingSections = Object.entries(fmt.sectionHeaders)
    .filter(([, present]) => !present)
    .map(([name]) => name);
  add(
    "sections",
    "Standard section headers",
    missingSections.length === 0 ? "pass" : missingSections.length <= 1 ? "warn" : "fail",
    missingSections.length === 0
      ? "Experience, Education, Skills and Summary headers all detected."
      : `Missing or non-standard headers: ${missingSections.join(", ")}. ATS keys off standard headers.`
  );

  add(
    "length",
    "Resume length",
    fmt.wordCount >= 350 && fmt.wordCount <= 1000 ? "pass" : fmt.wordCount < 200 ? "fail" : "warn",
    `${fmt.wordCount} words. Target ~400-800 for most roles (1-2 pages).`
  );

  add(
    "bullets",
    "Bullet-point formatting",
    fmt.bulletCount >= 6 ? "pass" : fmt.bulletCount >= 2 ? "warn" : "fail",
    `${fmt.bulletCount} bullet lines detected. Use concise bullets, not dense paragraphs.`
  );

  const quantRate = fmt.bulletCount ? fmt.quantifiedBullets / fmt.bulletCount : 0;
  add(
    "quantification",
    "Quantified achievements",
    quantRate >= 0.4 ? "pass" : quantRate >= 0.15 ? "warn" : "fail",
    `${fmt.quantifiedBullets}/${fmt.bulletCount} bullets contain metrics. Recruiters look for numbers ($, %, scale).`
  );

  const verbRate = fmt.bulletCount ? fmt.actionVerbBullets / fmt.bulletCount : 0;
  add(
    "actionverbs",
    "Strong action verbs",
    verbRate >= 0.5 ? "pass" : verbRate >= 0.25 ? "warn" : "fail",
    `${fmt.actionVerbBullets}/${fmt.bulletCount} bullets start with a strong action verb.`
  );

  add(
    "dates",
    "Employment dates",
    fmt.yearsMentioned >= 2 ? "pass" : "warn",
    fmt.yearsMentioned >= 2 ? "Dates detected for roles." : "Add clear start/end years for each role."
  );

  add(
    "parsing",
    "ATS-safe layout",
    fmt.tableLikeLines === 0 && fmt.longParagraphs === 0 ? "pass" : "warn",
    fmt.tableLikeLines > 0
      ? "Possible multi-column/table layout detected — these often scramble in ATS parsers."
      : fmt.longParagraphs > 0
        ? "Very long paragraphs detected — break them into bullets."
        : "Layout looks single-column and ATS-friendly."
  );

  return checks;
}

function scoreFromChecks(checks) {
  const weight = { pass: 1, warn: 0.5, fail: 0 };
  const total = checks.reduce((sum, c) => sum + weight[c.status], 0);
  return Math.round((total / checks.length) * 100);
}

/**
 * Split a CV into its "skills list" block(s) and the rest of the document.
 * A keyword that only appears in a skills list is weaker evidence than one
 * that appears in the experience/projects narrative (where it's demonstrated).
 */
function splitSkillsSection(cvText) {
  const lines = cvText.split(/\n/);
  const skillsLines = [];
  const bodyLines = [];
  const skillsHeader = /^\s*(technical\s+skills|core\s+skills|skills|technologies|tech\s+stack|competencies|tools)\b/i;
  const otherHeader = /^\s*(experience|employment|work\s+history|education|projects|certifications|summary|profile|objective|awards|publications|languages|interests)\b/i;

  let inSkills = false;
  for (const line of lines) {
    if (skillsHeader.test(line)) {
      inSkills = true;
      skillsLines.push(line);
      continue;
    }
    if (inSkills && otherHeader.test(line)) inSkills = false;
    (inSkills ? skillsLines : bodyLines).push(line);
  }
  return { skillsSection: skillsLines.join("\n"), body: bodyLines.join("\n") };
}

/**
 * Main entry point. Pure function: same inputs -> same output.
 */
export function runAtsAnalysis(cvText, jdText) {
  const jdSkills = detectSkills(jdText);
  const cvSkills = detectSkills(cvText);
  const { body } = splitSkillsSection(cvText);
  const bodySkills = detectSkills(body);

  // Salient generic terms from the JD that aren't already lexicon skills.
  const salient = extractSalientTerms(jdText);
  const cvNorm = normalizeText(cvText);
  for (const { term, count } of salient) {
    const canonicalAlready = [...jdSkills.keys()].some((k) => k.toLowerCase().includes(term));
    if (canonicalAlready) continue;
    // Promote multi-word salient JD terms to "pseudo-skills" so coverage reflects
    // domain language, not just the tech lexicon.
    if (term.includes(" ") && count >= 2) {
      const display = term.replace(/\b\w/g, (c) => c.toUpperCase());
      if (!jdSkills.has(display)) jdSkills.set(display, count);
      if (cvNorm.includes(` ${term} `) && !cvSkills.has(display)) cvSkills.set(display, 1);
    }
  }

  const keywordTable = [...jdSkills.entries()]
    .map(([keyword, jdCount]) => {
      const cvCount = cvSkills.get(keyword) || 0;
      const matched = cvCount > 0;
      return {
        keyword,
        jdCount,
        cvCount,
        matched,
        importance: jdCount >= 3 ? "high" : jdCount === 2 ? "medium" : "low",
        // "demonstrated" = appears in the experience/projects narrative;
        // "listed" = only found in a skills list; "" = not in CV.
        evidence: matched ? (bodySkills.has(keyword) ? "demonstrated" : "listed") : "",
      };
    })
    .sort((a, b) => {
      if (a.matched !== b.matched) return a.matched ? 1 : -1; // missing first
      return b.jdCount - a.jdCount;
    });

  const matchedKeywords = keywordTable.filter((k) => k.matched).map((k) => k.keyword);
  const missingKeywords = keywordTable.filter((k) => !k.matched).map((k) => k.keyword);

  // Weight keyword coverage by JD importance so missing a 3x-mentioned skill
  // hurts more than missing a 1x mention.
  const totalWeight = keywordTable.reduce((s, k) => s + k.jdCount, 0) || 1;
  const matchedWeight = keywordTable.filter((k) => k.matched).reduce((s, k) => s + k.jdCount, 0);
  const keywordCoverage = Math.round((matchedWeight / totalWeight) * 100);

  const fmt = analyzeFormatting(cvText);
  const formatChecks = buildFormatChecks(fmt);
  const formattingScore = scoreFromChecks(formatChecks);

  // Overall deterministic ATS score: keyword coverage dominates (that's what
  // the ATS literally screens on), formatting is the rest.
  const atsScore = Math.round(keywordCoverage * 0.65 + formattingScore * 0.35);

  return {
    atsScore,
    keywordCoverage,
    formattingScore,
    matchedKeywords,
    missingKeywords,
    keywordTable,
    formatChecks,
    stats: {
      wordCount: fmt.wordCount,
      bulletCount: fmt.bulletCount,
      quantifiedBullets: fmt.quantifiedBullets,
      jdSkillCount: jdSkills.size,
    },
  };
}

export const __testables = { detectSkills, extractSalientTerms, analyzeFormatting, normalizeText, splitSkillsSection };
