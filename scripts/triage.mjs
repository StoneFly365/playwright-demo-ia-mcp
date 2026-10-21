// Preprocesado determinista del reporte IA: extrae los fallos del JSON de Playwright,
// los agrupa por causa, marca los flaky y redacta datos sensibles. La IA solo clasifica.
import { readFileSync, existsSync } from "node:fs";

const ANSI = /\x1b\[[0-9;]*m/g;
const MAX_TESTS_PER_GROUP = 10;
const MAX_ERROR_CHARS = 1500;
const MAX_CONTEXT_CHARS = 3000;

// Un fallo por test y navegador. Los flaky usan el intento que falló; el resto, el último.
export function extractFailures(report) {
    const failures = [];
    const walk = (suite) => {
        for (const spec of suite.specs ?? []) {
            for (const test of spec.tests ?? []) {
                if (test.status !== "unexpected" && test.status !== "flaky") continue;
                const flaky = test.status === "flaky";
                const result = flaky
                    ? test.results.find((r) => r.errors?.length)
                    : test.results.at(-1);
                failures.push({
                    title: spec.title,
                    file: spec.file,
                    line: spec.line,
                    project: test.projectName,
                    flaky,
                    attempts: test.results.length,
                    error: (result?.errors?.[0]?.message ?? "").replace(ANSI, ""),
                    errorContextPath: result?.attachments?.find((a) => a.name === "error-context")?.path ?? null,
                });
            }
        }
        for (const child of suite.suites ?? []) walk(child);
    };
    for (const suite of report.suites ?? []) walk(suite);
    return failures;
}

// Huella de la causa. Los mensajes personalizados de los expect cambian en cada test,
// así que se agrupa por el patrón del fallo y el elemento implicado, no por la primera línea.
export function fingerprint(error) {
    const network = error.match(/(?:net::ERR_|NS_ERROR_)([A-Z_]+)/)?.[1];
    const locator = error.match(/^Locator:\s+(.+)$/m)?.[1]
        ?? error.match(/waiting for ((?:locator|getBy\w+)\(.+\))\s*$/m)?.[1];
    const matcher = error.match(/expect\((?:locator|page)\)\.(?:not\.)?(\w+)/)?.[1];
    const api = error.match(/^\w*Error: (\w+\.\w+):/m)?.[1];

    if (network) return { pattern: "red", key: `red|${network}` };
    if (locator && (/element\(s\) not found/.test(error) || (api && /Timeout \d+ms exceeded/.test(error)))) {
        return { pattern: "elemento_no_encontrado", key: `elemento_no_encontrado|${locator}` };
    }
    if (matcher) {
        const target = locator ?? `page.${matcher} ${error.match(/^Expected(?: pattern)?:\s+(.+)$/m)?.[1] ?? ""}`;
        return { pattern: "valor_inesperado", key: `valor_inesperado|${target.trim()}` };
    }
    if (api && /Timeout \d+ms exceeded/.test(error)) return { pattern: "timeout", key: `timeout|${api}` };
    const firstLine = error.split("\n")[0].replace(/\d+/g, "N");
    return { pattern: "otro", key: `otro|${firstLine}` };
}

export function groupFailures(failures) {
    const groups = new Map();
    for (const f of failures) {
        const { pattern, key } = fingerprint(f.error);
        const fullKey = (f.flaky ? "flaky|" : "") + key;
        if (!groups.has(fullKey)) {
            groups.set(fullKey, {
                fingerprint: fullKey,
                pattern,
                // flaky lo decide el código (falló y pasó al reintentar); el resto lo clasifica la IA.
                tipo: f.flaky ? "flaky" : null,
                count: 0,
                browsers: new Set(),
                affected_tests: [],
                sample_error: redact(f.error.slice(0, MAX_ERROR_CHARS)),
                page_context: redact(readContext(f.errorContextPath)),
            });
        }
        const g = groups.get(fullKey);
        g.count++;
        g.browsers.add(f.project);
        g.affected_tests.push({ title: f.title, file: f.file, line: f.line, browser: f.project });
    }
    return [...groups.values()]
        .sort((a, b) => b.count - a.count)
        .map((g, i) => ({
            group_id: `G${String(i + 1).padStart(3, "0")}`,
            ...g,
            browsers: [...g.browsers],
            affected_tests: g.affected_tests.slice(0, MAX_TESTS_PER_GROUP),
            omitted_tests: Math.max(0, g.affected_tests.length - MAX_TESTS_PER_GROUP),
        }));
}

function readContext(path) {
    if (!path || !existsSync(path)) return null;
    return readFileSync(path, "utf8").slice(0, MAX_CONTEXT_CHARS);
}

// Solo salen hacia la IA los campos de groupFailures; aun así se enmascara lo que pueda ser sensible.
const REDACTIONS = [
    [/\beyJ[\w-]+\.[\w-]+\.[\w-]+/g, "[JWT]"],
    [/\b(Bearer|Basic)\s+[\w\-.~+/]+=*/gi, "$1 [REDACTED]"],
    [/\b(authorization|cookie|set-cookie)(\s*[:=]\s*).+$/gim, "$1$2[REDACTED]"],
    [/(\b(?:password|passwd|pwd|secret|token|api[_-]?key)\b["']?\s*[:=]\s*)(["']?)[^\s"',;]+\2/gi, "$1$2[REDACTED]$2"],
    [/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "[EMAIL]"],
    [/(https?:\/\/[^\s"'<>?#]+)\?[^\s"'<>#]+/g, "$1?[REDACTED]"],
    [/(\bfill\(\s*)(["'`])(?:(?!\2).)*\2/g, "$1$2[REDACTED]$2"],
    [/^(\s*- textbox [^\n:]*?): .+$/gm, "$1: [REDACTED]"],
    [/(?:[A-Za-z]:)?[\\/](?:Users|home)[\\/]\w[^\\/\s"']*/g, "~"],
];

export function redact(text) {
    if (text == null) return text;
    return REDACTIONS.reduce((t, [pattern, replacement]) => t.replace(pattern, replacement), text);
}
