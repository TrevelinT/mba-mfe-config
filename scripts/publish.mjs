import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const packagePath = path.join(rootDir, "package.json");

function readPackageVersion() {
	const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
	if (typeof pkg.version !== "string" || pkg.version.length === 0) {
		throw new Error(`Missing version in ${packagePath}`);
	}
	return pkg.version;
}

const version = readPackageVersion();

if (version === "0.0.0") {
	console.log(`Skipping publish: package is still at ${version}`);
	process.exit(0);
}

console.log(`Publishing @trevelint/mfe-config@${version}`);
execFileSync("npm", ["publish"], {
	cwd: rootDir,
	stdio: "inherit",
});
console.log(`Published @trevelint/mfe-config@${version}`);
