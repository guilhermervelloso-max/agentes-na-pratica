import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b-4 border-sol bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-tinta no-underline">
          <span aria-hidden className="rounded-[50%_50%_50%_8px] bg-mata px-2 py-1 text-sm text-white">AP</span>
          Agentes na Prática
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-semibold">
          <Link href="/agentes">Agentes</Link>
          <Link href="/temas">Temas</Link>
          <Link href="/salvos">Salvos</Link>
          <Link href="/sobre">Sobre</Link>
        </nav>
      </div>
    </header>
  );
}
