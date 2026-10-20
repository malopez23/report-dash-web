import { hojeISO } from "../services/datas";

export interface DiaBurnup {
  data: string; // formato "2026-10-13", o mesmo do <input type="date">
  planejado: number;
  executado: number;
}

export interface Report {
  titulo: string;
  dataStatus: string; // "2026-10-13"
  totalCenarios: number;
  pendente: number;
  sucesso: number;
  falha: number;
  bloqueado: number;
  na: number;
  incNovo: number;
  incAndamento: number;
  incResolvido: number;
  incImprocedente: number;
  impeditivos: number;
  burnup: DiaBurnup[];
  pontos: string[];
}

export function criarReportVazio(): Report {
  return {
    titulo: "",
    dataStatus: hojeISO(),
    totalCenarios: 0,
    pendente: 0,
    sucesso: 0,
    falha: 0,
    bloqueado: 0,
    na: 0,
    incNovo: 0,
    incAndamento: 0,
    incResolvido: 0,
    incImprocedente: 0,
    impeditivos: 0,
    burnup: [],
    pontos: [],
  };
}
