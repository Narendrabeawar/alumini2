import { getSession } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

async function redeem(code: string, userId: string) {
  const supabase = await createClient();
  // fetch invite
  const { data: invite } = await supabase.from('invites').select('id, imported_alumni_id, status').eq('code', code).single();
  if (!invite) return { ok: false, error: 'Invalid code' };
  // attach to user
  const { error: up } = await supabase.from('invites').update({ redeemed_by: userId, redeemed_at: new Date().toISOString(), status: 'redeemed' }).eq('id', invite.id);
  if (up) return { ok: false, error: up.message };
  // mark imported row accepted
  await supabase.from('imported_alumni').update({ invite_status: 'accepted' }).eq('id', invite.imported_alumni_id);
  return { ok: true };
}

export default async function ClaimPage({ searchParams }: { searchParams: { code?: string } }) {
  const code = searchParams.code || '';
  const user = await getSession();

  if (!code) {
    return <div className="mx-auto max-w-xl px-4 py-12">Missing invite code.</div>;
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12">
        <h1 className="text-2xl font-semibold mb-3">Claim Invite</h1>
        <p className="text-zinc-600 mb-6">Please login using the invite.</p>
        <a href={`/login?code=${encodeURIComponent(code)}`}><Button>Login via invite</Button></a>
      </div>
    );
  }

  const result = await redeem(code, user.id);

  if (!result.ok) {
    return <div className="mx-auto max-w-xl px-4 py-12">{result.error}</div>;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-3">Invite claimed!</h1>
      <p className="text-zinc-600">Your account is linked. You can now complete your profile.</p>
      <div className="mt-6">
        <a href="/profile/setup"><Button>Continue</Button></a>
      </div>
    </div>
  );
}
