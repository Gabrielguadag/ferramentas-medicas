import { useState } from 'react'
import { DateField } from '../shared/DateField'
import { NumberField, RadioGroup } from '../shared/NumberField'
import { Alert, Card, Details, Result, Results, Src, type Tone } from '../shared/ui'
import { type Dia, diaDaSemana, fmtData, hojeIso, parseIso } from './datas'
import {
  type Comparacao,
  MARCOS,
  type PeriodoMes,
  type Situacao,
  TABELA_REDATACAO,
  compararDumUsg,
  dataParaIg,
  dppDe,
  dppNaegele,
  dumPorDpp,
  dumPorPeriodo,
  dumPorTransferencia,
  dumPorUsg,
  fmtIg,
  fmtIgLongo,
  igEm,
  trimestre,
  situacao,
} from './ig'
import { ACOG_700, CAB_32 } from './sources'

type Metodo = 'dum' | 'usg' | 'dpp' | 'fiv'

const METODOS: { value: Metodo; label: string }[] = [
  { value: 'dum', label: 'DUM' },
  { value: 'usg', label: 'Ultrassonografia' },
  { value: 'dpp', label: 'DPP' },
  { value: 'fiv', label: 'FIV (transferência)' },
]

const PERIODOS: { value: PeriodoMes; label: string }[] = [
  { value: 'inicio', label: 'Início (dia 5)' },
  { value: 'meio', label: 'Meio (dia 15)' },
  { value: 'fim', label: 'Fim (dia 25)' },
]

const okSemanas = (s: number | null, d: number | null) =>
  s !== null &&
  Number.isInteger(s) &&
  s >= 0 &&
  s <= 44 &&
  (d === null || (Number.isInteger(d) && d >= 0 && d <= 6))

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

function quando(data: Dia, hoje: Dia | null): string {
  if (hoje === null || data === hoje) return 'hoje'
  const n = Math.abs(data - hoje)
  return data < hoje ? `há ${plural(n, 'dia', 'dias')}` : `daqui a ${plural(n, 'dia', 'dias')}`
}

const SITUACAO: Record<Situacao, { tone: Tone; texto: string } | null> = {
  'em-curso': null,
  'antes-dum': {
    tone: 'warn',
    texto: 'A data escolhida é anterior à DUM: ainda não havia gestação nessa data.',
  },
  termo: { tone: 'ok', texto: 'Termo (a partir de 37 semanas).' },
  prolongada: {
    tone: 'warn',
    texto: 'Gestação prolongada (pós-datismo): entre 40 e 42 semanas.',
  },
  'prolongada-41': {
    tone: 'warn',
    texto:
      'Gestação prolongada com 41 semanas ou mais: encaminhar para avaliação do bem-estar fetal (índice de líquido amniótico e monitoramento cardíaco fetal).',
  },
  'pos-termo': { tone: 'danger', texto: 'Pós-termo: 42 semanas ou mais.' },
  implausivel: {
    tone: 'warn',
    texto: 'Mais de 44 semanas: a data está fora do período de uma gestação. Confira as datas.',
  },
}

export function IdadeGestacionalSection() {
  const hoje = hojeIso()
  const [metodo, setMetodo] = useState<Metodo>('dum')
  const [ref, setRef] = useState(hoje)

  // DUM
  const [dumCerta, setDumCerta] = useState<'certa' | 'periodo'>('certa')
  const [dum, setDum] = useState('')
  const [mesDum, setMesDum] = useState('')
  const [periodo, setPeriodo] = useState<PeriodoMes>('meio')
  // USG
  const [exame, setExame] = useState('')
  const [usgS, setUsgS] = useState<number | null>(null)
  const [usgD, setUsgD] = useState<number | null>(null)
  const [dumCompara, setDumCompara] = useState('')
  const [adotada, setAdotada] = useState<'sugerida' | 'dum' | 'usg'>('sugerida')
  // DPP e FIV
  const [dpp, setDpp] = useState('')
  const [transf, setTransf] = useState('')
  const [embriao, setEmbriao] = useState<'3' | '5'>('5')

  const hojeDia = parseIso(hoje)
  const refDia = parseIso(ref)

  // ---- Datação escolhida → DUM equivalente ----
  let dumEq: Dia | null = null
  let comparacao: Comparacao | null = null
  let usandoUsg = false
  if (metodo === 'dum') {
    if (dumCerta === 'certa') dumEq = parseIso(dum)
    else {
      const m = /^(\d{4})-(\d{2})$/.exec(mesDum)
      if (m) dumEq = dumPorPeriodo(Number(m[1]), Number(m[2]), periodo)
    }
  } else if (metodo === 'usg') {
    const ex = parseIso(exame)
    if (ex !== null && okSemanas(usgS, usgD)) {
      const pelaUsg = dumPorUsg(ex, usgS as number, usgD ?? 0)
      const dc = parseIso(dumCompara)
      comparacao = dc === null ? null : compararDumUsg(dc, ex, usgS as number, usgD ?? 0)
      if (dc !== null && comparacao) {
        const escolha = adotada === 'sugerida' ? (comparacao.redatar ? 'usg' : 'dum') : adotada
        usandoUsg = escolha === 'usg'
        dumEq = usandoUsg ? pelaUsg : dc
      } else {
        usandoUsg = true
        dumEq = pelaUsg
      }
    }
  } else if (metodo === 'dpp') {
    const v = parseIso(dpp)
    if (v !== null) dumEq = dumPorDpp(v)
  } else {
    const v = parseIso(transf)
    if (v !== null) dumEq = dumPorTransferencia(v, Number(embriao))
  }

  const igRef = dumEq !== null && refDia !== null ? igEm(dumEq, refDia) : null
  const sit = igRef ? SITUACAO[situacao(igRef.totalDias)] : null
  const dppDia = dumEq !== null ? dppDe(dumEq) : null
  const tri = igRef && igRef.totalDias >= 0 ? trimestre(igRef.totalDias) : null

  // ---- "Quando ela terá…" ----
  const [alvoS, setAlvoS] = useState<number | null>(null)
  const [alvoD, setAlvoD] = useState<number | null>(null)
  const alvo =
    dumEq !== null && okSemanas(alvoS, alvoD)
      ? dataParaIg(dumEq, alvoS as number, alvoD ?? 0)
      : null

  const refRotulo =
    refDia === null
      ? ''
      : refDia === hojeDia
        ? 'hoje'
        : hojeDia !== null && refDia < hojeDia
          ? 'estava'
          : 'estará'

  return (
    <>
      <Card title="Como datar a gestação">
        <RadioGroup legend="Calcular por" value={metodo} options={METODOS} onChange={setMetodo} />

        {metodo === 'dum' ? (
          <div className="stack">
            <RadioGroup
              legend="A data da última menstruação é"
              value={dumCerta}
              options={[
                { value: 'certa', label: 'Conhecida e certa' },
                { value: 'periodo', label: 'Desconhecida, mas sei o período do mês' },
              ]}
              onChange={setDumCerta}
            />
            <div className="fields">
              {dumCerta === 'certa' ? (
                <DateField
                  label="Data da última menstruação (DUM)"
                  value={dum}
                  onChange={setDum}
                  hint="1º dia do último sangramento"
                />
              ) : (
                <>
                  <DateField label="Mês da DUM" kind="month" value={mesDum} onChange={setMesDum} />
                  <RadioGroup
                    legend="Período do mês"
                    value={periodo}
                    options={PERIODOS}
                    onChange={setPeriodo}
                    column
                  />
                </>
              )}
            </div>
          </div>
        ) : null}

        {metodo === 'usg' ? (
          <div className="stack">
            <div className="fields">
              <DateField
                label="Data da ultrassonografia"
                value={exame}
                onChange={setExame}
                hint="Use a primeira ultrassonografia (a mais precoce)"
              />
              <NumberField
                label="IG no laudo: semanas"
                value={usgS}
                onChange={setUsgS}
                min={0}
                max={44}
                step={1}
              />
              <NumberField
                label="IG no laudo: dias"
                value={usgD}
                onChange={setUsgD}
                min={0}
                max={6}
                step={1}
                hint="0 a 6"
              />
              <DateField
                label="DUM (opcional, para comparar)"
                value={dumCompara}
                onChange={(v) => {
                  setDumCompara(v)
                  setAdotada('sugerida')
                }}
                hint="Deixe em branco se a DUM for incerta"
              />
            </div>
            {comparacao ? (
              <ComparacaoView c={comparacao} adotada={adotada} onAdotada={setAdotada} />
            ) : parseIso(dumCompara) !== null &&
              parseIso(exame) !== null &&
              okSemanas(usgS, usgD) ? (
              <Alert tone="warn">
                A data do exame é anterior à DUM informada. Confira as datas.
              </Alert>
            ) : null}
          </div>
        ) : null}

        {metodo === 'dpp' ? (
          <div className="fields">
            <DateField
              label="Data provável do parto (DPP)"
              value={dpp}
              onChange={setDpp}
              hint="De um cartão ou exame anterior"
            />
          </div>
        ) : null}

        {metodo === 'fiv' ? (
          <div className="fields">
            <DateField
              label="Data da transferência do embrião"
              value={transf}
              onChange={setTransf}
            />
            <RadioGroup
              legend="Idade do embrião na transferência"
              value={embriao}
              options={[
                { value: '3', label: '3 dias' },
                { value: '5', label: '5 dias (blastocisto)' },
              ]}
              onChange={setEmbriao}
            />
          </div>
        ) : null}
      </Card>

      <Card title="Idade gestacional numa data">
        <div className="fields">
          <DateField
            label="Calcular a IG em"
            value={ref}
            onChange={setRef}
            hint="Passada ou futura"
          />
          <div className="field field-action">
            <button
              type="button"
              className="secondary"
              onClick={() => setRef(hoje)}
              disabled={ref === hoje}
            >
              Hoje
            </button>
          </div>
        </div>

        {dumEq === null ? (
          <p className="empty">Preencha a datação acima.</p>
        ) : refDia === null ? (
          <p className="empty">Escolha a data.</p>
        ) : (
          <>
            <Results>
              <Result
                label={`IG em ${fmtData(refDia)} (${refRotulo})`}
                value={igRef && igRef.totalDias >= 0 ? fmtIg(igRef) : '—'}
                tone={sit?.tone === 'danger' ? 'danger' : 'info'}
              >
                {igRef && igRef.totalDias >= 0 ? (
                  <>
                    {fmtIgLongo(igRef)}
                    {tri ? ` · ${tri}º trimestre` : ''}
                  </>
                ) : (
                  'Antes da DUM'
                )}
              </Result>
              {dppDia !== null ? (
                <Result label="Data provável do parto" value={fmtData(dppDia)}>
                  {diaDaSemana(dppDia)}, 40 semanas · {quando(dppDia, hojeDia)}
                </Result>
              ) : null}
              {dumEq !== null ? (
                <Result
                  label={metodo === 'dum' ? 'DUM usada' : 'DUM equivalente'}
                  value={fmtData(dumEq)}
                >
                  {metodo === 'dum'
                    ? dumCerta === 'certa'
                      ? 'Informada pela gestante'
                      : 'Dia do período, como recomenda o MS'
                    : metodo === 'usg'
                      ? usandoUsg
                        ? 'Calculada pela ultrassonografia'
                        : 'DUM mantida (a diferença não justifica redatar)'
                      : 'Dia 0 da IG, calculado de trás para a frente'}
                </Result>
              ) : null}
            </Results>
            {sit ? <Alert tone={sit.tone}>{sit.texto}</Alert> : null}
            {metodo === 'dum' &&
            dppDia !== null &&
            dumEq !== null &&
            dppNaegele(dumEq) !== dppDia ? (
              <p className="hint-inline">
                Pela regra de Näegele (gestograma): {fmtData(dppNaegele(dumEq))}. A DPP acima usa os
                280 dias do calendário; a diferença é de{' '}
                {plural(Math.abs(dppNaegele(dumEq) - dppDia), 'dia', 'dias')}.
              </p>
            ) : null}
          </>
        )}
      </Card>

      <Card title="Quando ela terá…" subtitle="Data em que completa uma idade gestacional.">
        <div className="fields">
          <NumberField
            label="Semanas"
            value={alvoS}
            onChange={setAlvoS}
            min={0}
            max={44}
            step={1}
          />
          <NumberField
            label="Dias"
            value={alvoD}
            onChange={setAlvoD}
            min={0}
            max={6}
            step={1}
            hint="0 a 6"
          />
        </div>
        {dumEq === null ? (
          <p className="empty">Preencha a datação acima.</p>
        ) : alvo !== null ? (
          <Results>
            <Result
              label={`Completa ${fmtIg({ totalDias: 0, semanas: alvoS as number, dias: alvoD ?? 0 })} em`}
              value={fmtData(alvo)}
            >
              {diaDaSemana(alvo)} · {quando(alvo, hojeDia)}
            </Result>
          </Results>
        ) : null}
        {dumEq !== null ? (
          <div className="table-scroll">
            <table className="compact">
              <caption className="sr-only">Marcos da gestação</caption>
              <thead>
                <tr>
                  <th>IG</th>
                  <th>Marco</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {MARCOS.map((m) => {
                  const dt = dataParaIg(dumEq, m.semanas, 0)
                  return (
                    <tr
                      key={m.semanas}
                      className={hojeDia !== null && dt <= hojeDia ? 'past' : undefined}
                    >
                      <td>{m.semanas}s 0d</td>
                      <td>{m.rotulo}</td>
                      <td>
                        {fmtData(dt)} <span className="muted">({diaDaSemana(dt)})</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </Card>

      <Details>
        <ul>
          <li>
            <strong>DUM:</strong> IG = dias desde o 1º dia da última menstruação ÷ 7. Se a DUM é
            desconhecida mas o período do mês é conhecido, usa-se o dia 5 (início), 15 (meio) ou 25
            (fim).
          </li>
          <li>
            <strong>DPP:</strong> DUM + 280 dias (40 semanas), pelo calendário. A regra de Näegele
            (+7 dias, −3 meses) é mostrada só como conferência.
          </li>
          <li>
            <strong>Ultrassonografia:</strong> DUM equivalente = data do exame − IG do laudo. Com a
            DUM informada, a ultrassonografia redata a gestação só quando a diferença passa do
            limite da faixa (tabela abaixo). Com ultrassonografia de 1º trimestre, não se redata por
            exames posteriores.
          </li>
          <li>
            <strong>FIV:</strong> no dia da transferência a IG é 2 semanas + a idade do embrião (DPP
            = transferência + 261 dias para embrião de 5 dias, + 263 para embrião de 3 dias).
          </li>
          <li>
            <strong>Trimestres:</strong> 1º até 13s 6d; 2º de 14s 0d a 27s 6d; 3º a partir de 28s
            0d.
          </li>
        </ul>
        <table className="compact">
          <caption>Diferença entre ultrassonografia e DUM que justifica redatar</caption>
          <thead>
            <tr>
              <th>IG pela DUM no exame</th>
              <th>Medida</th>
              <th>Redatar se a diferença for maior que</th>
            </tr>
          </thead>
          <tbody>
            {TABELA_REDATACAO.map((f) => (
              <tr key={f.faixa}>
                <td>{f.faixa}</td>
                <td>{f.medida}</td>
                <td>{f.limite} dias</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="hint-inline">
          CCN: comprimento cabeça-nádega. DBP: diâmetro biparietal. CC: circunferência cefálica. CA:
          circunferência abdominal. CF: comprimento do fêmur.
        </p>
        <Src href={CAB_32.url}>{CAB_32.titulo}</Src>
        <Src href={ACOG_700.url}>{ACOG_700.titulo}</Src>
      </Details>
    </>
  )
}

function ComparacaoView(props: {
  c: Comparacao
  adotada: 'sugerida' | 'dum' | 'usg'
  onAdotada: (v: 'sugerida' | 'dum' | 'usg') => void
}) {
  const { c } = props
  const dif = Math.abs(c.diferenca)
  const sentido = c.diferenca > 0 ? 'a mais' : 'a menos'
  return (
    <div className="stack">
      <Alert
        tone={c.redatar ? 'warn' : 'ok'}
        title={c.redatar ? 'Redatar pela ultrassonografia.' : 'Manter a DUM.'}
      >
        No dia do exame a IG pela DUM era {fmtIg(c.igDumNoExame)} e pela ultrassonografia{' '}
        {fmtIg(c.igUsgNoExame)}:{' '}
        {c.diferenca === 0 ? 'sem diferença.' : `${plural(dif, 'dia', 'dias')} ${sentido}.`} Nessa
        faixa ({c.faixa.faixa}, {c.faixa.medida}) só se redata com diferença maior que{' '}
        {c.faixa.limite} dias.
      </Alert>
      {c.terceiroTrimestre ? (
        <Alert tone="warn">
          Ultrassonografia de 3º trimestre: redatar um feto pequeno pode esconder restrição de
          crescimento. Decida pelo quadro clínico completo e acompanhe o crescimento.
        </Alert>
      ) : null}
      <RadioGroup
        legend="Datação adotada"
        value={props.adotada}
        options={[
          { value: 'sugerida', label: `Pela regra (${c.redatar ? 'ultrassonografia' : 'DUM'})` },
          { value: 'dum', label: 'Manter a DUM' },
          { value: 'usg', label: 'Usar a ultrassonografia' },
        ]}
        onChange={props.onAdotada}
      />
    </div>
  )
}
