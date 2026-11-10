// Shim minimal i API-së së vitest mbi node:test, vetëm për ta ekzekutuar këtu pa instaluar vitest.
// Në projekt, testet ekzekutohen me `npm test` (vitest). Ky skedar nuk përdoret nga vitest.
import { describe, it, test } from "node:test";
import assert from "node:assert/strict";

const fmt = (x: unknown) => JSON.stringify(x);
export const expect = (actual: any) => {
  const make = (neg: boolean) => {
    const check = (ok: boolean, msg: string) => assert.ok(neg ? !ok : ok, `${neg ? "not " : ""}${msg}`);
    return {
      toBe: (e: unknown) => check(Object.is(actual, e), `expected ${fmt(actual)} to be ${fmt(e)}`),
      toEqual: (e: unknown) => {
        let ok = true;
        try { assert.deepStrictEqual(actual, e); } catch { ok = false; }
        check(ok, `expected ${fmt(actual)} to equal ${fmt(e)}`);
      },
      toBeCloseTo: (e: number, digits = 2) => check(Math.abs(actual - e) < Math.pow(10, -digits) / 2, `expected ${actual} ≈ ${e} (${digits})`),
      toBeGreaterThan: (e: number) => check(actual > e, `expected ${actual} > ${e}`),
      toBeGreaterThanOrEqual: (e: number) => check(actual >= e, `expected ${actual} >= ${e}`),
      toBeLessThan: (e: number) => check(actual < e, `expected ${actual} < ${e}`),
      toBeLessThanOrEqual: (e: number) => check(actual <= e, `expected ${actual} <= ${e}`),
      toHaveLength: (n: number) => check(actual.length === n, `expected length ${actual.length} to be ${n}`),
      toContain: (s: string) => check(String(actual).includes(s), `expected ${fmt(actual)} to contain ${fmt(s)}`),
      toThrow: () => {
        let threw = false;
        try { actual(); } catch { threw = true; }
        check(threw, "expected function to throw");
      },
    };
  };
  return { ...make(false), not: make(true) };
};
export { describe, it, test };
