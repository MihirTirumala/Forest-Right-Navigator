import { X, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { Claim } from "@/data/claims";
import { CLAIM_TYPE_LABEL, STATUSES } from "@/data/claims";
import { FLAGS_BY_CLAIM, RULE_BY_CODE } from "@/data/anomalies";
import { cn } from "@/lib/utils";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border/60 py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function Check({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
        ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700",
      )}
    >
      {ok ? <CheckCircle2 className="size-3.5" /> : <XCircle className="size-3.5" />}
      {label}
    </span>
  );
}

export function ClaimDetail({ claim, onClose }: { claim: Claim; onClose: () => void }) {
  const flags = FLAGS_BY_CLAIM[claim.id] ?? [];
  const stageIndex = STATUSES.indexOf(claim.status);
  const isRejected = claim.status === "Rejected";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl overflow-y-auto bg-card shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 flex items-start justify-between gap-4 border-b border-border bg-card px-5 py-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground">{claim.id}</p>
            <h2 className="text-lg font-semibold text-foreground">{claim.claimant}</h2>
            <p className="text-xs text-muted-foreground">
              {claim.village}, {claim.block} · {claim.district}, {claim.state}
            </p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:text-foreground">
            <X className="size-5" />
          </button>
        </header>

        <div className="space-y-6 p-5">
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Progress through the FRA process
            </p>
            <div className="flex gap-1">
              {STATUSES.slice(0, 6).map((s, i) => (
                <div key={s} className="flex-1">
                  <div
                    className={cn(
                      "h-1.5 rounded-full",
                      isRejected ? "bg-red-200" : i <= stageIndex ? "bg-primary" : "bg-muted",
                    )}
                  />
                  <p className="mt-1 text-[10px] leading-tight text-muted-foreground">{s}</p>
                </div>
              ))}
            </div>
            {isRejected && (
              <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
                Claim rejected — recorded on {claim.lastUpdatedOn}.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <Check ok={claim.gramSabhaResolution} label="Gram Sabha resolution" />
            <Check ok={claim.surveyCompleted} label="Field survey" />
            <Check ok={claim.documentsComplete} label="Documents complete" />
          </div>

          <div className="rounded-lg border border-border p-4">
            <Row label="Claim type" value={`${claim.claimType} — ${CLAIM_TYPE_LABEL[claim.claimType]}`} />
            <Row label="Community" value={claim.community} />
            <Row label="Current status" value={claim.status} />
            <Row label="Area claimed" value={`${claim.areaClaimedHa} ha`} />
            <Row
              label="Area granted"
              value={claim.areaGrantedHa != null ? `${claim.areaGrantedHa} ha` : "—"}
            />
            <Row label="Submitted on" value={claim.submittedOn} />
            <Row label="Last updated" value={claim.lastUpdatedOn} />
            <Row label="Days in current stage" value={`${claim.daysInCurrentStage}`} />
            <Row label="Responsible officer" value={claim.officer} />
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <AlertTriangle className="size-3.5" /> Rule-based flags ({flags.length})
            </p>
            {flags.length === 0 ? (
              <p className="rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                No rules matched this claim.
              </p>
            ) : (
              <ul className="space-y-2">
                {flags.map((f, i) => {
                  const rule = RULE_BY_CODE[f.code]!;
                  return (
                    <li key={i} className="rounded-md border border-border p-3">
                      <p className="text-sm font-medium text-foreground">
                        {rule.code} · {rule.title}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{f.detail}</p>
                      <p className="mt-1 font-mono text-[11px] text-muted-foreground">Rule: {rule.rule}</p>
                      <p className="mt-2 text-xs text-primary">Suggested review: {rule.reviewAction}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <p className="rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            Synthetic record. Flags and suggested reviews are advisory prompts for a human officer and carry
            no legal effect.
          </p>
        </div>
      </div>
    </div>
  );
}
