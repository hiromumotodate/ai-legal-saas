import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input, Label, Select, Textarea } from '@/components/ui/input';
import { createCase } from '../actions';

export default function NewCasePage() {
  return (
    <div className="flex-1 overflow-auto">
      <header className="h-16 border-b border-border bg-white px-8 flex items-center gap-3">
        <Link href="/cases">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-base font-semibold">新規案件</h1>
      </header>

      <div className="p-8 max-w-3xl">
        <form
          action={createCase}
          className="space-y-5 bg-white border border-border rounded-lg p-8"
        >
          <div>
            <Label htmlFor="title">事件名 *</Label>
            <Input id="title" name="title" required placeholder="○○請求事件" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="case_number">事件番号</Label>
              <Input id="case_number" name="case_number" placeholder="令和○年(ワ)第○号" />
            </div>
            <div>
              <Label htmlFor="case_type">事件種別</Label>
              <Input id="case_type" name="case_type" placeholder="民事・請負代金請求" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">当事者（顧客）</Label>
              <Input id="client_name" name="client_name" />
            </div>
            <div>
              <Label htmlFor="opposing_party">相手方</Label>
              <Input id="opposing_party" name="opposing_party" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="side">依頼者の立場</Label>
              <Select id="side" name="side">
                <option value="">選択してください</option>
                <option value="plaintiff">原告</option>
                <option value="defendant">被告</option>
                <option value="third_party">第三者</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="court_name">係属裁判所</Label>
              <Input id="court_name" name="court_name" placeholder="東京地方裁判所" />
            </div>
          </div>
          <div>
            <Label htmlFor="amount_in_dispute">請求金額（円）</Label>
            <Input id="amount_in_dispute" name="amount_in_dispute" type="number" />
          </div>
          <div>
            <Label htmlFor="description">概要・メモ</Label>
            <Textarea id="description" name="description" rows={4} />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Link href="/cases">
              <Button type="button" variant="secondary">
                キャンセル
              </Button>
            </Link>
            <Button type="submit">作成</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
