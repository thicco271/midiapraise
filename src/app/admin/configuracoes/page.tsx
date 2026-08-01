import { db } from "@/lib/db";
import { AdminGuard } from "@/components/praisehub/admin-guard";
import { ChurchSettingsForm } from "@/components/praisehub/church-settings-form";

export const metadata = { title: "Configurações · PraiseHub Admin" };

async function getSettings() {
  const s = await db.churchSettings.findUnique({ where: { id: "singleton" } });
  if (!s) return null;
  return {
    id: s.id,
    nomeDaIgreja: s.nomeDaIgreja,
    nomeDaAplicacao: s.nomeDaAplicacao,
    subtitulo: s.subtitulo,
    textoPrincipal: s.textoPrincipal,
    textoComplementar: s.textoComplementar,
    logo: s.logo,
    icone: s.icone,
    imagemDeCapa: s.imagemDeCapa,
    corPrimaria: s.corPrimaria,
    corDestaque: s.corDestaque,
    endereco: s.endereco,
    fusoHorario: s.fusoHorario,
  };
}

export default async function AdminConfigPage() {
  const settings = await getSettings();
  return (
    <AdminGuard>
      <div className="praise-container py-6 sm:py-8">
        <header className="mb-6">
          <p className="praise-eyebrow">Administração</p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Configurações da igreja</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Personalize a identidade visual e os textos institucionais exibidos na aplicação.
          </p>
        </header>
        {settings ? (
          <ChurchSettingsForm initial={settings} />
        ) : (
          <p className="text-sm text-muted-foreground">Configurações não encontradas.</p>
        )}
      </div>
    </AdminGuard>
  );
}
