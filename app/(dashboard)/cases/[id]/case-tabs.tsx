'use client';

import { useState } from 'react';
import type { Database } from '@/lib/supabase/types';
import { cn } from '@/lib/utils';
import { CitationsTab } from './tabs/citations-tab';
import { DocumentsTab } from './tabs/documents-tab';
import { EvidenceTab } from './tabs/evidence-tab';
import { OverviewTab } from './tabs/overview-tab';
import { TimelineTab } from './tabs/timeline-tab';

type CaseRow = Database['public']['Tables']['cases']['Row'];
type Evidence = Database['public']['Tables']['evidence']['Row'];
type Timeline = Database['public']['Tables']['timeline_events']['Row'];
type Doc = Database['public']['Tables']['documents']['Row'];
type Citation = Database['public']['Tables']['citations']['Row'];

const TABS = [
  { id: 'overview', label: '概要' },
  { id: 'evidence', label: '証拠' },
  { id: 'timeline', label: 'タイムライン' },
  { id: 'documents', label: '書面' },
  { id: 'citations', label: '判例' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function CaseTabs(props: {
  caseId: string;
  caseData: CaseRow;
  evidence: Evidence[];
  timeline: Timeline[];
  documents: Doc[];
  citations: Citation[];
}) {
  const [active, setActive] = useState<TabId>('overview');

  return (
    <div>
      <div className="border-b border-border flex gap-1 mb-6">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
              active === tab.id
                ? 'border-accent text-fg'
                : 'border-transparent text-fg-muted hover:text-fg',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {active === 'overview' && <OverviewTab caseData={props.caseData} />}
      {active === 'evidence' && <EvidenceTab caseId={props.caseId} items={props.evidence} />}
      {active === 'timeline' && (
        <TimelineTab
          caseId={props.caseId}
          events={props.timeline}
          evidenceCount={props.evidence.length}
        />
      )}
      {active === 'documents' && (
        <DocumentsTab caseId={props.caseId} documents={props.documents} caseData={props.caseData} />
      )}
      {active === 'citations' && (
        <CitationsTab caseId={props.caseId} citations={props.citations} caseData={props.caseData} />
      )}
    </div>
  );
}
