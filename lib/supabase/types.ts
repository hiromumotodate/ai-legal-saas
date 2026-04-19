// Minimal hand-written types. Replace with `supabase gen types typescript` output after provisioning the project.

type Tbl<Row, InsertRequired extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, InsertRequired>;
  Update: Partial<Row>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: Tbl<
        {
          id: string;
          name: string;
          slug: string;
          plan: 'trial' | 'starter' | 'pro' | 'enterprise';
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        },
        'name' | 'slug'
      >;
      profiles: Tbl<
        {
          id: string;
          organization_id: string;
          email: string;
          full_name: string | null;
          role: 'owner' | 'admin' | 'member';
          created_at: string;
          updated_at: string;
        },
        'id' | 'organization_id' | 'email'
      >;
      cases: Tbl<
        {
          id: string;
          organization_id: string;
          title: string;
          case_number: string | null;
          client_name: string | null;
          court_name: string | null;
          case_type: string | null;
          status: 'active' | 'closed' | 'archived';
          side: 'plaintiff' | 'defendant' | 'third_party' | null;
          opposing_party: string | null;
          description: string | null;
          amount_in_dispute: number | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        'organization_id' | 'title'
      >;
      evidence: Tbl<
        {
          id: string;
          case_id: string;
          organization_id: string;
          label: string;
          evidence_type: 'contract' | 'email' | 'document' | 'testimony' | 'other' | null;
          storage_path: string | null;
          content_text: string | null;
          ai_summary: string | null;
          ai_key_points: unknown | null;
          submitted_by: 'us' | 'opposing' | 'court' | null;
          submitted_at: string | null;
          created_at: string;
          updated_at: string;
        },
        'case_id' | 'organization_id' | 'label'
      >;
      timeline_events: Tbl<
        {
          id: string;
          case_id: string;
          organization_id: string;
          event_date: string;
          title: string;
          description: string | null;
          source: string | null;
          evidence_id: string | null;
          ai_generated: boolean;
          created_at: string;
        },
        'case_id' | 'organization_id' | 'event_date' | 'title'
      >;
      documents: Tbl<
        {
          id: string;
          case_id: string;
          organization_id: string;
          title: string;
          document_type: 'complaint' | 'answer' | 'brief' | 'motion' | 'agreement' | 'other' | null;
          content: string | null;
          ai_generated: boolean;
          status: 'draft' | 'final' | 'submitted';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        },
        'case_id' | 'organization_id' | 'title'
      >;
      citations: Tbl<
        {
          id: string;
          case_id: string | null;
          organization_id: string;
          court: string | null;
          case_number: string | null;
          date: string | null;
          summary: string | null;
          relevance_score: number | null;
          ai_reasoning: string | null;
          created_at: string;
        },
        'organization_id'
      >;
      usage_events: Tbl<
        {
          id: string;
          organization_id: string;
          user_id: string | null;
          feature: string;
          tokens_input: number | null;
          tokens_output: number | null;
          cost_usd: number | null;
          created_at: string;
        },
        'organization_id' | 'feature'
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
