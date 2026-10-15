"use client";
import { useActionState } from "react";
import { adminLogin } from "../actions";

export function LoginForm({ email, password }: { email: boolean; password: boolean }) {
  const [state, action, pending] = useActionState(adminLogin, {});
  if (!email && !password) return <p className="mt-4 text-red-800">Nenhum método de login configurado (defina EMAIL_SERVER ou ADMIN_PASSWORD_HASH).</p>;
  return (
    <div className="mt-6 space-y-6">
      {state.error && <p className="rounded-lg bg-red-50 p-3 text-red-800">{state.error}</p>}
      {state.sent && <p className="rounded-lg bg-mata-claro p-3">Se o e-mail for o do admin, um link de acesso foi enviado.</p>}
      {email && (
        <form action={action} className="grid gap-2">
          <input type="hidden" name="method" value="email" />
          <label htmlFor="email" className="text-sm font-semibold">E-mail</label>
          <input id="email" name="email" type="email" required autoComplete="email" className="input" />
          <button className="btn w-fit" disabled={pending}>Enviar link de acesso</button>
        </form>
      )}
      {password && (
        <form action={action} className="grid gap-2">
          <input type="hidden" name="method" value="senha" />
          <label htmlFor="password" className="text-sm font-semibold">Senha</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" className="input" />
          <button className="btn w-fit" disabled={pending}>Entrar com senha</button>
        </form>
      )}
    </div>
  );
}
