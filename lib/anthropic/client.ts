import Anthropic from '@anthropic-ai/sdk';

export function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });
}

export const CLAUDE_MODEL = 'claude-sonnet-4-6';

export type AIRun = {
  text: string;
  inputTokens: number;
  outputTokens: number;
};

export async function runClaude(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<AIRun> {
  const client = getAnthropic();
  const resp = await client.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: opts.maxTokens ?? 4096,
    system: opts.system,
    messages: [{ role: 'user', content: opts.user }],
  });

  const text = resp.content
    .filter((block) => block.type === 'text')
    .map((block) => (block as { type: 'text'; text: string }).text)
    .join('\n');

  return {
    text,
    inputTokens: resp.usage.input_tokens,
    outputTokens: resp.usage.output_tokens,
  };
}
