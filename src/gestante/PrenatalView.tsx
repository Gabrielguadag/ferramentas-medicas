import { useState } from 'react'
import { Alert, Card, Check, Details, Result, Results, Src } from '../shared/ui'
import { type Dia, diaDaSemana, fmtData } from '../shared/datas'
import { fmtIg, ig, igDias } from './ig'
import {
  COM_INDICACAO,
  INICIO_ATE,
  ITENS,
  type Item,
  type ItemNaIg,
  MINIMO_CONSULTAS,
  PERIODO_ROTULO,
  PROTOCOLO_LOCAL,
  type Periodo,
  frequencia,
  proximaConsulta,
  situacaoItens,
} from './prenatal'
import { C3, CADERNETA } from './sources'

function ItemTexto({ item }: { item: Item }) {
  return (
    <>
      {item.nome}
      {item.condicao ? <span className="muted"> ({item.condicao})</span> : null}
      {item.quando ? <span className="muted"> · {item.quando}</span> : null}
      {item.semOferta ? <span className="sem-oferta"> · {item.semOferta}</span> : null}
    </>
  )
}

function Lista({ itens }: { itens: ItemNaIg[] }) {
  return (
    <ul className="checklist">
      {itens.map((x) => (
        <li key={x.item.id}>
          <ItemTexto item={x.item} />
        </li>
      ))}
    </ul>
  )
}

/** O que pedir, o que já deveria ter sido feito e o que vem a seguir, numa IG. */
export function PrenatalNaIg(props: { dum: Dia; data: Dia }) {
  const [primeira, setPrimeira] = useState(false)
  const total = props.data - props.dum
  if (total < 0 || total >= igDias(42, 0)) return null

  const freq = frequencia(total)
  const proxima = props.dum + proximaConsulta(total)
  const itens = situacaoItens(total, primeira)
  const agoraExames = itens.filter((x) => x.status === 'agora' && x.item.tipo === 'exame')
  const agoraVacinas = itens.filter((x) => x.status === 'agora' && x.item.tipo === 'vacina')
  const atrasados = itens.filter((x) => x.status === 'atrasado')
  const proximos = itens.filter((x) => x.status === 'proximo')
  const grupos = new Map<number, ItemNaIg[]>()
  for (const x of proximos) grupos.set(x.abreEm, [...(grupos.get(x.abreEm) ?? []), x])
  const ordem = [...grupos.keys()].sort((a, b) => a - b)

  return (
    <Card
      title={`Pré-natal com ${fmtIg(ig(total))}`}
      subtitle={`Em ${fmtData(props.data)}, pela datação acima.`}
    >
      <Check label="Esta é a 1ª consulta de pré-natal" checked={primeira} onChange={setPrimeira} />
      {primeira && total > INICIO_ATE ? (
        <Alert tone="warn" title="Início depois da 12ª semana.">
          O ideal é começar o pré-natal até a 12ª semana. Peça agora os exames da 1ª consulta.
        </Alert>
      ) : null}

      <Results>
        <Result label="Consultas agora" value={freq.texto}>
          {freq.faixa} · próxima por volta de {fmtData(proxima)} ({diaDaSemana(proxima)})
        </Result>
        <Result label="Mínimo na gestação" value={`${MINIMO_CONSULTAS} consultas`}>
          intercaladas entre médico e enfermeiro, mais 1 consulta odontológica; a 1ª, de preferência
          até a 12ª semana
        </Result>
      </Results>

      <div className="grid2">
        <div>
          <h4 className="list-title">Solicitar agora</h4>
          {agoraExames.length ? <Lista itens={agoraExames} /> : <p className="empty">Nenhum.</p>}
          {agoraVacinas.length ? (
            <>
              <h4 className="list-title">Vacinas: verificar e aplicar</h4>
              <Lista itens={agoraVacinas} />
            </>
          ) : null}
        </div>
        <div>
          <h4 className="list-title">Já deveria ter sido feito</h4>
          {atrasados.length ? (
            <>
              <p className="hint-inline">Confira o resultado; se não foi feito, peça agora.</p>
              <Lista itens={atrasados} />
            </>
          ) : (
            <p className="empty">Nada pendente para esta IG.</p>
          )}
          {ordem.length ? (
            <>
              <h4 className="list-title">Próximos</h4>
              {ordem.map((d) => {
                const quando = props.dum + d
                return (
                  <div key={d} className="next-group">
                    <p className="next-when">
                      A partir de {fmtIg(ig(d))}: {fmtData(quando)}
                    </p>
                    <Lista itens={grupos.get(d) ?? []} />
                  </div>
                )
              })}
            </>
          ) : null}
        </div>
      </div>
      <p className="hint-inline">
        Pré-natal de risco habitual. Exames com indicação clínica e de alto risco estão em
        &ldquo;Consultas e exames&rdquo;.
      </p>
      <p className="hint-inline">{PROTOCOLO_LOCAL.resumo}</p>
    </Card>
  )
}

const PERIODOS: Periodo[] = ['t1', 't2', 't3', 'parto']

function ColunaExames({ itens }: { itens: Item[] }) {
  if (!itens.length) return <p className="empty">Nenhum.</p>
  return (
    <ul className="checklist">
      {itens.map((i) => (
        <li key={i.id}>
          <ItemTexto item={i} />
        </li>
      ))}
    </ul>
  )
}

/** Referência: calendário de consultas, exames por trimestre e vacinas. */
export function ConsultasExamesSection() {
  const vacinas = ITENS.filter((i) => i.tipo === 'vacina')
  return (
    <>
      <Card title="Consultas" subtitle="Programação mínima do pré-natal.">
        <ul className="checklist">
          <li>Começar o quanto antes, de preferência até a 12ª semana.</li>
          <li>
            No mínimo {MINIMO_CONSULTAS} consultas, intercaladas entre médico e enfermeiro, e ao
            menos 1 consulta odontológica.
          </li>
        </ul>
        <table className="compact">
          <thead>
            <tr>
              <th>Fase</th>
              <th>Frequência</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Até 28 semanas</td>
              <td>Mensal</td>
            </tr>
            <tr>
              <td>Da 28ª à 36ª semana</td>
              <td>Quinzenal</td>
            </tr>
            <tr>
              <td>A partir da 36ª semana</td>
              <td>Semanal</td>
            </tr>
            <tr>
              <td>Após o parto</td>
              <td>
                No mínimo 2 consultas: a 1ª na primeira semana após a saída da maternidade e a 2ª em
                torno de 30 dias após o parto
              </td>
            </tr>
          </tbody>
        </table>
        <p className="hint-inline">
          Não existe alta do pré-natal: o acompanhamento segue até o parto e o puerpério.
        </p>
      </Card>

      <Card title="Exames de rotina" subtitle="Pré-natal de risco habitual.">
        <p className="hint-inline">{PROTOCOLO_LOCAL.resumo}</p>
        {PERIODOS.map((p) => {
          const exames = ITENS.filter((i) => i.tipo === 'exame' && i.periodo === p)
          if (!exames.length) return null
          // 1ª coluna: para todas e feitos no município; 2ª: condicionais ou sem oferta local.
          const todas = exames.filter((i) => !i.condicao && !i.semOferta)
          const outros = exames.filter((i) => i.condicao || i.semOferta)
          return (
            <section key={p} className="periodo" aria-label={PERIODO_ROTULO[p]}>
              <h4 className="list-title">{PERIODO_ROTULO[p]}</h4>
              <div className="grid2">
                <div>
                  <p className="col-title">Para todas (feitos no município)</p>
                  <ColunaExames itens={todas} />
                </div>
                <div>
                  <p className="col-title">Condicionais ou sem oferta no município</p>
                  <ColunaExames itens={outros} />
                </div>
              </div>
            </section>
          )
        })}
        <section className="periodo" aria-label="Com indicação clínica">
          <h4 className="list-title">Com indicação clínica</h4>
          <ul className="checklist">
            {COM_INDICACAO.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </section>
        <section className="periodo" aria-label="Alto risco">
          <h4 className="list-title">Alto risco (conforme critério clínico)</h4>
          <p className="lead">
            Plaquetas, proteinúria de 24 horas, ureia, creatinina e ácido úrico, eletrocardiograma,
            ultrassonografia obstétrica com Doppler e cardiotocografia anteparto.
          </p>
        </section>
      </Card>

      <Card title="Vacinas">
        <ul className="checklist">
          {vacinas.map((i) => (
            <li key={i.id}>
              <ItemTexto item={i} />
            </li>
          ))}
          <li>
            Febre amarela e raiva (pré-exposição){' '}
            <span className="muted">(só em situações específicas, com avaliação individual)</span>
          </li>
        </ul>
        <p className="hint-inline">
          Vacina que não puder ser aplicada na gestação é oferecida após o parto.
        </p>
      </Card>

      <Details summary="Fontes">
        <p className="lead">
          A Caderneta 2026 é a lista oficial mais recente do Ministério da Saúde e substitui, nesses
          pontos, o Caderno de Atenção Básica 32 (2012).
        </p>
        <Src href={CADERNETA.url}>{CADERNETA.titulo}</Src>
        <Src href={C3.url}>{C3.titulo}</Src>
      </Details>
    </>
  )
}
