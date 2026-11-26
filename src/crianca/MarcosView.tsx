import { useId, useState } from 'react'
import { Alert, Card, Details, Result, Results, Src, type Tone } from '../shared/ui'
import type { DadosCrianca } from './CriancaPage'
import { PREMATURO_ATE } from './idade'
import {
  ALTERACOES_FENOTIPICAS,
  CONDUTA,
  type Classe,
  FAIXAS,
  FATORES_RISCO,
  type FaixaMarcos,
  type FatorRisco,
  type Marco,
  type Resposta,
  SINAIS_ALERTA,
  classificar,
  faixaDe,
  rotuloFaixa,
} from './marcos'
import { CADERNETA_CRIANCA } from './sources'

const RESPOSTAS: { value: Resposta; label: string }[] = [
  { value: 'P', label: 'Presente' },
  { value: 'A', label: 'Ausente' },
  { value: 'NV', label: 'Não verificado' },
]

const TOM: Record<Classe, Tone> = {
  'provavel-atraso': 'danger',
  alerta: 'warn',
  adequado: 'ok',
}

export function MarcosSection(props: { dados: DadosCrianca }) {
  const { idade, correcao, igNascDias } = props.dados
  const [respostas, setRespostas] = useState<Partial<Record<string, Resposta>>>({})
  const [pc, setPc] = useState(false)
  const [fen, setFen] = useState(false)
  const [fatores, setFatores] = useState<FatorRisco[]>([])

  const usaCorrigida = correcao?.vale === true
  const idadeUsada = usaCorrigida ? correcao.idade : idade
  const prematura = igNascDias !== null && igNascDias < PREMATURO_ATE
  const fatoresAtivos = new Set<FatorRisco>(fatores)
  if (prematura) fatoresAtivos.add('prematuridade')

  const responder = (id: string, r: Resposta) => setRespostas((s) => ({ ...s, [id]: r }))
  const limpar = () => {
    setRespostas({})
    setPc(false)
    setFen(false)
    setFatores([])
  }

  let corpo
  if (!idade) {
    corpo = <p className="empty">Preencha a data de nascimento para ver os marcos da faixa.</p>
  } else if (usaCorrigida && !idadeUsada) {
    corpo = (
      <Alert tone="info">
        A idade corrigida ainda não chegou às 40 semanas: não há faixa de marcos para avaliar.
      </Alert>
    )
  } else {
    const meses = (idadeUsada ?? idade).meses
    const fi = faixaDe(meses)
    if (fi === null) {
      corpo = (
        <Alert tone="info" title="6 anos ou mais:">
          a Caderneta não traz marcos a partir dessa idade. Avalie como está o aprendizado na
          escola, a socialização com outras crianças, a fala e o comportamento (pág. 86).
        </Alert>
      )
    } else {
      const faixa = FAIXAS[fi] as FaixaMarcos
      const anterior = fi > 0 ? (FAIXAS[fi - 1] as FaixaMarcos) : null
      const temAusente = faixa.marcos.some((m) => respostas[m.id] === 'A')
      const av = classificar({
        faixa: fi,
        respostas,
        pcAlterado: pc,
        fenotipicas3: fen,
        fatoresRisco: fatoresAtivos.size,
      })
      corpo = (
        <>
          <Card
            title={
              faixa.de === 0 ? 'Marcos do nascimento a 1 mês' : `Marcos de ${rotuloFaixa(faixa)}`
            }
            subtitle={`Faixa da idade${usaCorrigida ? ' corrigida' : ''} (${meses} ${meses === 1 ? 'mês' : 'meses'} completos). A ausência de qualquer marco da faixa é alerta, mesmo no início dela.`}
          >
            <MarcosLista marcos={faixa.marcos} respostas={respostas} onResposta={responder} />
          </Card>

          {temAusente && anterior ? (
            <Card
              title={`Faixa anterior: ${rotuloFaixa(anterior)}`}
              subtitle="Falta marco da faixa atual: verifique se a criança cumpre os marcos da faixa anterior."
            >
              <MarcosLista marcos={anterior.marcos} respostas={respostas} onResposta={responder} />
            </Card>
          ) : null}

          <Card title="Outros dados da avaliação">
            <div className="stack">
              <label className="check">
                <input type="checkbox" checked={pc} onChange={(e) => setPc(e.target.checked)} />
                <span>Perímetro cefálico &lt; -2 ou &gt; +2 escores Z</span>
              </label>
              <label className="check">
                <input type="checkbox" checked={fen} onChange={(e) => setFen(e.target.checked)} />
                <span>
                  3 ou mais alterações fenotípicas{' '}
                  <span className="muted">({ALTERACOES_FENOTIPICAS.join(', ')})</span>
                </span>
              </label>
              <fieldset className="field">
                <legend>Fatores de risco</legend>
                <div className="choices column">
                  {FATORES_RISCO.map((f) => {
                    const auto = f.id === 'prematuridade' && prematura
                    return (
                      <label key={f.id} className="check">
                        <input
                          type="checkbox"
                          checked={auto || fatores.includes(f.id)}
                          disabled={auto}
                          onChange={(e) =>
                            setFatores((s) =>
                              e.target.checked ? [...s, f.id] : s.filter((x) => x !== f.id),
                            )
                          }
                        />
                        <span>
                          {f.texto}
                          {auto ? <span className="muted"> (pela IG ao nascer)</span> : null}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </fieldset>
            </div>
          </Card>

          <Card
            title="Classificação"
            subtitle="Instrumento de Avaliação do Desenvolvimento Integral"
          >
            {av.classe === 'incompleta' ? (
              <p className="empty">
                {av.falta === 'faixa'
                  ? temAusente
                    ? 'Já há marco ausente: a classificação é no mínimo alerta. Marque os demais marcos da faixa como presente ou ausente para concluir.'
                    : 'Marque cada marco da faixa como presente ou ausente.'
                  : 'Marque os marcos da faixa anterior como presente ou ausente.'}
              </p>
            ) : (
              <Results>
                <Result
                  label="Classificação"
                  value={CONDUTA[av.classe].titulo}
                  tone={TOM[av.classe]}
                >
                  {av.motivos.join(' ')}
                </Result>
                <div className="result tone-neutral">
                  <span className="result-label">Conduta</span>
                  <ul className="checklist">
                    {CONDUTA[av.classe].conduta.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                </div>
              </Results>
            )}
            <div className="actions">
              <button type="button" className="secondary" onClick={limpar}>
                Limpar marcações
              </button>
            </div>
          </Card>
        </>
      )
    }
  }

  return (
    <>
      {corpo}
      <Details summary="Sinais de alerta">
        <p>Fazem suspeitar de problema no desenvolvimento (Caderneta, pág. 53):</p>
        <ul className="checklist">
          {SINAIS_ALERTA.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Details>
      <Details summary="Todas as faixas">
        <table className="compact">
          <caption className="sr-only">Marcos por faixa etária</caption>
          <thead>
            <tr>
              <th scope="col">Faixa</th>
              <th scope="col">Marcos</th>
            </tr>
          </thead>
          <tbody>
            {FAIXAS.map((f) => (
              <tr key={f.de}>
                <th scope="row">{rotuloFaixa(f)}</th>
                <td>{f.marcos.map((m) => m.nome).join(' · ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Details>
      <Details>
        <ul className="checklist">
          <li>
            No dia em que a criança completa o mês do limite (ex.: 4 meses), já vale a faixa
            seguinte.
          </li>
          <li>
            Só use a informação do cuidador nos itens em que o texto de como pesquisar a prevê; nos
            demais, observe a criança (Caderneta, pág. 78).
          </li>
          <li>
            A faixa vem da idade em meses completos. Em prematuros (&lt; 37 semanas), usa-se a idade
            corrigida: diminui-se da idade o tempo que faltou para 40 semanas. Corrige-se até 2 anos
            de idade cronológica, ou até 3 anos se nasceu com menos de 28 semanas.
          </li>
          <li>
            <strong>Provável atraso:</strong> perímetro cefálico &lt; -2 ou &gt; +2 escores Z; ou 3
            ou mais alterações fenotípicas; ou ausência de 1 ou mais marcos da faixa anterior (na
            faixa de 0 a 1 mês, basta faltar 1 marco da própria faixa).
          </li>
          <li>
            <strong>Alerta:</strong> ausência de 1 ou mais marcos da própria faixa; ou todos
            presentes, mas com 1 ou mais fatores de risco.
          </li>
          <li>
            <strong>Adequado:</strong> todos os marcos da faixa presentes, sem fatores de risco.
          </li>
          <li>
            Na consulta de retorno, refaça a classificação. Oriente a estimulação conforme a faixa
            etária (Caderneta, pág. 37 a 52).
          </li>
        </ul>
        <Src href={CADERNETA_CRIANCA.url}>{CADERNETA_CRIANCA.titulo}</Src>
      </Details>
    </>
  )
}

function MarcosLista(props: {
  marcos: Marco[]
  respostas: Partial<Record<string, Resposta>>
  onResposta: (id: string, r: Resposta) => void
}) {
  return (
    <div className="marcos">
      {props.marcos.map((m) => (
        <MarcoField
          key={m.id}
          marco={m}
          value={props.respostas[m.id] ?? 'NV'}
          onChange={(r) => props.onResposta(m.id, r)}
        />
      ))}
    </div>
  )
}

function MarcoField(props: { marco: Marco; value: Resposta; onChange: (r: Resposta) => void }) {
  const name = useId()
  return (
    <div className="marco">
      <fieldset>
        <legend>{props.marco.nome}</legend>
        <p className="muted">{props.marco.como}</p>
        <div className="choices">
          {RESPOSTAS.map((o) => (
            <label key={o.value}>
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={props.value === o.value}
                onChange={() => props.onChange(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
