"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Check, LogOut, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import Link from "next/link";

type CentralApp = { id: "ajudante" | "finorya" | "lingua-memory"; name: string; connected: boolean; available: boolean };
type ManagedAccount = { id: string; name: string; username: string; role: string; active: number; account_type?: string; expires_at?: number | null; expired?: boolean; created_at?: number };

const fallbackApps: CentralApp[] = [
  { id: "ajudante", name: "Ajudante Elétrico", connected: false, available: true },
  { id: "finorya", name: "Finorya", connected: false, available: true },
  { id: "lingua-memory", name: "Lingua Memory", connected: false, available: false },
];

export default function RestrictedArea() {
  const [session, setSession] = useState(false);
  const [apps, setApps] = useState<CentralApp[]>(fallbackApps);
  const [selectedApp, setSelectedApp] = useState<CentralApp["id"]>("ajudante");
  const [accounts, setAccounts] = useState<ManagedAccount[]>([]);
  const [login, setLogin] = useState({ username: "", password: "" });
  const [form, setForm] = useState({ name: "", username: "", password: "", accountType: "customer", durationMonths: "12" });
  const [message, setMessage] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState(false);

  const activeApp = useMemo(() => apps.find((app) => app.id === selectedApp) ?? apps[0], [apps, selectedApp]);
  const linguaSelected = selectedApp === "lingua-memory";

  const request = useCallback(async (path: string, init?: RequestInit) => {
    const response = await fetch(path, { ...init, headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) } });
    const data = (await response.json().catch(() => ({}))) as { error?: string; users?: ManagedAccount[]; apps?: CentralApp[]; user?: unknown };
    if (!response.ok) throw new Error(data.error || "Não foi possível concluir a operação.");
    return data;
  }, []);

  const loadAccounts = useCallback(async (appId: CentralApp["id"] = selectedApp) => {
    const data = await request(`/api/central/accounts?appId=${encodeURIComponent(appId)}`);
    setAccounts(data.users ?? []);
  }, [request, selectedApp]);

  useEffect(() => {
    void (async () => {
      try {
        const data = await request("/api/central/session");
        if (data.user) {
          setSession(true);
          await loadAccounts();
        }
        const appsData = await request("/api/central/apps");
        if (appsData.apps?.length) setApps(appsData.apps);
      } catch {
        // The static catalog remains usable when the Worker API is not running locally.
      }
    })();
  }, [loadAccounts, request]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await request("/api/central/session/login", { method: "POST", body: JSON.stringify(login) });
      setSession(true);
      setLogin({ username: "", password: "" });
      await loadAccounts();
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Login inválido.", error: true });
    } finally { setBusy(false); }
  }

  async function submitAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeApp?.available) return;
    setBusy(true);
    setMessage(null);
    const body = { appId: selectedApp, name: form.name, username: form.username, password: form.password, accountType: form.accountType, ...(form.accountType === "customer" ? { durationMonths: Number(form.durationMonths) } : {}) };
    try {
      await request("/api/central/accounts", { method: "POST", body: JSON.stringify(body) });
      setForm({ name: "", username: "", password: "", accountType: "customer", durationMonths: "12" });
      await loadAccounts();
      setMessage({ text: `Conta criada no ${activeApp.name}.` });
    } catch (error) {
      setMessage({ text: error instanceof Error ? error.message : "Não foi possível criar a conta.", error: true });
    } finally { setBusy(false); }
  }

  async function toggleAccount(account: ManagedAccount) {
    setBusy(true); setMessage(null);
    try {
      await request("/api/central/accounts", { method: "PATCH", body: JSON.stringify({ appId: selectedApp, id: account.id, name: account.name, username: account.username, password: "", active: !Boolean(account.active) }) });
      await loadAccounts();
      setMessage({ text: account.active ? "Conta suspensa." : "Conta reativada." });
    } catch (error) { setMessage({ text: error instanceof Error ? error.message : "Não foi possível alterar a conta.", error: true }); }
    finally { setBusy(false); }
  }

  async function removeAccount(account: ManagedAccount) {
    if (!window.confirm(`Excluir a conta ${account.username}? Esta ação não pode ser desfeita.`)) return;
    setBusy(true); setMessage(null);
    try {
      await request("/api/central/accounts", { method: "DELETE", body: JSON.stringify({ appId: selectedApp, id: account.id }) });
      await loadAccounts(); setMessage({ text: "Conta excluída." });
    } catch (error) { setMessage({ text: error instanceof Error ? error.message : "Não foi possível excluir a conta.", error: true }); }
    finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/central/session/logout", { method: "POST" });
    setSession(false); setAccounts([]); setMessage(null);
  }

  if (!session) return (
    <main className="central-admin-shell">
      <Link className="admin-back-link" href="/"><ArrowLeft size={16} /> Voltar para a Central</Link>
      <section className="admin-login-card" aria-labelledby="login-title">
        <span className="admin-symbol"><ShieldCheck size={27} /></span>
        <p className="eyebrow">ÁREA ADMINISTRATIVA</p>
        <h1 id="login-title">Contas dos aplicativos.</h1>
        <p className="admin-intro">Crie e administre acessos de todos os produtos em um só lugar.</p>
        <form onSubmit={submitLogin} className="admin-form">
          <label>Usuário<input autoComplete="username" value={login.username} onChange={(event) => setLogin({ ...login, username: event.target.value })} required /></label>
          <label>Senha<input type="password" autoComplete="current-password" value={login.password} onChange={(event) => setLogin({ ...login, password: event.target.value })} required /></label>
          {message && <p className={`admin-message ${message.error ? "error" : ""}`} role="alert">{message.text}</p>}
          <button className="button primary admin-submit" disabled={busy}>{busy ? "Entrando…" : "Entrar na administração"}<ArrowLeft size={17} className="admin-submit-arrow" /></button>
        </form>
      </section>
    </main>
  );

  return (
    <main className="central-admin-shell">
      <header className="admin-topbar"><Link className="admin-back-link" href="/"><ArrowLeft size={16} /> Central Simples</Link><button className="admin-logout" onClick={logout}><LogOut size={16} /> Sair</button></header>
      <section className="admin-heading"><div><p className="eyebrow">ÁREA ADMINISTRATIVA</p><h1>Gerenciar contas.</h1><p className="admin-intro">Escolha um aplicativo para criar, suspender ou remover acessos.</p></div><ShieldCheck size={42} /></section>
      <div className="admin-app-tabs" role="tablist" aria-label="Aplicativo">
        {apps.map((app) => <button key={app.id} role="tab" aria-selected={selectedApp === app.id} disabled={!app.available} className={selectedApp === app.id ? "active" : ""} onClick={() => { setSelectedApp(app.id); void loadAccounts(app.id).catch((error: Error) => setMessage({ text: error.message, error: true })); }}>{app.name}{!app.available && <small>Integração pendente</small>}</button>)}
      </div>
      {activeApp && activeApp.available ? <div className="admin-grid">
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">NOVO ACESSO</p><h2>Criar conta no {activeApp.name}</h2></div><Plus size={24} /></div>
          <form onSubmit={submitAccount} className="admin-form">
            <label>Nome<input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required maxLength={120} /></label>
            <label>{linguaSelected ? "E-mail" : "Usuário"}<input type={linguaSelected ? "email" : "text"} autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} pattern={linguaSelected ? undefined : "[a-zA-Z0-9][a-zA-Z0-9._@-]*"} minLength={3} maxLength={linguaSelected ? 254 : 64} required /></label>
            <label>Senha inicial<input type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} minLength={12} maxLength={128} required /></label>
            <div className="admin-form-row"><label>Tipo<select value={form.accountType} onChange={(event) => setForm({ ...form, accountType: event.target.value })}><option value="customer">Cliente</option><option value="trial">Teste de 7 dias</option></select></label>{form.accountType === "customer" && <label>Prazo<select value={form.durationMonths} onChange={(event) => setForm({ ...form, durationMonths: event.target.value })}><option value="1">1 mês</option><option value="3">3 meses</option><option value="6">6 meses</option><option value="12">12 meses</option></select></label>}</div>
            {message && <p className={`admin-message ${message.error ? "error" : ""}`} role="alert">{message.text}</p>}
            <button className="button primary admin-submit" disabled={busy}>{busy ? "Salvando…" : "Criar conta"}<Check size={17} /></button>
          </form>
        </section>
        <section className="admin-panel"><div className="admin-panel-heading"><div><p className="eyebrow">ACESSOS EXISTENTES</p><h2>Contas do aplicativo</h2></div><button className="admin-icon-button" onClick={() => void loadAccounts()} aria-label="Atualizar contas"><RefreshCw size={18} /></button></div>
          {accounts.length === 0 ? <p className="admin-empty">Nenhuma conta de cliente cadastrada.</p> : <ul className="admin-accounts">{accounts.filter((account) => account.role === "user").map((account) => <li key={account.id}><div><strong>{account.name}</strong><small>{account.username} · {account.active ? "Ativa" : "Suspensa"}</small></div><div className="admin-account-actions"><button onClick={() => void toggleAccount(account)} disabled={busy}>{account.active ? "Suspender" : "Reativar"}</button><button className="danger" onClick={() => void removeAccount(account)} disabled={busy} aria-label={`Excluir ${account.username}`}><Trash2 size={15} /></button></div></li>)}</ul>}
        </section>
      </div> : <section className="admin-panel admin-pending"><ShieldCheck size={30} /><h2>Lingua Memory</h2><p>A integração segura do banco do Lingua Memory precisa ser concluída antes de criar contas por aqui.</p></section>}
      {message && !activeApp?.available && <p className="admin-message error" role="alert">{message.text}</p>}
    </main>
  );
}
