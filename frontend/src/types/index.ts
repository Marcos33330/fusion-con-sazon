export type MediaPage = "HOME" | "NOSOTROS" | "TORTAS" | "CATERING" | "EVENTOS_FOTOS" | "EVENTOS_VIDEOS";
export type MediaType = "IMAGE" | "VIDEO";

export interface MediaItem {
  id: string;
  page: MediaPage;
  type: MediaType;
  category?: string | null;
  title?: string | null;
  url: string;
  order: number;
  createdAt: string;
}

export interface ContentBlock {
  title?: string | null;
  body: string;
}

export type ContentDict = Record<string, ContentBlock>;

export interface Testimonial {
  id: string;
  author: string;
  text: string;
  published: boolean;
  order: number;
}

export interface ContactInfo {
  id: string;
  phone: string;
  whatsapp: string;
  address: string;
  facebookUrl?: string | null;
  instagramUrl?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
}
