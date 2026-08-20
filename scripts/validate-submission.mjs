#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, readFile, realpath } from "node:fs/promises";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const value = (name) => {
  const index = args.indexOf(name);
  return index < 0 ? undefined : args[index + 1];
};
const base = value("--base");
const head = value("--head");
if (!/^[a-f0-9]{40}$/u.test(base ?? "") || !/^[a-f0-9]{40}$/u.test(head ?? "")) {
  throw new Error("submission_diff_commits_invalid");
}
const output = execFileSync("git", [
  "diff", "--name-status", "--no-renames", "-z", base, head,
], { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 });
const fields = output.split("\0").filter((item) => item !== "");
if (fields.length !== 2 || fields[0] !== "A") throw new Error("submission_must_add_exactly_one_file");
const name = fields[1];
if (!/^submissions\/v2\/submission-[a-f0-9]{8,32}\.pcstudy$/u.test(name)) {
  throw new Error("submission_path_invalid");
}
const path = resolve(root, ...name.split("/"));
const canonicalRoot = await realpath(root);
const canonicalPath = await realpath(path);
const traversal = relative(canonicalRoot, canonicalPath);
if (traversal === ".." || traversal.startsWith(`..${sep}`) || traversal.startsWith("..")) {
  throw new Error("submission_path_escapes_repository");
}
const info = await lstat(canonicalPath);
if (!info.isFile() || info.isSymbolicLink() || info.size < 256 || info.size > 6 * 1024 * 1024) {
  throw new Error("submission_file_invalid");
}
const bytes = await readFile(canonicalPath);
let envelope;
try {
  envelope = JSON.parse(bytes.toString("utf8"));
} catch {
  throw new Error("submission_json_invalid");
}
const expectedKeys = [
  "authTag", "cipher", "ciphertext", "encryptedKey", "iv", "keyWrap", "kind",
  "plaintextSha256", "schemaVersion", "studyId",
];
if (
  typeof envelope !== "object" || envelope === null || Array.isArray(envelope) ||
  JSON.stringify(Object.keys(envelope).sort()) !== JSON.stringify(expectedKeys)
) throw new Error("submission_envelope_shape_invalid");
const base64 = (input, min, max) => {
  if (typeof input !== "string" || input.length < 4 || input.length > max * 2) return undefined;
  const decoded = Buffer.from(input, "base64");
  if (decoded.length < min || decoded.length > max || decoded.toString("base64") !== input) return undefined;
  return decoded;
};
if (
  envelope.schemaVersion !== 1 || envelope.kind !== "pointable-context-study-result" ||
  envelope.studyId !== "pointable-context-study-v2" || envelope.cipher !== "AES-256-GCM" ||
  envelope.keyWrap !== "RSA-OAEP-SHA256" ||
  base64(envelope.encryptedKey, 256, 1024) === undefined ||
  base64(envelope.iv, 12, 12) === undefined ||
  base64(envelope.authTag, 16, 16) === undefined ||
  base64(envelope.ciphertext, 128, 5 * 1024 * 1024) === undefined ||
  typeof envelope.plaintextSha256 !== "string" || !/^[a-f0-9]{64}$/u.test(envelope.plaintextSha256)
) throw new Error("submission_envelope_contract_invalid");
process.stdout.write(`${JSON.stringify({
  valid: true,
  path: name,
  bytes: bytes.length,
  envelopeSha256: createHash("sha256").update(bytes).digest("hex"),
  decrypted: false,
  executed: false,
})}\n`);
