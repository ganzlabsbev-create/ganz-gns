export function Badge({
  kind,
  children,
}: {
  kind: "valid" | "error" | "muted";
  children: React.ReactNode;
}) {
  const cls = kind === "valid" ? "badge badge-valid" : kind === "error" ? "badge badge-error" : "badge badge-muted";
  return (
    <span className={cls}>
      <span className="dot" />
      {children}
    </span>
  );
}
