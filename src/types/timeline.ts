export type TimelineStatus =
  | "versao" | "aprovado" | "devolvido" | "anexo" | "comentario" | "assinado" | "rejeitado";

export type TimelineItemModel = {
  id: string;
  status: TimelineStatus;
  title: string;
  author: { name: string; avatarUrl?: string };
  createdAt: string;
  description?: string;
  attachments?: { name: string; type: "pdf"|"doc"|"png"; size?: string }[];
};

export type DateGroup = { key: string; label: string; items: TimelineItemModel[] };


