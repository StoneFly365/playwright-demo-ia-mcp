// Lógica pura del dashboard: métricas y filtros sobre el contrato normalizado de dashboard.mjs.
// La importan los tests y dashboard.mjs la incrusta tal cual en la página (sin los `export`),
// así que no puede importar nada ni tocar el DOM.

// La taxonomía del proyecto, en el orden en que se muestra. No se añaden categorías.
export const TIPOS = ["test_roto", "bug_producto", "entorno", "flaky", "sin_clasificar"];

export function pct(part, whole) {
    return whole ? Math.round((part / whole) * 100) : null;
}

// Unidades de grupo, no de test: un grupo de 70 tests cuenta como 1 en byTipo y como 70 en testsInGroups.
export function groupMetrics(groups) {
    const byTipo = Object.fromEntries(TIPOS.map((t) => [t, 0]));
    const testsByTipo = Object.fromEntries(TIPOS.map((t) => [t, 0]));
    let codigo = 0, ia = 0, pendientes = 0, testsInGroups = 0;
    for (const g of groups) {
        byTipo[g.tipo]++;
        testsByTipo[g.tipo] += g.count;
        testsInGroups += g.count;
        if (g.origen === "codigo") codigo++;
        if (g.origen === "ia") ia++;
        if (g.pendienteRevision) pendientes++;
    }
    return { groups: groups.length, byTipo, testsByTipo, testsInGroups, codigo, ia, sinClasificar: byTipo.sin_clasificar, pendientes };
}

// Filtros combinados (AND). Los textos no distinguen mayúsculas; vacío o "todos" no filtra.
export function filterGroups(groups, { tipo = "", origen = "", browser = "", test = "", error = "" } = {}) {
    const has = (text, q) => (text ?? "").toLowerCase().includes(q);
    const qTest = test.trim().toLowerCase();
    const qError = error.trim().toLowerCase();
    return groups.filter((g) =>
        (!tipo || g.tipo === tipo)
        && (!origen || g.origen === origen)
        && (!browser || g.browsers.includes(browser))
        && (!qTest || g.tests.some((t) => has(t.title, qTest) || has(t.file, qTest)))
        && (!qError || has(g.error, qError) || has(g.fingerprint, qError)));
}

export function browsersOf(groups) {
    return [...new Set(groups.flatMap((g) => g.browsers))].sort();
}

export function evalMetrics(ev) {
    const t = ev?.totals;
    if (!t) return null;
    return { ...t, pctGroups: pct(t.okGroups, t.allGroups), pctTests: pct(t.okTests, t.allTests) };
}
