export function SignalBanner({ alerts }: { alerts: string[] }) {
  if (!alerts.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-red-500/30 bg-red-950/30 p-3 text-sm text-red-200">
      {alerts.map((alert) => (
        <div key={alert}>{alert}</div>
      ))}
    </div>
  );
}
