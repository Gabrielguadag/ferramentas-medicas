import { useState } from 'react'
import { NumberField, RadioGroup, SelectField } from '../shared/NumberField'
import { usePatient } from './patient'
import {
  basalCeiling,
  fixedAboveRange,
  bolusDose,
  correctionByAlgorithm,
  correctionByFactor,
  factorFromDtdi,
  nphStart,
  secondNphDose,
} from './rules/insulina'
import { OUT_OF_SCOPE_TEXT, PREGNANCY_TEXT, outOfScope } from './rules/escopo'
import { type Check as GoalCheck, GOALS, evaluateGoals, goalOf } from './rules/metas'
import {
  basalAlert,
  convertNphToGlargine,
  dtdiAfterSwitch,
  tubetesFor,
  uiPerKg,
} from './rules/migracao'
import {
  PCDT_RISK_FACTORS,
  STAGE_LABEL,
  type Stage,
  dapagliflozinCriteria,
  pcdtFlow,
} from './rules/pcdt'
import { titrate } from './rules/titulacao'
import { ELIGIBILITY_LITERAL, GUIA_GLARGINA, NT_169, PCDT_DM2, eligibility } from './sources'
import { Alert, Card, Check, Details, Result, Results, Src, fmt } from '../shared/ui'

/** Glicemia capilar plausível (mg/dL); fora da faixa, o valor não entra no cálculo. */
const GLUCOSE_MIN = 20
const GLUCOSE_MAX = 600
const GLUCOSE_NOTE = `Glicemia fora de ${GLUCOSE_MIN} a ${GLUCOSE_MAX} mg/dL: não usada no cálculo; confira o valor.`
const plausibleGlucose = (v: number | null): number | null =>
  v !== null && v >= GLUCOSE_MIN && v <= GLUCOSE_MAX ? v : null

function ScopeNote() {
  return <Alert tone="info">{OUT_OF_SCOPE_TEXT}</Alert>
}

// ---------------------------------------------------------------------------------------------
export function MigracaoSection() {
  const { patient } = usePatient()
  const [nph, setNph] = useState<number | null>(null)
  const [apps, setApps] = useState<'1' | '2'>('2')
  const [dtdi, setDtdi] = useState<number | null>(null)
  const [days, setDays] = useState<number | null>(30)
  const [priming, setPriming] = useState<number | null>(2)

  const conv = nph !== null && nph > 0 ? convertNphToGlargine(nph, apps === '1' ? 1 : 2) : null
  const perKg = conv ? uiPerKg(conv.glargine, patient.weight) : null
  const dtdiBelowNph = dtdi !== null && nph !== null && dtdi < nph
  const dtdiNew = conv && !dtdiBelowNph ? dtdiAfterSwitch(dtdi, nph ?? 0, conv.glargine) : null
  const alert = conv
    ? basalAlert(patient.type, conv.glargine, patient.weight, dtdiNew, patient.age)
    : null
  // O critério "basal > 50% da DTDI" é da NT para crianças e adolescentes com DM1.
  const askDtdi = patient.type === 'DM1' && (patient.age === null || patient.age < 18)
  const tub = conv && days ? tubetesFor(conv.glargine, days, priming ?? 0) : null
  const elig = eligibility(patient.age, patient.type)

  return (
    <>
      {elig.kind !== 'unknown' ? (
        <Alert
          tone={elig.kind === 'eligible' ? 'ok' : 'warn'}
          title={
            elig.kind === 'eligible'
              ? 'Elegível à glargina (NT 169/2026).'
              : 'Não coberto pela NT 169/2026.'
          }
        >
          {elig.reason}
          {elig.kind === 'eligible'
            ? ' Também são necessárias prescrição válida e avaliação clínica individualizada (item 3.4); quem já é atendido pelo CEAF mantém o acompanhamento atual (item 3.5).'
            : null}
        </Alert>
      ) : (
        <Alert tone="info">
          Informe a idade no painel do paciente para conferir a elegibilidade.
        </Alert>
      )}

      <Card title="Dose atual de NPH">
        <div className="fields">
          <NumberField
            label="Dose total diária de NPH"
            unit="UI/dia"
            value={nph}
            onChange={setNph}
          />
          <RadioGroup
            legend="Aplicações de NPH por dia"
            value={apps}
            options={[
              { value: '1', label: '1 vez' },
              { value: '2', label: '2 ou mais' },
            ]}
            onChange={setApps}
          />
          {askDtdi ? (
            <NumberField
              label="DTDI atual (NPH + rápida)"
              unit="UI/dia"
              value={dtdi}
              onChange={setDtdi}
              hint="Soma das doses de hoje. O alerta de basal > 50% usa a DTDI já com a glargina."
            />
          ) : null}
        </div>
        {conv ? (
          <Results>
            <Result label="Glargina, 1 vez ao dia" value={conv.glargine} unit="UI" tone="info">
              {conv.rule === 'equivalent'
                ? 'NPH 1x/dia: mesma dose (1:1), no mesmo horário.'
                : `NPH 2x ou mais: ${fmt(nph ?? 0)} × 0,8 = ${fmt(conv.exact, 1)} UI. Preferencialmente no horário da maior dose anterior de NPH.`}
            </Result>
            <Result
              label="Dose por peso"
              value={perKg !== null ? fmt(perKg, 2) : '—'}
              unit={perKg !== null ? 'UI/kg/dia' : undefined}
            >
              {perKg === null ? 'Informe o peso no painel do paciente.' : null}
            </Result>
          </Results>
        ) : (
          <p className="empty">Informe a dose total diária de NPH.</p>
        )}
        {alert?.active ? (
          <Alert tone="danger" title="Possível excesso de insulina basal.">
            {alert.reasons.join(' ')} Reavaliar o esquema, evitando aumentar ainda mais a basal; se
            necessário, cuidado compartilhado com a Atenção Especializada.
          </Alert>
        ) : null}
        {conv && askDtdi && dtdi === null ? (
          <Alert tone="info">No DM1, informe a DTDI para avaliar o excesso de basal.</Alert>
        ) : null}
        {conv && askDtdi && dtdiBelowNph ? (
          <Alert tone="info">
            A DTDI não pode ser menor que a dose de NPH: confira os valores.
          </Alert>
        ) : null}
        <Details>
          <ul>
            <li>
              Glargina uma vez ao dia, em horário fixo (manhã ou noite); em geral não há necessidade
              de segunda dose.
            </li>
            <li>A troca da basal não implica troca automática da insulina prandial.</li>
            <li>Titular pela glicemia de jejum, em intervalos de até 3 dias (seção Titulação).</li>
            <li>Monitorar com mais frequência nas semanas iniciais.</li>
          </ul>
          <p>
            Elegibilidade (item 3.1): “{ELIGIBILITY_LITERAL}” Quem completar 18 anos durante a
            estratégia pode permanecer no esquema (item 3.3).
          </p>
          <Src href={NT_169.url}>{NT_169.short}, Quadros 3 e 4 e item 3.</Src>
        </Details>
      </Card>

      <Card title="Quantidade para a receita">
        <div className="fields">
          <NumberField label="Dias de tratamento" value={days} onChange={setDays} step={1} />
          <NumberField
            label="Escorva por aplicação"
            unit="UI"
            value={priming}
            onChange={setPriming}
            hint="Teste de segurança da caneta; confira no manual da caneta."
          />
        </div>
        {tub ? (
          <Results>
            <Result label={`Tubetes de 3 mL para ${days} dias`} value={tub.tubetes} tone="info">
              {tub.byExpiry > tub.byVolume
                ? `Pelo volume bastariam ${tub.byVolume}, mas cada tubete aberto dura no máximo 28 dias.`
                : `${fmt(tub.uiPerDay)} UI/dia (dose + escorva) × ${days} dias ÷ 300 UI por tubete.`}
            </Result>
            <Result label="Agulhas 4 mm" value={days ?? 0}>
              Uma agulha por dia, por tipo de insulina.
            </Result>
          </Results>
        ) : (
          <p className="empty">Calcula depois da conversão acima.</p>
        )}
        <Details>
          <ul>
            <li>Tubete de 3 mL com 100 UI/mL = 300 UI.</li>
            <li>Teste de escorva (fluxo) antes de cada aplicação.</li>
            <li>Fechado: geladeira (2 a 8 °C), fora da porta e longe do congelador.</li>
            <li>
              Aberto, em uso: em local arejado se a temperatura do local fica abaixo de 30 °C; acima
              de 30 °C, na geladeira (2 a 8 °C), tirando 30 minutos antes da aplicação. Em ambos, no
              máximo 28 dias depois de aberto.
            </li>
            <li>Caneta reutilizável: 3 anos ou 5.000 aplicações.</li>
          </ul>
          <Src href={NT_169.url}>{NT_169.short}, Anexo.</Src>
          <Src href={GUIA_GLARGINA.url}>{GUIA_GLARGINA.short}, armazenamento.</Src>
        </Details>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------------------------------------
export function InicioNphSection() {
  const { patient } = usePatient()
  const [bedtime, setBedtime] = useState<number | null>(null)
  const start = nphStart(patient.weight)
  const ceiling = basalCeiling(patient.weight)
  const second = bedtime ? secondNphDose(bedtime) : null
  if (outOfScope(patient.age, patient.type, patient.profile)) return <ScopeNote />
  return (
    <>
      <Card
        title="Dose inicial de NPH"
        subtitle="Na falha dos orais, ou com HbA1c > 9%, jejum ≥ 300 mg/dL, sintomas de hiperglicemia aguda ou intercorrências."
      >
        <Results>
          <Result label="Dose fixa" value={start.fixed} unit="U" tone="info">
            À noite, antes de dormir (perto das 22 h ou 8 h antes do desjejum).
            {fixedAboveRange(patient.weight) ? ' Neste peso, 10 U passa de 0,2 U/kg.' : ''}
          </Result>
          <Result
            label="Ou por peso (0,1 a 0,2 U/kg)"
            value={start.range ? `${start.range[0]}–${start.range[1]}` : '—'}
            unit={start.range ? 'U' : undefined}
          >
            {start.range ? null : 'Informe o peso no painel do paciente.'}
          </Result>
          <Result
            label="Teto de basal"
            value={ceiling !== null ? `< ${fmt(ceiling, Number.isInteger(ceiling) ? 0 : 1)}` : '—'}
            unit={ceiling ? 'U/dia' : undefined}
          >
            {ceiling !== null
              ? 'Basal abaixo de 0,5 U/kg/dia; acima disso, reavaliar o esquema (NT 169, Quadro 4).'
              : null}
          </Result>
        </Results>
        <p className="lead">
          Aumentar 2 U a cada 3 dias até a glicemia de jejum na meta. Jejum &lt; 70 mg/dL ou
          hipoglicemia noturna: reduzir 2 a 4 U. Use a seção <strong>Titulação</strong> com os
          jejuns do paciente.
        </p>
        <p className="lead">
          Neste momento, reforçar a educação: técnica de aplicação, automonitorização e como
          identificar e tratar hipoglicemia, mais frequente ao iniciar e intensificar a insulina.
        </p>
        <p className="lead">
          Pessoa com 70 anos ou mais, ou com hipoglicemia noturna ou grave: a glargina pode ser a
          basal (elegibilidade e conversão na seção <strong>Migração para glargina</strong>).
        </p>
        <Details>
          <Src href={PCDT_DM2.url}>
            {PCDT_DM2.short}, itens 8.3.4, 8.3.4.1 e 8.3.4.2 e Figura 3.
          </Src>
          <Src href={NT_169.url}>{NT_169.short}, item 3.1.</Src>
        </Details>
      </Card>
      <Card
        title="Segunda dose de NPH"
        subtitle="HbA1c fora da meta com jejum no alvo (80–130 mg/dL)."
      >
        <div className="fields">
          <NumberField
            label="Dose atual ao deitar"
            unit="U"
            value={bedtime}
            onChange={setBedtime}
          />
        </div>
        {second ? (
          <Results>
            <Result label="Antes do desjejum" value={second.morning} unit="U" tone="info">
              2/3 de 80% da dose atual (arredondado).
            </Result>
            <Result label="Ao deitar" value={second.bedtime} unit="U" tone="info">
              O restante dos 80% da dose atual.
            </Result>
          </Results>
        ) : null}
        <p className="lead">
          Titular a dose da manhã pela glicemia antes do jantar: +1 a 3 U a cada 3 dias até 80–130
          mg/dL. Medir jejum e antes do jantar.
        </p>
        <Details>
          <Src href={PCDT_DM2.url}>{PCDT_DM2.short}, item 8.3.4.1.</Src>
        </Details>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------------------------------------
export function TitulacaoSection() {
  const { patient } = usePatient()
  const [g, setG] = useState<(number | null)[]>([null, null, null])
  const [nocturnal, setNocturnal] = useState(false)
  const [dose, setDose] = useState<number | null>(null)
  const goal = goalOf(patient.profile)
  const gValid = g.map(plausibleGlucose)
  const gInvalid = g.some((v, i) => v !== null && gValid[i] === null)
  const t = titrate(gValid, patient.profile, nocturnal)
  const excess =
    dose !== null && dose > 0 ? basalAlert('DM2', dose, patient.weight, null).active : false
  const blocked = t?.action === 'aumentar-2' && excess
  const tone = !t
    ? 'neutral'
    : blocked || t.action.startsWith('reduzir')
      ? 'danger'
      : t.action === 'aumentar-2'
        ? 'warn'
        : 'ok'
  if (outOfScope(patient.age, patient.type, patient.profile)) return <ScopeNote />
  return (
    <Card
      title="Glicemias de jejum (até 3 dias)"
      subtitle={`Meta de jejum (${goal.short}): ${goal.fasting[0]}–${goal.fasting[1]} mg/dL. O perfil é escolhido no painel do paciente.`}
    >
      <div className="fields">
        {[0, 1, 2].map((i) => (
          <NumberField
            key={i}
            label={`Dia ${i + 1}`}
            unit="mg/dL"
            value={g[i] ?? null}
            onChange={(v) => setG((prev) => prev.map((x, j) => (j === i ? v : x)))}
          />
        ))}
      </div>
      <div className="fields">
        <NumberField
          label="Dose atual de insulina basal (opcional)"
          unit="U/dia"
          value={dose}
          onChange={setDose}
          hint="Com o peso do painel, confere o limite de 0,5 UI/kg/dia antes de aumentar."
        />
      </div>
      {gInvalid ? <p className="hint-inline">{GLUCOSE_NOTE}</p> : null}
      <Check label="Hipoglicemia noturna relatada" checked={nocturnal} onChange={setNocturnal} />
      {t ? (
        <Results>
          <Result
            label="Conduta"
            value={blocked ? 'Não aumentar: reavaliar o esquema' : t.label}
            tone={tone}
          >
            {t.explanation}
          </Result>
          {t.count ? (
            <Result
              label={`Média de ${t.count} dia${t.count > 1 ? 's' : ''}`}
              value={t.mean}
              unit="mg/dL"
            />
          ) : null}
        </Results>
      ) : (
        <p className="empty">Preencha ao menos um jejum.</p>
      )}
      {blocked ? (
        <Alert tone="danger" title="Insulina basal > 0,5 UI/kg/dia.">
          “Nessas situações, recomenda-se reavaliar o esquema terapêutico, evitando o aumento
          adicional da insulina basal e, quando necessário, realizar o cuidado compartilhado com a
          Atenção Especializada” (NT 169, Quadro 4).
        </Alert>
      ) : null}
      <p className="hint-inline">{PREGNANCY_TEXT}</p>
      <Details>
        <ul>
          <li>Aumentar 2 U a cada 3 dias até atingir a meta de jejum.</li>
          <li>Jejum &lt; 70 mg/dL ou hipoglicemia noturna: reduzir a dose diária em 2 a 4 U.</li>
          <li>Glicemia &lt; 80 mg/dL de madrugada ou em jejum: reduzir 2 U.</li>
          <li>
            Vale para NPH e para glargina (“Sugere-se iniciar e titular os AIAP da mesma forma da
            insulina humana NPH”).
          </li>
          <li>
            Hipoglicemia noturna ou grave: pode-se trocar a NPH pela glargina (seção Migração para
            glargina; elegibilidade na NT 169).
          </li>
          <li>
            Jejum próximo do limite superior da meta: avaliar a glicemia durante o sono (PCDT
            8.3.4.1).
          </li>
          <li>
            Excesso de basal: &gt; 0,5 U/kg/dia, queda &gt; 50 mg/dL entre deitar e acordar, HbA1c
            fora da meta com jejum no alvo, hipoglicemias. Nessas situações: “recomenda-se reavaliar
            o esquema terapêutico, evitando o aumento adicional da insulina basal” (NT 169, Quadro
            4).
          </li>
        </ul>
        <Src href={PCDT_DM2.url}>
          {PCDT_DM2.short}, 8.3.4.1, 8.3.4.2 e Figura 3; NT 169/2026, Quadros 3 a 5.
        </Src>
      </Details>
    </Card>
  )
}

// ---------------------------------------------------------------------------------------------
export function PrandialSection() {
  const { patient } = usePatient()
  const [prandial, setPrandial] = useState<number | null>(null)
  const [glucoseInput, setGlucose] = useState<number | null>(null)
  const glucose = plausibleGlucose(glucoseInput)
  const [mode, setMode] = useState<'algoritmo' | 'fator'>('algoritmo')
  const [upperInput, setUpper] = useState<number | null | undefined>(undefined)
  const [factorKind, setFactorKind] = useState<'50' | 'dtdi'>('50')
  const [dtdi, setDtdi] = useState<number | null>(null)
  // Limite superior pré-preenchido com o teto de jejum/pré-prandial do perfil (NT 169, Quadro 5).
  const upper = upperInput === undefined ? goalOf(patient.profile).fasting[1] : upperInput
  const factor = factorKind === '50' ? 50 : dtdi && dtdi > 0 ? factorFromDtdi(dtdi) : null
  // Glicemia < 70: o alerta aparece sempre (qualquer modo, com ou sem dose prandial). No modo
  // "fator de correção", o Quadro 7 não se aplica (só corrige acima do alvo): não calcula dose.
  const hypo = glucose !== null && glucose < 70
  const hypoInFactorMode = mode === 'fator' && hypo
  const correction =
    glucose === null || hypoInFactorMode
      ? null
      : mode === 'algoritmo'
        ? correctionByAlgorithm(glucose)
        : upper !== null && factor
          ? correctionByFactor(glucose, upper, factor)
          : null
  const goalUpper = goalOf(patient.profile).fasting[1]
  const r =
    prandial !== null && correction !== null && glucose !== null
      ? bolusDose(prandial, correction, glucose)
      : null
  if (outOfScope(patient.age, patient.type, patient.profile)) return <ScopeNote />
  return (
    <>
      <Card
        title="Início do bolus"
        subtitle="HbA1c fora da meta, jejum e glicemia antes das refeições adequados e pós-prandial > 180 mg/dL, em uso de basal (NPH 2x/dia ou glargina)."
      >
        <ol className="steps">
          <li>
            Medir 6 glicemias no dia (antes e 2 h depois de café, almoço e jantar) e achar a maior
            pós-prandial. Se for ≤ 180 mg/dL, não iniciar bolus.
          </li>
          <li>
            Nessa refeição, iniciar <strong>3 a 4 U</strong> de insulina regular, 30 minutos antes.
          </li>
          <li>Titular +1 U duas vezes por semana até pós-prandial entre 90 e 180 mg/dL.</li>
          <li>Segunda e terceira doses nas refeições com pós-prandial &gt; 180 mg/dL.</li>
          <li>Depois de ajustar o jantar, avaliar redução da NPH de deitar.</li>
        </ol>
        <p className="lead">
          Com esquema basal/bolus, não se recomenda manter sulfonilureia (Figura 3, nota b).
        </p>
        <Details>
          <Src href={PCDT_DM2.url}>{PCDT_DM2.short}, itens 8.3.4.1 e 8.3.4.3 e Figura 3.</Src>
        </Details>
      </Card>
      <Card
        title="Dose antes da refeição (com correção)"
        subtitle="Pela glicemia capilar medida antes da refeição."
      >
        <div className="fields">
          <NumberField
            label="Dose prandial prescrita"
            unit="U"
            value={prandial}
            onChange={setPrandial}
          />
          <NumberField
            label="Glicemia antes da refeição"
            unit="mg/dL"
            value={glucoseInput}
            onChange={setGlucose}
          />
          <RadioGroup
            legend="Método"
            value={mode}
            options={[
              { value: 'algoritmo', label: 'Algoritmo (Quadro 8)' },
              { value: 'fator', label: 'Fator de correção' },
            ]}
            onChange={setMode}
          />
          {mode === 'fator' ? (
            <>
              <NumberField
                label="Limite superior do alvo"
                unit="mg/dL"
                value={upper}
                onChange={setUpper}
              />
              <SelectField
                label="Fator de correção"
                value={factorKind}
                options={[
                  { value: '50', label: 'FC = 50' },
                  { value: 'dtdi', label: 'FC = 1800 ÷ DTDI' },
                ]}
                onChange={setFactorKind}
              />
              {factorKind === 'dtdi' ? (
                <NumberField
                  label="DTDI"
                  unit="U/dia"
                  value={dtdi}
                  onChange={setDtdi}
                  hint={factor ? `FC = ${fmt(factor, 1)}` : undefined}
                />
              ) : null}
            </>
          ) : null}
        </div>
        {glucoseInput !== null && glucose === null ? (
          <p className="hint-inline">{GLUCOSE_NOTE}</p>
        ) : null}
        {hypo ? (
          <Alert tone="danger" title="Glicemia abaixo de 70 mg/dL.">
            {mode === 'fator'
              ? 'Tratar a hipoglicemia. O fator de correção só se aplica acima do alvo; não calcular correção por ele.'
              : 'Tratar a hipoglicemia primeiro. O algoritmo reduz 1 U (< 70) ou 2 U (< 50) do bolus prandial.'}
          </Alert>
        ) : null}
        {mode === 'algoritmo' && goalUpper !== 130 ? (
          <p className="hint-inline">
            O Quadro 8 corrige a partir de 130 mg/dL. Com a meta pré-prandial deste perfil (até{' '}
            {goalUpper} mg/dL), use o fator de correção, que já vem com esse limite.
          </p>
        ) : null}
        {r ? (
          <Results>
            <Result
              label="Dose a aplicar"
              value={r.total}
              unit="U"
              tone={r.hypo ? 'danger' : 'info'}
            >
              {fmt(prandial ?? 0)} {r.correction >= 0 ? '+' : '−'} {fmt(Math.abs(r.correction), 1)}{' '}
              = {fmt(r.exact, 1)} U
            </Result>
            <Result
              label="Correção"
              value={`${r.correction > 0 ? '+' : r.correction < 0 ? '−' : ''}${fmt(Math.abs(r.correction), 1)}`}
              unit="U"
            />
          </Results>
        ) : hypoInFactorMode ? null : (
          <p className="empty">Informe a dose prandial e a glicemia antes da refeição.</p>
        )}
        <Details>
          <table className="compact">
            <caption>Quadro 8. Algoritmo de correção</caption>
            <tbody>
              {[
                ['< 50', '−2 U'],
                ['50 a 69', '−1 U'],
                ['70 a 130', '0'],
                ['131 a 180', '+1 U'],
                ['181 a 230', '+2 U'],
                ['231 a 280', '+3 U'],
                ['281 a 330', '+4 U'],
                ['> 330', '+5 U'],
              ].map(([a, b]) => (
                <tr key={a}>
                  <td>{a} mg/dL</td>
                  <td>{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Fator de correção: bolus de correção = (glicemia − limite superior do alvo) ÷ FC; FC =
            50 ou 1800 ÷ DTDI.
          </p>
          <Src href={PCDT_DM2.url}>
            {PCDT_DM2.short}, Quadros 7 e 8 (Diabetes Coalition of California, 2010).
          </Src>
        </Details>
      </Card>
    </>
  )
}

// ---------------------------------------------------------------------------------------------
const CHECK_TEXT: Record<GoalCheck, string> = {
  'na-meta': 'na meta',
  'fora-da-meta': 'fora da meta',
  'sem-dado': '—',
  individual: 'avaliação individual',
}
const CHECK_TONE: Record<GoalCheck, 'ok' | 'warn' | 'neutral' | 'info'> = {
  'na-meta': 'ok',
  'fora-da-meta': 'warn',
  'sem-dado': 'neutral',
  individual: 'info',
}

export function MetasSection() {
  const { patient } = usePatient()
  const [hb, setHb] = useState<number | null>(null)
  const [fj, setFj] = useState<number | null>(null)
  const [pp, setPp] = useState<number | null>(null)
  const goal = goalOf(patient.profile)
  const ev = evaluateGoals(patient.profile, hb, fj, pp)
  return (
    <Card title={`Metas: ${goal.label}`} subtitle="O perfil é escolhido no painel do paciente.">
      <div className="fields">
        <NumberField label="HbA1c" unit="%" value={hb} onChange={setHb} />
        <NumberField label="Glicemia de jejum" unit="mg/dL" value={fj} onChange={setFj} />
        <NumberField label="Glicemia 2 h pós-prandial" unit="mg/dL" value={pp} onChange={setPp} />
      </div>
      <Results>
        <Result
          label="HbA1c"
          value={goal.hba1cBelow === null ? 'Individual' : `< ${fmt(goal.hba1cBelow, 1)}%`}
          tone={CHECK_TONE[ev.hba1c]}
        >
          {goal.hba1cBelow === null
            ? 'Evitar sintomas de hiper ou hipoglicemia.'
            : CHECK_TEXT[ev.hba1c]}
        </Result>
        <Result
          label="Jejum e pré-prandial"
          value={`${goal.fasting[0]}–${goal.fasting[1]}`}
          unit="mg/dL"
          tone={CHECK_TONE[ev.fasting]}
        >
          {CHECK_TEXT[ev.fasting]}
        </Result>
        <Result
          label="2 h pós-prandial"
          value={`< ${goal.postprandialBelow}`}
          unit="mg/dL"
          tone={CHECK_TONE[ev.postprandial]}
        >
          {CHECK_TEXT[ev.postprandial]}
        </Result>
        <Result label="Ao deitar" value={`${goal.bedtime[0]}–${goal.bedtime[1]}`} unit="mg/dL" />
      </Results>
      <p className="hint-inline">{PREGNANCY_TEXT}</p>
      <Details summary="Todas as metas (Quadro 5)">
        <table>
          <thead>
            <tr>
              <th>Perfil</th>
              <th>HbA1c</th>
              <th>Jejum e pré-prandial</th>
              <th>2 h pós</th>
              <th>Ao deitar</th>
            </tr>
          </thead>
          <tbody>
            {GOALS.map((g) => (
              <tr key={g.profile}>
                <td>{g.label}</td>
                <td>{g.hba1cBelow === null ? 'Evitar sintomas' : `< ${fmt(g.hba1cBelow, 1)}%`}</td>
                <td>{`${g.fasting[0]}–${g.fasting[1]}`}</td>
                <td>{`< ${g.postprandialBelow}`}</td>
                <td>{`${g.bedtime[0]}–${g.bedtime[1]}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Src href={NT_169.url}>{NT_169.short}, Quadro 5.</Src>
      </Details>
    </Card>
  )
}

// ---------------------------------------------------------------------------------------------
type YesNo = '' | 'sim' | 'nao'
const YES_NO: readonly { value: YesNo; label: string }[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
]
const yesNo = (v: YesNo): boolean | null => (v === '' ? null : v === 'sim')

export function TratamentoSection() {
  const { patient, bmi } = usePatient()
  const [months, setMonths] = useState<'menos-3' | '3-ou-mais'>('3-ou-mais')
  const [factors, setFactors] = useState<Set<string>>(new Set())
  const [stage, setStage] = useState<Stage>('inicio')
  const [atGoal, setAtGoal] = useState(false)
  const [insulin, setInsulin] = useState(false)
  const [cvd, setCvd] = useState<YesNo>('')
  const [highRisk, setHighRisk] = useState<YesNo>('')
  const dapa = dapagliflozinCriteria({
    age: patient.age,
    sex: patient.sexKnown ? patient.sex : null,
    establishedCvd: yesNo(cvd),
    highRiskFactor: yesNo(highRisk),
  })
  const flow = pcdtFlow({
    monthsSinceDiagnosis: months,
    hasRiskFactor: factors.size > 0,
    stage,
    atGoal,
    insulinIndication: insulin,
    dapagliflozinEligible: dapa.eligible,
  })
  const tone = flow.next === 'insulina' ? 'warn' : flow.next === 'monitorar' ? 'ok' : 'info'
  if (outOfScope(patient.age, patient.type, patient.profile)) return <ScopeNote />
  return (
    <>
      <Card title="Situação do paciente">
        <div className="fields">
          <RadioGroup
            legend="Tempo de diagnóstico"
            value={months}
            options={[
              { value: 'menos-3', label: 'Menos de 3 meses' },
              { value: '3-ou-mais', label: '3 meses ou mais' },
            ]}
            onChange={setMonths}
          />
          <SelectField
            label="Tratamento atual"
            value={stage}
            options={Object.entries(STAGE_LABEL).map(([value, label]) => ({
              value: value as Stage,
              label,
            }))}
            onChange={setStage}
          />
        </div>
        <div className="checks">
          {stage !== 'inicio' ? (
            <Check
              label="Atingiu a meta terapêutica e tolerou o medicamento"
              checked={atGoal}
              onChange={setAtGoal}
            />
          ) : null}
          <Check
            label="HbA1c > 9%, jejum ≥ 300 mg/dL, sintomas de hiperglicemia aguda ou intercorrências/internações pelo DM2"
            checked={insulin}
            onChange={setInsulin}
          />
        </div>
        {months === 'menos-3' ? (
          <details className="more">
            <summary>Fatores de risco para o diabetes ({factors.size})</summary>
            <div className="checks more-body">
              {bmi ? (
                <p className="hint">IMC do paciente: {String(bmi).replace('.', ',')} kg/m²</p>
              ) : null}
              {PCDT_RISK_FACTORS.map((f) => (
                <Check
                  key={f}
                  label={f}
                  checked={factors.has(f)}
                  onChange={(v) => {
                    const n = new Set(factors)
                    if (v) n.add(f)
                    else n.delete(f)
                    setFactors(n)
                  }}
                />
              ))}
            </div>
          </details>
        ) : null}
        <Results>
          <Result label="Conduta" value={flow.conduct} tone={tone}>
            {flow.notes.length ? (
              <ul>
                {flow.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            ) : null}
          </Result>
        </Results>
        <p className="hint-inline">{PREGNANCY_TEXT}</p>
        <Details>
          <p>
            Metas terapêuticas da Figura 2: HbA1c &lt; 7,0% ou, em idosos, de 7,5% a 8,0%. Reavaliar
            em 2 a 6 meses.
          </p>
          <Src href={PCDT_DM2.url}>{PCDT_DM2.short}, Figura 2 (fluxograma de tratamento).</Src>
        </Details>
      </Card>

      <Card title="Critérios para dapagliflozina" subtitle="Segunda intensificação do tratamento.">
        <div className="fields">
          <RadioGroup
            legend="Doença cardiovascular estabelecida (IAM, revascularização, angioplastia, angina, AVC isquêmico, AIT, IC com FE < 40%)"
            value={cvd}
            options={YES_NO}
            onChange={setCvd}
          />
          <RadioGroup
            legend="HAS, dislipidemia ou tabagismo"
            value={highRisk}
            options={YES_NO}
            onChange={setHighRisk}
          />
        </div>
        {dapa.eligible === null ? (
          <p className="empty">
            {patient.age === null
              ? 'Informe a idade no painel do paciente.'
              : 'Responda os critérios acima (e o sexo no painel, se tiver de 55 a 59 anos) para concluir.'}
          </p>
        ) : (
          <Alert
            tone={dapa.eligible ? 'ok' : 'neutral'}
            title={dapa.eligible ? 'Atende aos critérios.' : 'Não atende aos critérios.'}
          >
            ≥ 40 anos com DCV estabelecida, ou homem ≥ 55 / mulher ≥ 60 anos com HAS, dislipidemia
            ou tabagismo. Dose 10 mg/dia; não iniciar com TFGe &lt; 25 mL/min/1,73 m².
          </Alert>
        )}
        <Details>
          <Src href={PCDT_DM2.url}>{PCDT_DM2.short}, item 8.3.3 e nota g da Figura 2.</Src>
        </Details>
      </Card>
    </>
  )
}
