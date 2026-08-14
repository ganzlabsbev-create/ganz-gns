export default function DocsPage() {
  return (
    <div className="prose" style={{ maxWidth: 680 }}>
      <div className="section-title" style={{ marginTop: 0 }}>
        docs
      </div>

      <div className="warning-box" style={{ marginBottom: 24 }}>
        GanZ GNS prototype names are <strong>not</strong> ICANN DNS domains. <code>.ganz</code> does
        not open directly in Chrome, Safari, or Firefox. This is an experimental identity/naming
        prototype, not a production TLD.
      </div>

      <h2>What is GanZ GNS?</h2>
      <p>
        GanZ GNS is an experimental naming system for testing one idea: that a person should be
        able to create a name for themselves without buying a domain or waiting for a central
        authority to approve it. It separates a <em>name</em> from the <em>website</em> it points
        to, so the name stays yours even if the website changes.
      </p>

      <h2>What is a GanZ Name?</h2>
      <p>
        A GanZ Name looks like <code>wanna.ganz</code>. It is a short label plus the{" "}
        <code>.ganz</code> suffix, registered for free and pointed at any http(s) website you
        choose.
      </p>

      <h2>How ownership works</h2>
      <p>
        Ownership is not decided by a database row — it is decided by cryptography. When you
        create a name, your browser generates a key pair for you. Every record about your name is
        signed with your private key, and anyone can check that signature against your public key.
        The server stores records, but it cannot forge a valid signature, so it cannot forge
        ownership either.
      </p>

      <h2>What is a Public Key?</h2>
      <p>
        Your public key (shown as <code>GNS-PUB-…</code>) is your identifier. It is safe to share —
        it lets other people verify that something was signed by you, without letting them sign
        anything on your behalf.
      </p>

      <h2>What is a Private Key?</h2>
      <p>
        Your private key is the secret half of your identity. It is generated in your browser and
        never sent anywhere. Anyone who has it can act as you, so treat it like a password: back it
        up somewhere safe, and never share it.
      </p>

      <h2>How signatures work</h2>
      <p>
        When you claim a name or change its website, GanZ GNS builds a record — name, website,
        your public key, and timestamps — and signs it with your private key using the Web Crypto
        API (ECDSA, P-256). That signature is proof the record came from you and hasn&apos;t been
        altered.
      </p>

      <h2>How to publish .well-known/ganz.json</h2>
      <p>
        On the Identity page, generate a <code>ganz.json</code> file for any name you own and place
        it at <code>https://your-site.example/.well-known/ganz.json</code>. This lets your own
        website independently declare which GanZ name points to it.
      </p>

      <h2>How to verify a name</h2>
      <p>
        Use the Verify page to look up a name or paste a record&apos;s JSON directly. GanZ GNS
        checks that the name and website are well-formed, and that the signature genuinely matches
        the claimed owner&apos;s public key.
      </p>
    </div>
  );
}
