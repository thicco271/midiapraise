// Cliente Supabase para Storage (uploads em nuvem)
// Substitui o salvamento em disco local (que não funciona na Vercel)
import { createClient } from "@supabase/supabase-js";

// Credenciais do Supabase (anon key é pública por design — segura no código)
// Fallback para caso as variáveis de ambiente não estejam configuradas
const supabaseUrl = process.env.SUPABASE_URL || "https://hlvimdqsrwnlivnstpnr.supabase.co";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "sb_publishable_w3YgOEaAY0kMgL3RcILW1Q_WRBSxba5";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const SUPABASE_BUCKET = "midias";

/**
 * Faz upload de um arquivo para o Supabase Storage
 * Retorna a URL pública do arquivo
 */
export async function uploadToSupabase(
  buffer: Buffer,
  path: string,
  contentType: string,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(path, buffer, {
      contentType,
      upsert: true,
    });

  if (error) {
    console.error("[supabase-upload] Erro:", error);
    throw new Error(`Falha no upload: ${error.message}`);
  }

  // Retorna a URL pública
  const { data: urlData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(path);

  return urlData.publicUrl;
}

/**
 * Gera um caminho único para o arquivo no Supabase Storage
 * Formato: eventos/<evento-slug>/<tipo>/<nome-arquivo>
 */
export function gerarCaminhoStorage(
  eventoSlug: string,
  tipo: string,
  nomeArquivo: string,
): string {
  return `eventos/${eventoSlug}/${tipo}/${nomeArquivo}`;
}

/**
 * Gera um caminho único para foto de álbum no Supabase Storage
 * Formato: albuns/<album-slug>/<nome-arquivo>
 */
export function gerarCaminhoAlbum(
  albumSlug: string,
  nomeArquivo: string,
): string {
  return `albuns/${albumSlug}/${nomeArquivo}`;
}
