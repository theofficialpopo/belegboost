/**
 * Tenant homepage - will become the dashboard in Phase 2
 */

export default function TenantHomePage({
  params,
}: {
  params: { tenant: string };
}) {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">
        Willkommen bei {params.tenant}
      </h2>
      <p className="text-muted-foreground">
        Dies ist die Startseite für den Steuerberater-Bereich.
        <br />
        Phase 1: Foundation - Die Multi-Tenant-Architektur ist eingerichtet.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Phase 2</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Authentication & Multi-Tenancy Core
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Phase 3</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Checklist Management
          </p>
        </div>
        <div className="rounded-lg border p-6">
          <h3 className="font-semibold">Phase 4</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Document Upload & Storage
          </p>
        </div>
      </div>
    </div>
  );
}
