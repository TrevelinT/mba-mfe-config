import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(
	path.dirname(fileURLToPath(import.meta.url)),
	"..",
);
const packagePath = path.join(rootDir, "package.json");
const changelogPath = path.join(rootDir, "CHANGELOG.md");

function readPackageVersion() {
	const pkg = JSON.parse(readFileSync(packagePath, "utf8"));
	if (typeof pkg.version !== "string" || pkg.version.length === 0) {
		throw new Error(`Missing version in ${packagePath}`);
	}
	return pkg.version;
}

function extractChangelogSection(changelog, version) {
	const heading = `## ${version}`;
	const start = changelog.indexOf(heading);
	if (start === -1) {
		return `Release v${version}`;
	}

	const afterHeading = start + heading.length;
	const nextHeading = changelog.indexOf("\n## ", afterHeading);
	const section =
		nextHeading === -1
			? changelog.slice(start)
			: changelog.slice(start, nextHeading);

	return section.trim();
}

function tagExists(tag) {
	try {
		execFileSync("gh", ["release", "view", tag], {
			cwd: rootDir,
			stdio: "ignore",
		});
		return true;
	} catch {
		// Fall through to local git tags (offline / no gh auth).
	}

	try {
		execFileSync("git", ["rev-parse", "--verify", `refs/tags/${tag}`], {
			cwd: rootDir,
			stdio: "ignore",
		});
		return true;
	} catch {
		return false;
	}
}

function createGitHubRelease(tag, notes) {
	execFileSync(
		"gh",
		["release", "create", tag, "--title", tag, "--notes", notes],
		{
			cwd: rootDir,
			stdio: "inherit",
		},
	);
}

const version = readPackageVersion();
const tag = `v${version}`;

if (version === "0.0.0") {
	console.log(`Skipping release: package is still at ${version}`);
	process.exit(0);
}

if (tagExists(tag)) {
	console.log(`Skipping release: tag ${tag} already exists`);
	process.exit(0);
}

const notes = existsSync(changelogPath)
	? extractChangelogSection(readFileSync(changelogPath, "utf8"), version)
	: `Release ${tag}`;

console.log(`Creating GitHub Release ${tag}`);
createGitHubRelease(tag, notes);
console.log(`Created ${tag}`);
