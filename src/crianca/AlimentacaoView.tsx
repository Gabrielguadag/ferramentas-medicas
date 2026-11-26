import { useState } from 'react'
import { RadioGroup } from '../shared/NumberField'
import { Alert, Card, Details, Src } from '../shared/ui'
import type { DadosCrianca } from './CriancaPage'
import {
  DOZE_PASSOS,
  LEITES,
  type Leite,
  avisoLeiteVaca,
  cuidados,
  SUPLEMENTACAO_PREMATURO,
  etapa,
  plano,
  suplementacao,
} from './alimentacao'
import { fmtIdade } from './idade'
import { GUIA_MENORES_2, SBP_MANUAL } from './sources'

export function AlimentacaoSection(props: { dados: DadosCrianca }) {
  const [leite, setLeite] = useState<Leite>('materno')
  const { idade, igNascDias, correcao } = props.dados
  const meses = idade?.meses ?? null
  const p = meses !== null ? plano(leite, meses) : null
  const e = meses !== null ? etapa(meses) : null
  const avisoVaca = meses !== null ? avisoLeiteVaca(meses) : null
  const prematura = igNascDias !== null && igNascDias < 37 * 7
  const corrigindo = prematura && correcao?.vale === true
  const corrigida = corrigindo ? (correcao?.idade ?? null) : null

  return (
    <>
      <Card title="Leite que a criança recebe">
        <RadioGroup
          legend="Leite principal"
          value={leite}
          options={LEITES.map((o) =>
            o.value === 'vaca' && avisoVaca
              ? { ...o, label: `${o.label} (${avisoVaca.rotulo})` }
              : o,
          )}
          onChange={setLeite}
        />
        <p className="hint-inline">
          Sem leite materno, o padrão é a fórmula infantil até 1 ano (SBP). A orientação usa a idade
          cronológica (meses completos); no prematuro, vale também o aviso de idade corrigida. Se
          recebe leite materno e outro leite, o início dos outros alimentos depende da quantidade de
          cada um: orientação individual.
        </p>
      </Card>

      {p === null ? (
        <p className="empty">Preencha a data de nascimento para ver a orientação da idade.</p>
      ) : (
        <>
          {leite === 'vaca' && avisoVaca ? <Alert tone="warn">{avisoVaca.aviso}</Alert> : null}
          {corrigindo ? (
            <Alert tone="warn" title="Prematuro:">
              {corrigida ? `idade corrigida de ${fmtIdade(corrigida)}. ` : ''}Os outros alimentos
              começam depois dos 6 meses de idade cronológica e entre 4 e 6 meses de idade
              corrigida, com o desenvolvimento neuropsicomotor adequado para comer alimentos
              pastosos (SBP, pág. 31). Não adiar os alimentos que podem causar alergia. Depois do
              início, os tipos de alimentos e a forma de oferecer são os mesmos.
            </Alert>
          ) : null}

          <Card title={p.titulo} subtitle={`Guia alimentar, ${p.pagina}`}>
            {p.refeicoes.length ? (
              <table className="compact">
                <caption className="sr-only">Refeições do dia</caption>
                <thead>
                  <tr>
                    <th scope="col">Refeição</th>
                    <th scope="col">O que oferecer</th>
                  </tr>
                </thead>
                <tbody>
                  {p.refeicoes.map((r) => (
                    <tr key={r.nome}>
                      <th scope="row">{r.nome}</th>
                      <td>{r.oferta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : null}
            <ul className="checklist">
              {p.notas.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
            {p.refeicoes.length ? (
              <p className="hint-inline">
                {leite === 'materno'
                  ? 'O leite materno pode ser oferecido sempre que a criança quiser. '
                  : ''}
                Água ao longo do dia, em copo.
              </p>
            ) : null}
          </Card>

          {e ? (
            <Card
              title={`Como oferecer: ${e.titulo.toLowerCase()}`}
              subtitle={`Guia alimentar, ${e.pagina}`}
            >
              <div className="grid2">
                <div>
                  <h4 className="list-title">Consistência e forma</h4>
                  <ul className="checklist">
                    {e.como.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="list-title">Desenvolvimento ligado à alimentação</h4>
                  <ul className="checklist">
                    {e.desenvolvimento.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                  <h4 className="list-title">Sinais</h4>
                  <ul className="checklist">
                    <li>
                      <strong>Fome:</strong> {e.fome}
                    </li>
                    <li>
                      <strong>Saciedade:</strong> {e.saciedade}
                    </li>
                  </ul>
                </div>
              </div>
            </Card>
          ) : null}

          {meses !== null && meses < 24 ? (
            <Card title="Suplementação de rotina" subtitle="Criança nascida a termo">
              <ul className="checklist">
                {suplementacao(meses).map((c) => (
                  <li key={c.texto}>
                    {c.texto} <span className="muted">({c.pagina})</span>
                  </li>
                ))}
                <li>{SUPLEMENTACAO_PREMATURO}</li>
              </ul>
            </Card>
          ) : null}

          <Card title="Não oferecer e cuidados" subtitle="Para a idade atual">
            <ul className="checklist">
              {cuidados(meses as number).map((c) => (
                <li key={c.texto}>
                  {c.texto} <span className="muted">({c.pagina})</span>
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      <Details summary="Doze passos e fonte">
        <ol className="steps">
          {DOZE_PASSOS.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
        <p>
          A tela mostra o esquema do Guia para a idade em meses completos: aos 6 meses, de 7 a 8, de
          9 a 11 e de 12 a 23 meses (com leite de vaca: aos 4 meses e de 5 a 11 meses). Cada criança
          é única; o Guia pede para adaptar as orientações e avaliar a quantidade pelo crescimento
          na Caderneta da Criança.
        </p>
        <p>
          Leite de vaca integral antes de 1 ano: o padrão segue a SBP, que não o recomenda no
          primeiro ano de vida. O esquema do Guia do MS, que o admite quando não há acesso à
          fórmula, aparece como alternativa não indicada em condições gerais.
        </p>
        <Src href={GUIA_MENORES_2.url}>{GUIA_MENORES_2.titulo}</Src>
        <Src href={SBP_MANUAL.url}>{SBP_MANUAL.titulo}</Src>
      </Details>
    </>
  )
}
