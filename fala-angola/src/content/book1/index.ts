import type { Week, WeekStub } from "../types";
import week1 from "./week1.json";

export const book = {
  id: "book1",
  title: "Português Inicial para Estrangeiros",
  level: "A1",
  season: "Temporada 1: Chegada",
  author: "Professora Lisandra Almeida",
};

// Full lesson data, one entry per week that has been converted.
export const weeks: Week[] = [week1 as Week];

// The whole season, one week per booklet unit.
export const season: WeekStub[] = [
  { number: 1, title: "Olá! Eu sou a Isa!", titleEn: "Greetings and ser", game: "Hora Certa", mission: "Bom dia, Luanda", status: "ready" },
  { number: 2, title: "Olá! Eu tenho 20 anos", titleEn: "Ter, numbers 11-20", game: "Liga-me", mission: "Swap numbers with Márcio", status: "planned" },
  { number: 3, title: "Eu sou angolano!", titleEn: "Estar, nationalities", game: "Ser ou Estar", mission: "Passport control", status: "planned" },
  { number: 4, title: "Estou a morrer de fome!", titleEn: "Food and drink", game: "Mesa Angolana", mission: "Lunch on the Ilha", status: "planned" },
  { number: 5, title: "Minha rotina diária", titleEn: "Daily routine", game: "Um Dia em Luanda", mission: "Tell Isa about your day", status: "planned" },
  { number: 6, title: "Família e relacionamentos", titleEn: "Family", game: "Árvore", mission: "Introduce your family", status: "planned" },
  { number: 7, title: "Quanto custa?", titleEn: "Shopping in kwanzas", game: "Mercado", mission: "Buy clothes at a stall", status: "planned" },
  { number: 8, title: "Estou perdida!", titleEn: "Directions and transport", game: "Candongueiro Rush", mission: "Find the pharmacy", status: "planned" },
  { number: 9, title: "No médico e emergências", titleEn: "Health and emergencies", game: "Triagem", mission: "Call for help", status: "planned" },
  { number: 10, title: "Unidade 10", titleEn: "Coming soon", game: "", mission: "", status: "awaiting-content" },
  { number: 11, title: "Unidade 11", titleEn: "Coming soon", game: "", mission: "", status: "awaiting-content" },
  { number: 12, title: "Unidade 12", titleEn: "Coming soon", game: "", mission: "", status: "awaiting-content" },
];
