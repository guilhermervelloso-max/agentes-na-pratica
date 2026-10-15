import type { Metadata } from "next";
import { SavedList } from "./SavedList";

export const metadata: Metadata = { title: "Seus salvos", robots: { index: false } };

export default function Salvos() {
  return (
    <>
      <h1 className="text-3xl font-extrabold">Seus salvos</h1>
      <p className="mt-2 text-mute">Ficam guardados só neste navegador. Não há conta nem login.</p>
      <SavedList />
    </>
  );
}
