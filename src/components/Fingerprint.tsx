"use client";

// A small deterministic "identicon"-style grid generated from any string
// (public key or signature). Purely visual — helps a human eyeball-compare
// two keys/signatures at a glance. Carries no cryptographic meaning itself.

function hashString(input: string): number[] {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = (h1 ^ (h1 >>> 16)) >>> 0;
  h2 = (h2 ^ (h2 >>> 16)) >>> 0;

  const bits: number[] = [];
  let seed = h1 ^ h2;
  for (let i = 0; i < 25; i++) {
    seed = (Math.imul(seed, 48271) + 1) >>> 0;
    bits.push(seed % 2);
  }
  return bits;
}

export function Fingerprint({ seed, valid = true }: { seed: string; valid?: boolean }) {
  const cells = hashString(seed);
  const color = valid ? "var(--accent)" : "var(--text-faint)";

  return (
    <div className="fingerprint" aria-hidden="true" title={seed}>
      {cells.map((on, i) => (
        <i key={i} style={{ background: on ? color : "transparent" }} />
      ))}
    </div>
  );
}
