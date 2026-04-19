import { requireOrg } from '@/lib/auth';
import { PlanSelector } from './plan-selector';

export default async function SettingsPage() {
  const { org, profile } = await requireOrg();

  return (
    <div className="flex-1 overflow-auto">
      <header className="h-16 border-b border-border bg-white px-8 flex items-center">
        <h1 className="text-base font-semibold">設定</h1>
      </header>
      <div className="p-8 max-w-3xl space-y-6">
        <section className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">プロフィール</h2>
          <dl className="space-y-2 text-sm">
            <Row label="お名前" value={profile.full_name ?? '未設定'} />
            <Row label="メール" value={profile.email} />
            <Row label="権限" value={profile.role} />
          </dl>
        </section>

        <section className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-4">事務所情報</h2>
          <dl className="space-y-2 text-sm">
            <Row label="事務所名" value={org.name} />
            <Row label="スラッグ" value={org.slug} />
          </dl>
        </section>

        <section className="bg-white border border-border rounded-lg p-6">
          <h2 className="font-semibold mb-1">料金プラン</h2>
          <p className="text-sm text-fg-muted mb-4">
            現在: <span className="font-medium text-fg">{planLabel(org.plan)}</span>
            {org.plan === 'trial' && org.trial_ends_at && (
              <span className="ml-2">
                （{new Date(org.trial_ends_at).toLocaleDateString('ja-JP')}まで）
              </span>
            )}
          </p>
          <PlanSelector
            currentPlan={org.plan}
            hasSubscription={Boolean(org.stripe_subscription_id)}
          />
        </section>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <dt className="text-fg-muted">{label}</dt>
      <dd className="col-span-2">{value}</dd>
    </div>
  );
}

function planLabel(plan: string) {
  return (
    {
      trial: '無料トライアル',
      starter: 'スターター',
      pro: 'プロフェッショナル',
      enterprise: 'エンタープライズ',
    }[plan] ?? plan
  );
}
