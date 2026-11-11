/** Só o que a cena 3D precisa de cada projeto (leve para ir do servidor para o navegador). */
export type OrbitProject = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  liveUrl: string | null;
  githubUrl: string | null;
  technologies: string[];
};
