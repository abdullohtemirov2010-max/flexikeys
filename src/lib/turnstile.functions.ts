import { createServerFn } from '@tanstack/react-start';

/**
 * Verify a Cloudflare Turnstile token server-side.
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 */
export const verifyTurnstile = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string }) => {
    if (!data || typeof data.token !== 'string' || data.token.length < 10 || data.token.length > 2048) {
      throw new Error('Invalid token');
    }
    return { token: data.token };
  })
  .handler(async ({ data }) => {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) {
      // Fail-open in dev if secret missing, but log it.
      console.warn('[turnstile] TURNSTILE_SECRET_KEY not set — skipping verification');
      return { success: true, skipped: true };
    }

    const form = new FormData();
    form.append('secret', secret);
    form.append('response', data.token);

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: form,
    });
    const json = (await res.json()) as { success: boolean; 'error-codes'?: string[] };
    return { success: !!json.success, errors: json['error-codes'] ?? [] };
  });
