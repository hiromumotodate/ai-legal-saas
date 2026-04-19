import type { Database } from '@/lib/supabase/types';

type CaseRow = Database['public']['Tables']['cases']['Row'];

const sideLabel: Record<string, string> = {
  plaintiff: '原告',
  defendant: '被告',
  third_party: '第三者',
};

export function OverviewTab({ caseData }: { caseData: CaseRow }) {
  const rows = [
    { label: '事件名', value: caseData.title },
    { label: '事件番号', value: caseData.case_number },
    { label: '事件種別', value: caseData.case_type },
    { label: '係属裁判所', value: caseData.court_name },
    { label: '当事者', value: caseData.client_name },
    { label: '相手方', value: caseData.opposing_party },
    { label: '立場', value: caseData.side ? sideLabel[caseData.side] : null },
    {
      label: '請求金額',
      value: caseData.amount_in_dispute
        ? `¥${Number(caseData.amount_in_dispute).toLocaleString('ja-JP')}`
        : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white border border-border rounded-lg overflow-hidden">
        <dl className="divide-y divide-border">
          {rows.map((row) => (
            <div key={row.label} className="px-6 py-3 grid grid-cols-3 gap-4 text-sm">
              <dt className="text-fg-muted">{row.label}</dt>
              <dd className="col-span-2">
                {row.value ?? <span className="text-fg-muted">未設定</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>
      {caseData.description && (
        <div className="bg-white border border-border rounded-lg p-6">
          <h3 className="font-semibold text-sm mb-3">概要・メモ</h3>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{caseData.description}</p>
        </div>
      )}
    </div>
  );
}
