/**
 * Linha do tempo que vira planetas na seção "Trajetória".
 * Edite à vontade: cada item vira um planeta (na ordem da lista, que também é a ordem das órbitas).
 * `label` é o nome curto que aparece no planeta; o resto aparece no cartão ao tocar nele.
 */
export type TimelineItem = {
  id: string;
  label: string;
  kind: "trabalho" | "estudo" | "certificação" | "projetos";
  title: string;
  place: string;
  period: string;
  description: string;
};

export const TIMELINE: TimelineItem[] = [
  {
    id: "unb-fisica",
    label: "UnB · Física",
    kind: "estudo",
    title: "Licenciatura em Física",
    place: "Universidade de Brasília (UnB)",
    period: "formação",
    description: "Formação em Física, que também alimenta o jeito de ensinar e de resolver problemas.",
  },
  {
    id: "brasil-central",
    label: "Brasil Central",
    kind: "trabalho",
    title: "Professor",
    place: "Centro Educacional Brasil Central",
    period: "fev/2023 – set/2025",
    description: "Aulas de física no Centro Educacional Brasil Central.",
  },
  {
    id: "edukhan",
    label: "Edukhan",
    kind: "trabalho",
    title: "Professor de matemática e física",
    place: "Instituto Edukhan de Resgate Acadêmico e Escolar",
    period: "abr/2023 – hoje",
    description: "Aulas de matemática e física no Instituto Edukhan, ONG de resgate acadêmico e escolar.",
  },
  {
    id: "dev",
    label: "Dev Full-Stack",
    kind: "projetos",
    title: "Desenvolvedor Full-Stack",
    place: "Projetos próprios e sistemas para a ONG Edukhan",
    period: "2024 – hoje",
    description: "Desde 2024 construo e publico projetos reais com React, Next.js, TypeScript e Node.js.",
  },
  {
    id: "freecodecamp",
    label: "freeCodeCamp",
    kind: "certificação",
    title: "Certificações",
    place: "freeCodeCamp",
    period: "certificações",
    description: "Responsive Web Design e JavaScript e bibliotecas front-end.",
  },
  {
    id: "salesiano",
    label: "Salesiano",
    kind: "trabalho",
    title: "Professor de Física",
    place: "Colégio Salesiano Núcleo Bandeirante",
    period: "set/2025 – hoje",
    description: "Aulas de física no Colégio Salesiano Núcleo Bandeirante.",
  },
  {
    id: "uninter",
    label: "UNINTER · ADS",
    kind: "estudo",
    title: "Análise e Desenvolvimento de Sistemas",
    place: "UNINTER",
    period: "cursando",
    description: "Graduação em Análise e Desenvolvimento de Sistemas, em andamento.",
  },
  {
    id: "fibmg-matematica",
    label: "FIBMG · Matemática",
    kind: "estudo",
    title: "Licenciatura em Matemática",
    place: "PROFOP, Faculdade Ibra de Minas Gerais (FIBMG)",
    period: "concluída em 09/11/2026",
    description: "Curso concluído em 09/11/2026, com colação de grau em 10/11/2026.",
  },
];
