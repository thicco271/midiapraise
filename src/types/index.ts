// ADSA Reimberg Mídias - Tipos compartilhados
// Espelham parcialmente os modelos Prisma + respostas de API

export type Perfil = "administrador" | "editor" | "aprovador" | "fotografo" | "equipe_midia" | "visitante";

export type EventStatus =
  | "rascunho"
  | "em_producao"
  | "aguardando_aprovacao"
  | "ajustes_solicitados"
  | "aprovado"
  | "programado"
  | "publicado"
  | "encerrado"
  | "arquivado"
  | "cancelado";

export type Visibilidade = "publico" | "somente_equipe" | "somente_autenticados" | "privado";

export interface ProfileDTO {
  id: string;
  nome: string;
  email: string;
  avatar?: string | null;
  perfil: Perfil;
  status: "ativo" | "suspenso" | "inativo";
  ultimoAcesso?: string | null;
  criadoEm: string;
}

export interface EventCategoryDTO {
  id: string;
  nome: string;
  icone?: string | null;
  ativo: boolean;
  ordem: number;
}

export interface EventDTO {
  id: string;
  nome: string;
  slug: string;
  categoriaId?: string | null;
  categoria?: EventCategoryDTO | null;
  descricao?: string | null;
  data: string; // ISO
  horarioInicio: string;
  horarioFim?: string | null;
  local?: string | null;
  endereco?: string | null;
  tema?: string | null;
  versiculo?: string | null;
  pregador?: string | null;
  ministerio?: string | null;
  capa?: string | null;
  status: EventStatus;
  visibilidade: Visibilidade;
  destaqueManual: boolean;
  publicadoEm?: string | null;
  observacoesInternas?: string | null;
  criadoPorId?: string | null;
  criadoPor?: ProfileDTO | null;
  atualizadoPor?: ProfileDTO | null;
  criadoEm: string;
  atualizadoEm: string;
}

export interface ChurchSettingsDTO {
  id: string;
  nomeDaIgreja: string;
  nomeDaAplicacao: string;
  subtitulo: string;
  textoPrincipal: string;
  textoComplementar: string;
  logo?: string | null;
  icone?: string | null;
  imagemDeCapa?: string | null;
  corPrimaria: string;
  corDestaque: string;
  endereco?: string | null;
  fusoHorario: string;
}

export interface DashboardData {
  proximoCulto: EventDTO | null;
  eventosDaSemana: EventDTO[];
  eventosSemArte: EventDTO[];
  ultimosEventos: EventDTO[];
  totalEventos: number;
  totalPublicados: number;
  totalRascunhos: number;
}

export type MediaType = "whatsapp" | "rede_social" | "banner_telao" | "outros";

export interface MediaVersionDTO {
  id: string;
  numeroDaVersao: number;
  caminhoDoArquivo: string;
  caminhoThumbnail?: string | null;
  nomeOriginal: string;
  nomePadronizado: string;
  extensao: string;
  mimeType: string;
  tamanho: number;
  largura?: number | null;
  altura?: number | null;
  arquivoOficial: boolean;
  enviadoEm: string;
}

export interface MediaAssetDTO {
  id: string;
  eventoId: string;
  nome: string;
  tipo: MediaType;
  status: "rascunho" | "em_aprovacao" | "aprovado" | "publicado" | "arquivado";
  visibilidade: "publico" | "privado";
  versaoAtual: number;
  textoDeDivulgacao?: string | null;
  observacoes?: string | null;
  quantidadeDownloads: number;
  criadoEm: string;
  atualizadoEm: string;
  versaoOficial?: MediaVersionDTO | null;
  versoes: MediaVersionDTO[];
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ============================================================
// GALERIA DE FOTOS (Fase 4)
// ============================================================

export interface AlbumPhotoDTO {
  id: string;
  albumId: string;
  caminhoOriginal: string;
  caminhoOtimizado?: string | null;
  caminhoThumbnail?: string | null;
  nomeOriginal: string;
  legenda?: string | null;
  ordem: number;
  status: "rascunho" | "publicado" | "arquivado";
  enviadoEm: string;
  largura?: number | null;
  altura?: number | null;
  tamanho?: number | null;
  mimeType?: string | null;
}

export interface AlbumDTO {
  id: string;
  eventoId?: string | null;
  nome: string;
  slug: string;
  descricao?: string | null;
  fotografo?: string | null;
  capaPhotoId?: string | null;
  status: "rascunho" | "publicado" | "arquivado";
  visibilidade: "publico" | "somente_equipe" | "somente_autenticados" | "privado";
  permitirDownload: boolean;
  aceitarContribuicoes: boolean;
  criadoEm: string;
  atualizadoEm: string;
  publicadoEm?: string | null;
  fotoCapa?: AlbumPhotoDTO | null;
  totalFotos: number;
}
