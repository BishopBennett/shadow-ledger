import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// Forbidden patterns
const forbiddenPatterns = [
  // SSR/ISR
  { pattern: /getServerSideProps/, message: "getServerSideProps is not allowed (SSR)" },
  { pattern: /getStaticProps/, message: "getStaticProps is not allowed (ISR)" },
  { pattern: /getInitialProps/, message: "getInitialProps is not allowed" },
  
  // Server Actions
  { pattern: /"use server"/, message: "Server actions ('use server') are not allowed" },
  { pattern: /'use server'/, message: "Server actions ('use server') are not allowed" },
  
  // API Routes
  { pattern: /\/api\//, message: "API routes (/app/api or /pages/api) are not allowed" },
  { pattern: /pages\/api\//, message: "API routes (/pages/api) are not allowed" },
  { pattern: /app\/api\//, message: "API routes (/app/api) are not allowed" },
  
  // Next.js server-only imports
  { pattern: /from ['"]next\/headers['"]/, message: "next/headers is not allowed (server-only)" },
  { pattern: /from ['"]server-only['"]/, message: "server-only package is not allowed" },
  { pattern: /from ['"]next\/server['"]/, message: "next/server is not allowed (server-only)" },
  
  // Dynamic config
  { pattern: /dynamic\s*=\s*['"]force-dynamic['"]/, message: "dynamic='force-dynamic' is not allowed" },
  
  // Cookies
  { pattern: /cookies\(\)/, message: "cookies() is not allowed (server-only)" },
];

// Files to check
const filesToCheck = [];

function walkDir(dir, extensions = [".ts", ".tsx", ".js", ".jsx"]) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, out, .git
      if (!file.startsWith(".") && file !== "node_modules" && file !== ".next" && file !== "out") {
        walkDir(filePath, extensions);
      }
    } else if (extensions.some(ext => file.endsWith(ext))) {
      filesToCheck.push(filePath);
    }
  }
}

// Check dynamic routes
function checkDynamicRoutes() {
  const appDir = path.join(projectRoot, "app");
  if (!fs.existsSync(appDir)) return;
  
  const routes = fs.readdirSync(appDir, { withFileTypes: true });
  for (const route of routes) {
    if (route.isDirectory() && route.name.includes("[")) {
      const routePath = path.join(appDir, route.name);
      const pageFile = path.join(routePath, "page.tsx");
      const layoutFile = path.join(routePath, "layout.tsx");
      
      // Check if generateStaticParams exists
      const hasGenerateStaticParams = filesToCheck.some(file => {
        const content = fs.readFileSync(file, "utf-8");
        return content.includes("generateStaticParams");
      });
      
      if (!hasGenerateStaticParams && (fs.existsSync(pageFile) || fs.existsSync(layoutFile))) {
        console.error(`❌ Dynamic route "${route.name}" must have generateStaticParams`);
        process.exit(1);
      }
    }
  }
}

// Main check
console.log("🔍 Checking for static export violations...\n");

walkDir(projectRoot);

let hasErrors = false;

for (const file of filesToCheck) {
  const content = fs.readFileSync(file, "utf-8");
  
  for (const { pattern, message } of forbiddenPatterns) {
    if (pattern.test(content)) {
      const relativePath = path.relative(projectRoot, file);
      console.error(`❌ ${relativePath}: ${message}`);
      hasErrors = true;
    }
  }
}

// Check dynamic routes
checkDynamicRoutes();

// Check next.config.ts
const nextConfigPath = path.join(projectRoot, "next.config.ts");
if (fs.existsSync(nextConfigPath)) {
  const configContent = fs.readFileSync(nextConfigPath, "utf-8");
  if (!configContent.includes("output: \"export\"")) {
    console.error("❌ next.config.ts: Must have output: 'export'");
    hasErrors = true;
  }
  if (!configContent.includes("images:") || !configContent.includes("unoptimized: true")) {
    console.error("❌ next.config.ts: Must have images.unoptimized: true");
    hasErrors = true;
  }
  if (!configContent.includes("trailingSlash: true")) {
    console.error("❌ next.config.ts: Must have trailingSlash: true");
    hasErrors = true;
  }
}

if (hasErrors) {
  console.error("\n❌ Static export check failed!");
  process.exit(1);
}

console.log("✅ Static export check passed!");
console.log(`   Checked ${filesToCheck.length} files`);



