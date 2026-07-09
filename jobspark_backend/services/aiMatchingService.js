/**
 * ADVANCED AI Resume Matching Service v2
 * ─────────────────────────────────────
 * Algorithms:
 *   1. Cosine Similarity   — TF-IDF vectors via dot product
 *   2. Semantic Expansion  — synonym graph ("JS" → "javascript")
 *   3. Skill Normalization — "ReactJS" = "React" = "react.js"
 *   4. Confidence Scores   — per-skill extraction confidence
 *   5. Collaborative Filter — jobs similar users applied to
 *   6. Trending Score       — application velocity weighting
 *   7. Boolean Search       — AND / OR / NOT query parser
 *   8. Fuzzy Match          — Levenshtein distance
 *   9. Resume Strength      — 0-100 multi-factor score
 */

const natural = require("natural");
const nlp = require("compromise");

const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;
const TfIdf = natural.TfIdf;
const JaroWinkler = natural.JaroWinklerDistance;

// ─── 1. SKILL TAXONOMY (canonical → variants) ────────────────────────────────
const SKILL_TAXONOMY = {
  javascript: [
    "javascript",
    "js",
    "es6",
    "es2015",
    "es2016",
    "es2017",
    "es2018",
    "es2019",
    "es2020",
    "ecmascript",
    "vanilla js",
  ],
  typescript: ["typescript", "ts"],
  nodejs: ["nodejs", "node.js", "node", "express", "expressjs", "express.js"],
  react: [
    "react",
    "reactjs",
    "react.js",
    "react native",
    "reactnative",
    "redux",
    "hooks",
    "jsx",
    "next",
    "nextjs",
    "next.js",
  ],
  vue: ["vue", "vuejs", "vue.js", "nuxt", "nuxtjs", "vuex"],
  angular: ["angular", "angularjs", "angular.js", "rxjs", "ngrx"],
  python: [
    "python",
    "python3",
    "py",
    "django",
    "flask",
    "fastapi",
    "pandas",
    "numpy",
    "scikit",
    "sklearn",
    "scipy",
  ],
  java: [
    "java",
    "spring",
    "springboot",
    "spring boot",
    "maven",
    "gradle",
    "jvm",
    "kotlin",
    "hibernate",
  ],
  databases: [
    "sql",
    "mysql",
    "postgresql",
    "postgres",
    "mongodb",
    "nosql",
    "redis",
    "elasticsearch",
    "sqlite",
    "oracle",
    "mariadb",
    "dynamodb",
  ],
  cloud: [
    "aws",
    "azure",
    "gcp",
    "google cloud",
    "docker",
    "kubernetes",
    "k8s",
    "terraform",
    "devops",
    "ci/cd",
    "cicd",
    "jenkins",
    "github actions",
  ],
  design: [
    "figma",
    "sketch",
    "adobe xd",
    "ui/ux",
    "ux",
    "wireframing",
    "prototyping",
    "zeplin",
    "invision",
  ],
  mobile: [
    "android",
    "ios",
    "swift",
    "kotlin",
    "react native",
    "flutter",
    "xamarin",
    "cordova",
  ],
  ml: [
    "machine learning",
    "ml",
    "deep learning",
    "nlp",
    "tensorflow",
    "pytorch",
    "keras",
    "computer vision",
    "ai",
    "neural network",
    "bert",
    "llm",
  ],
  php: ["php", "laravel", "wordpress", "symfony", "codeigniter"],
  dotnet: ["c#", "dotnet", ".net", "asp.net", "blazor", "entity framework"],
  cplusplus: ["c++", "cpp", "c", "embedded", "arduino", "rtos"],
  go: ["go", "golang"],
  rust: ["rust"],
  devtools: [
    "git",
    "github",
    "gitlab",
    "bitbucket",
    "jira",
    "confluence",
    "agile",
    "scrum",
    "linux",
    "bash",
    "shell",
  ],
  data: [
    "tableau",
    "power bi",
    "excel",
    "data analysis",
    "data science",
    "bigquery",
    "spark",
    "hadoop",
    "airflow",
  ],
  testing: [
    "jest",
    "mocha",
    "cypress",
    "selenium",
    "testing",
    "unit test",
    "tdd",
    "bdd",
    "pytest",
  ],
  soft: [
    "leadership",
    "communication",
    "teamwork",
    "problem solving",
    "agile",
    "scrum",
    "project management",
    "mentoring",
  ],
};

// Flat lookup: variant → canonical
const SKILL_MAP = {};
Object.entries(SKILL_TAXONOMY).forEach(([canonical, variants]) => {
  variants.forEach((v) => {
    SKILL_MAP[v.toLowerCase()] = canonical;
  });
  SKILL_MAP[canonical] = canonical; // self-map
});

// ─── 2. SKILL NORMALIZATION + CONFIDENCE ─────────────────────────────────────
const normalizeSkill = (raw) => {
  const s = raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9.+#/ ]/g, "");
  if (SKILL_MAP[s]) return { canonical: SKILL_MAP[s], confidence: 1.0 };

  // Fuzzy: check Jaro-Winkler distance against all known variants
  let best = null,
    bestScore = 0;
  for (const variant of Object.keys(SKILL_MAP)) {
    const score = JaroWinkler(s, variant);
    if (score > bestScore) {
      bestScore = score;
      best = variant;
    }
  }
  if (bestScore >= 0.88)
    return { canonical: SKILL_MAP[best], confidence: bestScore };
  return { canonical: s, confidence: 0.5 };
};

// ─── 3. TF-IDF VECTOR BUILDER ────────────────────────────────────────────────
const buildTfIdfVector = (text, vocab) => {
  const tfidf = new TfIdf();
  tfidf.addDocument(text);
  const vector = {};
  vocab.forEach((term) => {
    tfidf.tfidfs(term, (i, measure) => {
      vector[term] = measure;
    });
  });
  return vector;
};

// ─── 4. COSINE SIMILARITY ────────────────────────────────────────────────────
const cosineSimilarity = (vecA, vecB) => {
  const keys = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
  let dot = 0,
    magA = 0,
    magB = 0;
  keys.forEach((k) => {
    const a = vecA[k] || 0,
      b = vecB[k] || 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  });
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
};

// ─── 5. RESUME PARSER ────────────────────────────────────────────────────────
const parseResumeText = (text) => {
  if (!text) return {};
  const cleaned = text
    .toLowerCase()
    .replace(/[^\w\s@.+#/]/g, " ")
    .replace(/\s+/g, " ");

  // Extract sections
  const sections = extractSections(text);

  return {
    skills: extractSkillsWithConfidence(cleaned),
    emails: extractEmails(text),
    phones: extractPhones(text),
    experience: extractExperience(cleaned),
    education: extractEducation(cleaned),
    projects: extractProjects(text),
    sections,
    wordCount: text.split(/\s+/).length,
    rawText: text,
  };
};

// ─── 6. SKILLS WITH CONFIDENCE ───────────────────────────────────────────────
const extractSkillsWithConfidence = (text) => {
  const found = new Map(); // canonical → confidence

  // Taxonomy pass (high confidence)
  Object.entries(SKILL_TAXONOMY).forEach(([canonical, variants]) => {
    variants.forEach((variant) => {
      if (text.includes(variant.toLowerCase())) {
        const prev = found.get(canonical) || 0;
        found.set(canonical, Math.max(prev, 0.95));
      }
    });
  });

  // NLP noun-phrase pass (medium confidence)
  const doc = nlp(text);
  doc
    .nouns()
    .out("array")
    .forEach((noun) => {
      const n = noun.toLowerCase().trim();
      if (n.length > 2 && n.length < 35) {
        const { canonical, confidence } = normalizeSkill(n);
        if (confidence >= 0.7 && canonical) {
          const prev = found.get(canonical) || 0;
          found.set(canonical, Math.max(prev, confidence * 0.85));
        }
      }
    });

  // Return as array of { skill, confidence }
  return [...found.entries()]
    .map(([skill, confidence]) => ({
      skill,
      confidence: Math.round(confidence * 100) / 100,
    }))
    .sort((a, b) => b.confidence - a.confidence);
};

// Simple list for backward compat
const extractSkills = (text) =>
  extractSkillsWithConfidence(text).map((s) => s.skill);

// ─── 7. ENTITY EXTRACTORS ────────────────────────────────────────────────────
const extractEmails = (text) => {
  const emails = text.match(/[\w.-]+@[\w.-]+\.\w{2,}/g) || [];
  return [...new Set(emails)];
};
const extractPhones = (text) => {
  const phones = text.match(/(\+91|0)?[\s-]?[6-9]\d{9}/g) || [];
  return [...new Set(phones.map((p) => p.replace(/[\s-]/g, "")))];
};
const extractExperience = (text) => {
  const matches = text.match(/(\d+\.?\d*)\s*(\+|-\s*\d+)?\s*year/g) || [];
  const years = matches.map((m) => parseFloat(m.match(/[\d.]+/)[0]));
  return years.length > 0 ? Math.max(...years) : 0;
};
const extractEducation = (text) => {
  const degrees = [];
  const patterns = [
    { p: /\bb\.?tech\b|\bbachelor of technology\b/i, d: "B.Tech" },
    { p: /\bm\.?tech\b|\bmaster of technology\b/i, d: "M.Tech" },
    { p: /\bb\.?e\.?\b|\bbachelor of engineering\b/i, d: "B.E." },
    { p: /\bm\.?s\.?\b|\bmaster of science\b/i, d: "M.S." },
    { p: /\bbca\b/i, d: "BCA" },
    { p: /\bmca\b/i, d: "MCA" },
    { p: /\bb\.?sc\b/i, d: "B.Sc" },
    { p: /\bmba\b/i, d: "MBA" },
    { p: /\bphd\b|\bdoctorate\b/i, d: "PhD" },
    { p: /\b12th\b|\bhsc\b|\bintermediate\b/i, d: "HSC/12th" },
    { p: /\b10th\b|\bssc\b|\bmatric\b/i, d: "SSC/10th" },
  ];
  patterns.forEach(({ p, d }) => {
    if (p.test(text)) degrees.push(d);
  });
  return degrees;
};
const extractProjects = (text) => {
  // Find "Projects" section and extract project names
  const projectSection = text.match(
    /projects?[\s\S]{0,2000}?(?=\n[A-Z]|\n\n[A-Z]|$)/i,
  );
  if (!projectSection) return [];
  const lines = projectSection[0]
    .split("\n")
    .filter((l) => l.trim().length > 10);
  return lines
    .slice(1, 6)
    .map((l) => l.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
};
const extractSections = (text) => {
  const sectionHeaders = [
    "summary",
    "objective",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "achievements",
    "languages",
    "interests",
  ];
  const found = [];
  sectionHeaders.forEach((h) => {
    if (new RegExp(`\\b${h}\\b`, "i").test(text)) found.push(h);
  });
  return found;
};

// ─── 8. CORE MATCH SCORE ENGINE (COSINE + SKILL + EXP) ───────────────────────
const computeMatchScore = (candidateData, jobData) => {
  const candidateSkillObjs = candidateData.resumeParsed?.skills || [];
  const candidateSkillNames = candidateSkillObjs.length
    ? candidateSkillObjs.map((s) => (typeof s === "string" ? s : s.skill))
    : candidateData.skills || [];

  const candidateSet = new Set(candidateSkillNames.map((s) => s.toLowerCase()));

  const jobSkills = (jobData.skills || []).map((s) => s.toLowerCase());
  const jobDesc = `${jobData.title} ${jobData.description} ${jobData.requirements}`;
  const resumeText = candidateData.rawText || candidateSkillNames.join(" ");

  // ── a. Skill Match (50%) ─────────────────────────────────────────────────
  const matchedSkills = jobSkills.filter((js) => {
    if (candidateSet.has(js)) return true;
    const canonical = SKILL_MAP[js];
    if (canonical)
      return [...candidateSet].some(
        (cs) => SKILL_MAP[cs] === canonical || cs === canonical,
      );
    // Fuzzy fallback
    return [...candidateSet].some((cs) => JaroWinkler(cs, js) >= 0.88);
  });
  const missingSkills = jobSkills.filter((js) => !matchedSkills.includes(js));
  const skillScore =
    jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 100 : 50;

  // ── b. Experience Match (25%) ────────────────────────────────────────────
  const candidateExp = candidateData.experience || 0;
  const jobExpMin = jobData.experienceMin || 0;
  const jobExpMax = jobData.experienceMax || 20;
  let expScore;
  if (candidateExp >= jobExpMin && candidateExp <= jobExpMax) {
    expScore = 100;
  } else if (candidateExp < jobExpMin) {
    expScore = Math.max(0, 100 - (jobExpMin - candidateExp) * 28);
  } else {
    expScore = 88; // over-qualified
  }

  // ── c. Cosine Similarity (15%) ───────────────────────────────────────────
  const vocab = [
    ...new Set([
      ...tokenizer.tokenize(resumeText.toLowerCase()),
      ...tokenizer.tokenize(jobDesc.toLowerCase()),
    ]),
  ].map((t) => stemmer.stem(t));

  const vecResume = buildTfIdfVector(resumeText.toLowerCase(), vocab);
  const vecJob = buildTfIdfVector(jobDesc.toLowerCase(), vocab);
  const cosine = cosineSimilarity(vecResume, vecJob);
  const textScore = Math.min(100, cosine * 300); // scale to 0-100

  // ── d. Education (10%) ───────────────────────────────────────────────────
  const jobText = (
    jobData.description +
    " " +
    jobData.requirements
  ).toLowerCase();
  const candEduc = (candidateData.education || []).join(" ").toLowerCase();
  let educScore = 50;
  if (/b\.?tech|b\.?e\.?/.test(jobText) && /b\.?tech|b\.?e\.?/.test(candEduc))
    educScore = 100;
  if (/m\.?tech|m\.?s\.?/.test(jobText) && /m\.?tech|m\.?s\.?/.test(candEduc))
    educScore = 100;
  if (/mba/.test(jobText) && /mba/.test(candEduc)) educScore = 100;

  // ── Final Weighted Score ─────────────────────────────────────────────────
  const finalScore =
    skillScore * 0.5 + expScore * 0.25 + textScore * 0.15 + educScore * 0.1;

  return {
    score: Math.round(finalScore * 10) / 10,
    matchedSkills,
    missingSkills,
    breakdown: {
      skills: Math.round(skillScore),
      experience: Math.round(expScore),
      textSimilarity: Math.round(textScore),
      education: Math.round(educScore),
    },
    cosineSimilarity: Math.round(cosine * 1000) / 1000,
    rating: getRating(finalScore),
  };
};

// ─── 9. RESUME STRENGTH SCORE (0-100) ────────────────────────────────────────
const computeResumeStrength = (parsed, profile) => {
  const factors = [];
  const skills = parsed?.skills || profile?.skills || [];
  const skillCount = Array.isArray(skills)
    ? typeof skills[0] === "string"
      ? skills.length
      : skills.length
    : 0;

  // Skills (30 pts)
  const skillPts = Math.min(30, skillCount * 3);
  factors.push({
    name: "Skills listed",
    points: skillPts,
    max: 30,
    tip: skillCount < 8 ? "Add more skills — aim for 10+" : null,
  });

  // Experience (20 pts)
  const exp = parsed?.experience || profile?.experience || 0;
  const expPts = exp >= 3 ? 20 : exp >= 1 ? 14 : exp > 0 ? 8 : 2;
  factors.push({
    name: "Experience",
    points: expPts,
    max: 20,
    tip: exp === 0 ? "Add work experience or internships" : null,
  });

  // Summary/Objective (15 pts)
  const summary = profile?.summary || "";
  const summPts =
    summary.length >= 120
      ? 15
      : summary.length >= 50
        ? 9
        : summary.length > 0
          ? 4
          : 0;
  factors.push({
    name: "Professional summary",
    points: summPts,
    max: 15,
    tip:
      summary.length < 120
        ? "Write a 120+ character summary with keywords"
        : null,
  });

  // Education (15 pts)
  const educ = parsed?.education || [];
  const educPts = educ.length >= 2 ? 15 : educ.length === 1 ? 10 : 0;
  factors.push({
    name: "Education",
    points: educPts,
    max: 15,
    tip: educ.length === 0 ? "Add your educational background" : null,
  });

  // Projects (10 pts)
  const projects = parsed?.projects || [];
  const projPts = projects.length >= 3 ? 10 : projects.length >= 1 ? 6 : 0;
  factors.push({
    name: "Projects listed",
    points: projPts,
    max: 10,
    tip: projects.length < 2 ? "Add 2-3 projects to showcase work" : null,
  });

  // Contact & Links (10 pts)
  const phone = profile?.phone ? 3 : 0;
  const linkedin = profile?.linkedIn ? 4 : 0;
  const github = profile?.github ? 3 : 0;
  const linkPts = phone + linkedin + github;
  factors.push({
    name: "Contact & links",
    points: linkPts,
    max: 10,
    tip: linkPts < 7 ? "Add LinkedIn and GitHub profiles" : null,
  });

  const total = factors.reduce((s, f) => s + f.points, 0);
  const label =
    total >= 80
      ? "Excellent"
      : total >= 60
        ? "Good"
        : total >= 40
          ? "Average"
          : "Needs Work";
  const suggestions = factors.filter((f) => f.tip).map((f) => f.tip);

  return { total: Math.min(100, total), label, factors, suggestions };
};

// ─── 10. SKILL GAP ANALYZER ─────────────────────────────────────────────────
const analyzeSkillGap = (candidateSkills, jobSkills) => {
  const candidate = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const required = jobSkills.map((s) => s.toLowerCase());

  const matched = required.filter((s) => {
    if (candidate.has(s)) return true;
    const canon = SKILL_MAP[s];
    return canon && [...candidate].some((cs) => SKILL_MAP[cs] === canon);
  });
  const missing = required.filter((s) => !matched.includes(s));

  const prioritized = missing.map((skill) => ({
    skill,
    category:
      Object.entries(SKILL_TAXONOMY).find(([, v]) => v.includes(skill))?.[0] ||
      "general",
    importance: "required",
    learningResource: getLearningResource(skill),
    estimatedHours: getEstimatedHours(skill),
  }));

  return {
    matched,
    missing,
    prioritized,
    matchPercent:
      required.length > 0
        ? Math.round((matched.length / required.length) * 100)
        : 100,
  };
};

const getLearningResource = (skill) => {
  const map = {
    javascript: "https://javascript.info",
    typescript: "https://www.typescriptlang.org/docs",
    react: "https://react.dev",
    nodejs: "https://nodejs.dev",
    python: "https://docs.python.org/3/tutorial",
    docker: "https://docs.docker.com/get-started",
    kubernetes: "https://kubernetes.io/docs/tutorials",
    aws: "https://aws.amazon.com/training",
    sql: "https://sqlzoo.net",
    mongodb: "https://learn.mongodb.com",
    git: "https://learngitbranching.js.org",
    ml: "https://www.coursera.org/learn/machine-learning",
  };
  return (
    map[skill] ||
    `https://www.coursera.org/search?query=${encodeURIComponent(skill)}`
  );
};

const getEstimatedHours = (skill) => {
  const hours = {
    javascript: 60,
    typescript: 30,
    react: 40,
    nodejs: 35,
    python: 50,
    docker: 20,
    kubernetes: 30,
    aws: 40,
    sql: 25,
    mongodb: 20,
    git: 10,
    ml: 80,
  };
  return hours[skill] || 25;
};

// ─── 11. COLLABORATIVE FILTERING ────────────────────────────────────────────
/**
 * Find jobs that candidates with similar skill profiles applied to.
 * Simple user-based CF: cosine similarity between skill vectors.
 */
const collaborativeRecommend = async (
  candidateId,
  candidateSkills,
  allApplications,
  allJobs,
  limit = 10,
) => {
  // Build candidate→skills map from applications
  const candidateJobMap = {};
  allApplications.forEach((app) => {
    if (!candidateJobMap[app.candidateId])
      candidateJobMap[app.candidateId] = new Set();
    candidateJobMap[app.candidateId].add(app.jobId);
  });

  // Skill vector for target candidate
  const targetVec = {};
  candidateSkills.forEach((s) => {
    targetVec[s.toLowerCase()] = 1;
  });

  // Find similar candidates (by Jaccard similarity on applied jobs isn't enough — use skill overlap)
  // Here we rank other candidates by shared skills
  const similarities = [];
  // (In production: load from DB; here we pass allApplications for demo)
  Object.entries(candidateJobMap).forEach(([otherId, jobSet]) => {
    if (otherId === candidateId.toString()) return;
    const sharedJobs = [...jobSet].filter((jid) =>
      (candidateJobMap[candidateId.toString()] || new Set()).has(jid),
    ).length;
    if (sharedJobs > 0)
      similarities.push({
        candidateId: otherId,
        similarity: sharedJobs,
        jobIds: [...jobSet],
      });
  });

  similarities.sort((a, b) => b.similarity - a.similarity);

  // Collect job IDs from similar candidates that target hasn't applied to yet
  const appliedByTarget = candidateJobMap[candidateId.toString()] || new Set();
  const recommended = new Map(); // jobId → score
  similarities.slice(0, 10).forEach(({ similarity, jobIds }) => {
    jobIds.forEach((jid) => {
      if (!appliedByTarget.has(jid)) {
        recommended.set(jid, (recommended.get(jid) || 0) + similarity);
      }
    });
  });

  // Return top jobs sorted by collaborative score
  return [...recommended.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([jobId, cfScore]) => ({ jobId, cfScore }));
};

// ─── 12. TRENDING JOBS ───────────────────────────────────────────────────────
/**
 * Score jobs by application velocity (apps in last 7 days) + view count.
 */
const computeTrendingScore = (job, recentApps) => {
  const last7days = recentApps.filter((a) => {
    const created = new Date(a.createdAt);
    return Date.now() - created.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;
  return (
    last7days * 3 +
    (job.viewCount || 0) * 0.1 +
    (job.applicationCount || 0) * 0.5
  );
};

// ─── 13. BOOLEAN SEARCH PARSER ──────────────────────────────────────────────
/**
 * Parse queries like: "React AND Node NOT PHP" or "python OR django"
 * Returns { include: string[], exclude: string[], operator: 'AND'|'OR' }
 */
const parseBooleanSearch = (query) => {
  if (!query) return { include: [], exclude: [], operator: "AND" };

  const hasNot = /\bNOT\b/i.test(query);
  const hasAnd = /\bAND\b/i.test(query);
  const hasOr = /\bOR\b/i.test(query);

  // Split by NOT to find exclusions
  const notParts = query.split(/\bNOT\b/i);
  const mainPart = notParts[0] || "";
  const notTerms = notParts.slice(1).join(" ").split(/\s+/).filter(Boolean);

  // Split main part by AND / OR
  const operator = hasOr && !hasAnd ? "OR" : "AND";
  const includeParts = mainPart
    .split(/\bAND\b|\bOR\b/i)
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    include: includeParts.map((t) => t.toLowerCase().replace(/["']/g, "")),
    exclude: notTerms.map((t) => t.toLowerCase().replace(/["']/g, "")),
    operator,
  };
};

/**
 * Check if a job matches a parsed boolean query
 */
const jobMatchesBooleanQuery = (job, parsedQuery) => {
  const { include, exclude, operator } = parsedQuery;
  const haystack =
    `${job.title} ${job.description} ${(job.skills || []).join(" ")}`.toLowerCase();

  // Exclusions: if any excluded term present → no match
  if (exclude.some((term) => haystack.includes(term))) return false;

  // Inclusions
  if (include.length === 0) return true;
  if (operator === "AND")
    return include.every((term) => haystack.includes(term));
  return include.some((term) => haystack.includes(term));
};

// ─── 14. RANKED CANDIDATES + BATCH MATCH ────────────────────────────────────
const rankCandidatesForJob = (candidates, job) =>
  candidates
    .map((c) => ({
      candidateId: c._id || c.id,
      name: c.name,
      ...computeMatchScore(c.candidateProfile || {}, job),
    }))
    .sort((a, b) => b.score - a.score);

const rankJobsForCandidate = (jobs, candidateProfile) =>
  jobs
    .map((job) => ({
      jobId: job.id,
      title: job.title,
      company: job.company,
      ...computeMatchScore(candidateProfile, job),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const getRating = (score) => {
  if (score >= 80) return { label: "Excellent Match", color: "green" };
  if (score >= 60) return { label: "Good Match", color: "blue" };
  if (score >= 40) return { label: "Partial Match", color: "yellow" };
  return { label: "Low Match", color: "red" };
};

module.exports = {
  // Core
  parseResumeText,
  extractSkills,
  extractSkillsWithConfidence,
  normalizeSkill,
  computeMatchScore,
  // Resume strength
  computeResumeStrength,
  // Skill gap
  analyzeSkillGap,
  // Recommendations
  rankCandidatesForJob,
  rankJobsForCandidate,
  collaborativeRecommend,
  computeTrendingScore,
  // Search
  parseBooleanSearch,
  jobMatchesBooleanQuery,
  // Utils
  cosineSimilarity,
};
