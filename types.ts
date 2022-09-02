export type NoteHeaderData = Omit<NoteData, 'htmlContent'>;

export type NoteData = {
  id: string;
  title: string;
  order: string;
  description: string;
  thumbnailURL: string;
  thumbnailAlt: string;
  htmlContent: string;
};

export type BlogData = {
  id: string;
  title: string;
  order: string;
  description: string;
  thumbnailURL: string;
  thumbnailAlt: string;
  htmlContent: string;
};

export type BlogHeaderData = Omit<BlogData, 'htmlContent'>;

export type ProjectCard = {
  href: string;
  title: string;
  order: string;
  description: string;
  thumbnailURL: string;
  thumbnailAlt: string;
};
