export default function ConfirmPage() {
  return (
    <div className="text-center">
      <h1 className="text-2xl font-semibold tracking-tight mb-4">メールを確認してください</h1>
      <p className="text-fg-muted text-sm leading-relaxed">
        登録いただいたメールアドレスに確認リンクを送信しました。
        <br />
        リンクをクリックしてアカウントを有効化してください。
      </p>
    </div>
  );
}
