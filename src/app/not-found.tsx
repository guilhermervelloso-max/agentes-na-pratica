import Link from "next/link";
export default function NotFound() {
  return (<div className="py-16 text-center"><h1 className="text-3xl font-extrabold">Página não encontrada</h1><p className="mt-4"><Link href="/">Voltar ao início</Link></p></div>);
}
