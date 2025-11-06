import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

interface ImportedRow { id: string; full_name: string; email: string; grad_year: number | null; department: string | null; company: string | null; role: string | null; invite_status: string }

async function loadImported() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("imported_alumni")
    .select("id, full_name, email, grad_year, department, company, role, invite_status")
    .order("full_name");
  return (data as ImportedRow[]) ?? [];
}

export default async function InvitesPage() {
  await requireAdmin();
  const rows = await loadImported();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-2">Send Invites</h1>
      <p className="text-sm text-zinc-600 mb-6">Select imported alumni and generate invite codes. Share the claim link with them.</p>

      <form className="space-y-4" action={async (formData) => {
        'use server'
        const selected = (formData.getAll('sel') as string[]) || [];
        const supabase = await createClient();
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

        const codes = await Promise.all(selected.map(async (id) => {
          const code = crypto.randomUUID();
          await supabase.from('invites').insert({ imported_alumni_id: id, email: '', code, status: 'sent' });
          return { id, code, link: `${baseUrl}/invite/claim?code=${code}` };
        }));

        console.log('Generated invites', codes);
      }}>
        <div className="overflow-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-2"><input type="checkbox" disabled /></th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Year</th>
                <th className="p-2 text-left">Department</th>
                <th className="p-2 text-left">Company</th>
                <th className="p-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r: ImportedRow) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2"><input type="checkbox" name="sel" value={r.id} /></td>
                  <td className="p-2">{r.full_name}</td>
                  <td className="p-2">{r.email}</td>
                  <td className="p-2">{r.grad_year ?? '—'}</td>
                  <td className="p-2">{r.department ?? '—'}</td>
                  <td className="p-2">{r.company ?? '—'}</td>
                  <td className="p-2">{r.invite_status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button type="submit">Generate invites</Button>
      </form>

      <p className="text-sm text-zinc-500 mt-4">Note: For now, links are generated and can be copied from server logs or built from the code shown after generation. Email sending can be wired later.</p>
    </div>
  );
}
