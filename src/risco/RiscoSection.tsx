import { type ReactNode, useMemo, useState } from 'react'
import { usePatient } from '../glargina/patient'
import { Alert, Check, Details, Result, Results, Src, type Tone, fmt } from '../shared/ui'
import { NumberField, RadioGroup, SelectField } from '../shared/NumberField'
import {
  CATEGORY_LABEL,
  type Category,
  type ScaleResult,
  pcdt2026,
  sbc2025,
  sbd2026,
} from './escalas'
import {
  AGGRAVATORS,
  type Neuropathy,
  type Retinopathy,
  type RiskInputs,
  ckdEpi2021,
  emptyInputs,
  renalGrid,
} from './inputs'
import { type PreventResult, checkPrevent, prevent } from './prevent'
import { type WhoResult, whoHearts } from './who2019'

type ScaleId = 'sbc' | 'sbd' | 'pcdt' | 'oms' | 'prevent'

const SCALES: { id: ScaleId; label: string; short: string }[] = [
  { id: 'sbc', label: 'SBC 2025', short: 'Dislipidemias e Prevenção da Aterosclerose' },
  { id: 'sbd', label: 'SBD 2026', short: 'Risco CV no diabetes' },
  { id: 'pcdt', label: 'PCDT DM2 2026', short: 'Ministério da Saúde' },
  { id: 'oms', label: 'OMS/HEARTS', short: 'Calculadora da OPAS' },
  { id: 'prevent', label: 'PREVENT', short: 'Equações da AHA' },
]

const SOURCES: Record<ScaleId, { text: string; href: string }> = {
  sbc: {
    text: 'Diretriz Brasileira de Dislipidemias e Prevenção da Aterosclerose 2025 (SBC), Tab. 4.1–4.8, Fig. 4.1 e Tab. 5.1',
    href: 'https://doi.org/10.36660/abc.20250640',
  },
  sbd: {
    text: 'Diretriz da SBD (ed. 2026), Manejo do risco cardiovascular: dislipidemia, Quadros 1–6',
    href: 'https://diretriz.diabetes.org.br/manejo-do-risco-cardiovascular-dislipidemia/',
  },
  pcdt: {
    text: 'PCDT DM2 2026 (Portaria SCTIE/MS nº 13/2026), item 5.5',
    href: 'https://www.gov.br/conitec/pt-br/midias/protocolos/2026/pcdt-diabete-melito-tipo-2',
  },
  oms: {
    text: 'OMS 2019 (Kaptoge et al., Lancet Glob Health 2019), América Latina Tropical; calculadora HEARTS/OPAS',
    href: 'https://www.paho.org/pt/hearts-nas-americas/calculadora-risco-cardiovascular',
  },
  prevent: {
    text: 'AHA PREVENT (Khan et al., Circulation 2024), com a errata de HbA1c de 2026',
    href: 'https://doi.org/10.1161/CIRCULATIONAHA.123.067626',
  },
}

const CAT_TONE: Record<Category, Tone> = {
  baixo: 'ok',
  intermediario: 'info',
  alto: 'warn',
  'muito-alto': 'danger',
  extremo: 'danger',
  individual: 'neutral',
  indeterminado: 'neutral',
}

const WHO_TONE: Record<string, Tone> = {
  Baixo: 'ok',
  Moderado: 'info',
  Alto: 'warn',
  'Muito alto': 'danger',
  Crítico: 'danger',
}

const pct = (v: number) => `${fmt(v * 100, 1)}%`

function Group(props: { title: string; count?: number; open?: boolean; children: ReactNode }) {
  return (
    <details className="group" open={props.open}>
      <summary>
        {props.title}
        {props.count ? <span className="count">{props.count}</span> : null}
      </summary>
      <div className="group-body">{props.children}</div>
    </details>
  )
}

export function RiscoSection() {
  const { patient, bmi } = usePatient()
  const [scale, setScale] = useState<ScaleId>('sbc')
  const [f, setF] = useState<RiskInputs>(() => emptyInputs())
  const [creatinine, setCreatinine] = useState<number | null>(null)
  const set = <K extends keyof RiskInputs>(k: K, v: RiskInputs[K]) =>
    setF((p) => ({ ...p, [k]: v }))

  const egfrCalc =
    creatinine && patient.age ? ckdEpi2021(creatinine, patient.age, patient.sex) : null
  const i: RiskInputs = useMemo(
    () => ({
      ...f,
      age: patient.age,
      sex: patient.sex,
      dmType: patient.type,
      bmi,
      egfr: egfrCalc ?? f.egfr,
    }),
    [f, patient.age, patient.sex, patient.type, bmi, egfrCalc],
  )

  const prevCheck = checkPrevent({
    age: i.age,
    totalChol: i.totalChol,
    hdl: i.hdl,
    sbp: i.sbp,
    egfr: i.egfr,
  })
  const prev: PreventResult | null =
    prevCheck.ok && !(i.recentAcs || i.priorMi || i.ischemicStroke || i.revascularization || i.pad)
      ? prevent({
          age: i.age as number,
          sex: i.sex,
          totalChol: i.totalChol as number,
          hdl: i.hdl as number,
          sbp: i.sbp as number,
          bpTx: i.onBpMeds,
          statin: i.onStatin,
          diabetes: i.diabetes,
          smoker: i.smoker,
          egfr: i.egfr as number,
          bmi: i.bmi,
          hba1c: i.hba1c,
          uacr: i.uacr,
        })
      : null
  const whoLab: WhoResult | null =
    i.age !== null && i.sbp !== null
      ? whoHearts({
          model: 'lab',
          age: i.age,
          sex: i.sex,
          smoker: i.smoker,
          sbp: i.sbp,
          diabetes: i.diabetes,
          totalCholMgDl: i.totalChol,
        })
      : null
  const whoNonLab: WhoResult | null =
    i.age !== null && i.sbp !== null
      ? whoHearts({
          model: 'nonlab',
          age: i.age,
          sex: i.sex,
          smoker: i.smoker,
          sbp: i.sbp,
          bmi: i.bmi,
        })
      : null

  const results: Record<'sbc' | 'sbd' | 'pcdt', ScaleResult> = {
    sbc: sbc2025(i, i.diabetes ? null : prev),
    sbd: sbd2026(i),
    pcdt: pcdt2026(i),
  }
  const renal = renalGrid(i.egfr, i.uacr)
  const eventCount = [i.recentAcs, i.priorMi, i.ischemicStroke, i.revascularization, i.pad].filter(
    Boolean,
  ).length
  const dmCount = [
    i.prematureCadFamily,
    i.metabolicSyndrome,
    i.neuropathy !== 'nenhuma',
    i.retinopathy !== 'nenhuma',
    i.nephropathy,
    i.carotidPlaque,
    i.coronaryCtPlaque,
    i.aaa,
    i.abnormalAbi,
    i.stenosisOver50,
    i.familialHypercholesterolemia,
  ].filter(Boolean).length

  return (
    <>
      <div className="card">
        <div className="scale-picker" role="radiogroup" aria-label="Escala de risco">
          {SCALES.map((s) => (
            <button
              key={s.id}
              type="button"
              role="radio"
              aria-checked={scale === s.id}
              className="scale-option"
              onClick={() => setScale(s.id)}
            >
              <strong>{s.label}</strong>
              <span>{s.short}</span>
            </button>
          ))}
        </div>
        <div className="dm-toggle">
          <Check
            label={
              <>
                <strong>Considerar diabetes ({patient.type})</strong> nas escalas que usam diabetes
                como fator. Desmarque para calcular como pessoa sem diabetes.
              </>
            }
            checked={i.diabetes}
            onChange={(v) => set('diabetes', v)}
          />
        </div>
      </div>

      <ScaleView
        scale={scale}
        i={i}
        results={results}
        prev={prev}
        prevProblems={prevCheck.ok ? [] : prevCheck.problems}
        whoLab={whoLab}
        whoNonLab={whoNonLab}
      />

      <div className="card">
        <h3>Dados para o cálculo</h3>
        <p className="card-sub">
          Idade, sexo e IMC vêm do painel do paciente. Preencha só o que tiver; cada escala mostra o
          que falta.
        </p>
        <Group title="Clínica" open>
          <div className="fields">
            <NumberField
              label="PA sistólica"
              unit="mmHg"
              value={i.sbp}
              onChange={(v) => set('sbp', v)}
            />
          </div>
          <div className="checks">
            <Check label="Tabagismo atual" checked={i.smoker} onChange={(v) => set('smoker', v)} />
            <Check
              label="Hipertensão arterial (tratada ou não)"
              checked={i.hypertension}
              onChange={(v) => set('hypertension', v)}
            />
            <Check
              label="Em uso de anti-hipertensivo"
              checked={i.onBpMeds}
              onChange={(v) => set('onBpMeds', v)}
            />
            <Check
              label="Em uso de estatina"
              checked={i.onStatin}
              onChange={(v) => set('onStatin', v)}
            />
          </div>
          {i.diabetes ? (
            <div className="fields">
              <NumberField
                label="Tempo de diabetes"
                unit="anos"
                value={i.dmYears}
                onChange={(v) => set('dmYears', v)}
              />
              {patient.type === 'DM1' ? (
                <RadioGroup
                  legend="DM1 diagnosticado"
                  value={i.dmDiagnosedAfter18 ? 'depois' : 'antes'}
                  options={[
                    { value: 'depois', label: 'após os 18 anos' },
                    { value: 'antes', label: 'antes dos 18' },
                  ]}
                  onChange={(v) => set('dmDiagnosedAfter18', v === 'depois')}
                />
              ) : null}
            </div>
          ) : null}
        </Group>

        <Group title="Exames" open>
          <div className="fields">
            <NumberField
              label="Colesterol total"
              unit="mg/dL"
              value={i.totalChol}
              onChange={(v) => set('totalChol', v)}
            />
            <NumberField label="HDL" unit="mg/dL" value={i.hdl} onChange={(v) => set('hdl', v)} />
            <NumberField label="LDL" unit="mg/dL" value={i.ldl} onChange={(v) => set('ldl', v)} />
            <NumberField
              label="Creatinina"
              unit="mg/dL"
              value={creatinine}
              onChange={setCreatinine}
              hint={egfrCalc ? `TFGe ${egfrCalc} (CKD-EPI 2021)` : 'Calcula a TFGe (CKD-EPI 2021).'}
            />
            {creatinine === null ? (
              <NumberField
                label="ou TFGe"
                unit="mL/min/1,73 m²"
                value={f.egfr}
                onChange={(v) => set('egfr', v)}
              />
            ) : null}
            <NumberField
              label="Albumina/creatinina urinária"
              unit="mg/g"
              value={i.uacr}
              onChange={(v) => set('uacr', v)}
              hint={
                renal === 'alto'
                  ? 'Grade renal: risco alto'
                  : renal === 'muito-alto'
                    ? 'Grade renal: risco muito alto'
                    : undefined
              }
            />
            <NumberField label="HbA1c" unit="%" value={i.hba1c} onChange={(v) => set('hba1c', v)} />
          </div>
          <details className="more">
            <summary>Lp(a), NT-proBNP e escore de cálcio</summary>
            <div className="fields more-body">
              <NumberField
                label="Lp(a)"
                unit="mg/dL"
                value={i.lpaMgDl}
                onChange={(v) => set('lpaMgDl', v)}
              />
              <NumberField
                label="ou Lp(a)"
                unit="nmol/L"
                value={i.lpaNmolL}
                onChange={(v) => set('lpaNmolL', v)}
              />
              <NumberField
                label="NT-proBNP"
                unit="pg/mL"
                value={i.ntProBnp}
                onChange={(v) => set('ntProBnp', v)}
              />
              <NumberField
                label="Escore de cálcio (CAC)"
                unit="UA"
                value={i.cac}
                onChange={(v) => set('cac', v)}
              />
            </div>
            <Check
              label="CAC acima do percentil 75 para sexo e idade"
              checked={i.cacAbove75thPercentile}
              onChange={(v) => set('cacAbove75thPercentile', v)}
            />
          </details>
        </Group>

        <Group title="Doença cardiovascular estabelecida" count={eventCount}>
          <div className="checks">
            <Check
              label="Síndrome coronária aguda nos últimos 12 meses"
              checked={i.recentAcs}
              onChange={(v) => set('recentAcs', v)}
            />
            <Check
              label="IAM prévio ou angina estável"
              checked={i.priorMi}
              onChange={(v) => set('priorMi', v)}
            />
            <Check
              label="AVC isquêmico ou AIT"
              checked={i.ischemicStroke}
              onChange={(v) => set('ischemicStroke', v)}
            />
            <Check
              label="Revascularização (coronária, carotídea, renal ou periférica)"
              checked={i.revascularization}
              onChange={(v) => set('revascularization', v)}
            />
            <Check
              label="Doença arterial periférica sintomática ou amputação"
              checked={i.pad}
              onChange={(v) => set('pad', v)}
            />
            {eventCount ? (
              <>
                <Check
                  label="Múltiplos eventos ateroscleróticos maiores"
                  checked={i.multipleEvents}
                  onChange={(v) => set('multipleEvents', v)}
                />
                <Check
                  label="Evento agudo há menos de 2 anos"
                  checked={i.eventUnder2Years}
                  onChange={(v) => set('eventUnder2Years', v)}
                />
                <Check
                  label="LDL ≥ 100 mg/dL apesar de estatina máxima + ezetimiba"
                  checked={i.ldlHighDespiteMaxTherapy}
                  onChange={(v) => set('ldlHighDespiteMaxTherapy', v)}
                />
              </>
            ) : null}
          </div>
        </Group>

        <Group
          title="Aterosclerose subclínica e outros"
          count={
            [
              i.stenosisOver50,
              i.carotidPlaque,
              i.coronaryCtPlaque,
              i.aaa,
              i.abnormalAbi,
              i.familialHypercholesterolemia,
            ].filter(Boolean).length
          }
        >
          <div className="checks">
            <Check
              label="Estenose ≥ 50% em qualquer território"
              checked={i.stenosisOver50}
              onChange={(v) => set('stenosisOver50', v)}
            />
            <Check
              label="Placa carotídea (< 50% ou EIMC ≥ 1,5 mm)"
              checked={i.carotidPlaque}
              onChange={(v) => set('carotidPlaque', v)}
            />
            <Check
              label="Placa < 50% na angiotomografia coronária"
              checked={i.coronaryCtPlaque}
              onChange={(v) => set('coronaryCtPlaque', v)}
            />
            <Check
              label="Aneurisma de aorta abdominal"
              checked={i.aaa}
              onChange={(v) => set('aaa', v)}
            />
            <Check
              label="Índice tornozelo-braquial alterado"
              checked={i.abnormalAbi}
              onChange={(v) => set('abnormalAbi', v)}
            />
            <Check
              label="Hipercolesterolemia familiar confirmada"
              checked={i.familialHypercholesterolemia}
              onChange={(v) => set('familialHypercholesterolemia', v)}
            />
          </div>
        </Group>

        {i.diabetes ? (
          <Group title="Estratificadores do diabetes" count={dmCount}>
            <div className="checks">
              <Check
                label="História familiar de DAC prematura (pai, mãe ou irmãos: < 55 anos H, < 65 anos M)"
                checked={i.prematureCadFamily}
                onChange={(v) => set('prematureCadFamily', v)}
              />
              <Check
                label="Síndrome metabólica (IDF): cintura ≥ 94 cm H / ≥ 80 cm M + 2 de: TG ≥ 150; HDL < 40 H / < 50 M; PA ≥ 130/85 ou tratamento; glicemia ≥ 100"
                checked={i.metabolicSyndrome}
                onChange={(v) => set('metabolicSyndrome', v)}
              />
              <Check
                label="Nefropatia (PCDT, ≤ 39 anos)"
                checked={i.nephropathy}
                onChange={(v) => set('nephropathy', v)}
              />
            </div>
            <div className="fields">
              <SelectField<Retinopathy>
                label="Retinopatia diabética"
                value={i.retinopathy}
                options={[
                  { value: 'nenhuma', label: 'Ausente' },
                  { value: 'np-leve', label: 'Não proliferativa leve' },
                  {
                    value: 'moderada-grave',
                    label: 'Moderada-grave, proliferativa ou em progressão',
                  },
                ]}
                onChange={(v) => set('retinopathy', v)}
              />
              <SelectField<Neuropathy>
                label="Neuropatia autonômica cardiovascular"
                value={i.neuropathy}
                options={[
                  { value: 'nenhuma', label: 'Ausente' },
                  { value: 'incipiente', label: 'Incipiente (1 teste alterado)' },
                  { value: 'instalada', label: 'Instalada (2 testes alterados)' },
                ]}
                onChange={(v) => set('neuropathy', v)}
              />
            </div>
          </Group>
        ) : (
          <Group title="Fatores agravantes (sem diabetes)" count={i.aggravators.length}>
            <div className="checks">
              {AGGRAVATORS.map((a) => (
                <Check
                  key={a}
                  label={a}
                  checked={i.aggravators.includes(a)}
                  onChange={(v) =>
                    set(
                      'aggravators',
                      v ? [...f.aggravators, a] : f.aggravators.filter((x) => x !== a),
                    )
                  }
                />
              ))}
            </div>
            <p className="hint-inline">
              Lp(a) ≥ 50 mg/dL (≥ 125 nmol/L) conta como agravante automaticamente.
            </p>
          </Group>
        )}
      </div>

      <Comparison
        i={i}
        results={results}
        prev={prev}
        whoLab={whoLab}
        whoNonLab={whoNonLab}
        current={scale}
      />
    </>
  )
}

// ---------------------------------------------------------------------------------------------
function TargetBlock({ r }: { r: ScaleResult }) {
  if (!r.target) return null
  return (
    <Result label="Metas lipídicas" value={`LDL ${r.target.ldl}`} unit="mg/dL" tone="info">
      Não-HDL {r.target.nonHdl} mg/dL{r.target.apoB ? ` · ApoB ${r.target.apoB} mg/dL` : ''}
      {r.target.reduction ? ` · redução de LDL ${r.target.reduction}` : ''}
      {r.target.statin ? (
        <>
          <br />
          {r.target.statin}
        </>
      ) : null}
    </Result>
  )
}

function CategoryView({ r, scale }: { r: ScaleResult; scale: ScaleId }) {
  return (
    <div className="card">
      {!r.applicable ? (
        <Alert tone="neutral">{r.notes.join(' ')}</Alert>
      ) : (
        <>
          <Results>
            <Result
              label="Risco cardiovascular"
              value={CATEGORY_LABEL[r.category]}
              tone={CAT_TONE[r.category]}
            >
              {r.reasons.length ? (
                <ul>
                  {r.reasons.map((x) => (
                    <li key={x}>{x}</li>
                  ))}
                </ul>
              ) : null}
            </Result>
            <TargetBlock r={r} />
          </Results>
          {r.notes.map((n) => (
            <Alert key={n} tone="info">
              {n}
            </Alert>
          ))}
        </>
      )}
      <Details summary="Fonte">
        <Src href={SOURCES[scale].href}>{SOURCES[scale].text}.</Src>
      </Details>
    </div>
  )
}

function ScaleView(props: {
  scale: ScaleId
  i: RiskInputs
  results: Record<'sbc' | 'sbd' | 'pcdt', ScaleResult>
  prev: PreventResult | null
  prevProblems: string[]
  whoLab: WhoResult | null
  whoNonLab: WhoResult | null
}) {
  const { scale, i } = props
  if (scale === 'sbc' || scale === 'sbd' || scale === 'pcdt') {
    return (
      <>
        <CategoryView r={props.results[scale]} scale={scale} />
        {scale === 'pcdt' && i.diabetes && i.dmType === 'DM2' ? (
          <Alert tone="info">
            O PCDT indica a calculadora HEARTS (OMS/OPAS) de 40 a 74 anos; veja a opção OMS/HEARTS.
          </Alert>
        ) : null}
      </>
    )
  }
  if (scale === 'oms') {
    const w = (r: WhoResult | null, title: string, missing: string, extra?: string) =>
      r ? (
        <Result label={title} value={`${r.pct}%`} tone={WHO_TONE[r.category]}>
          Risco {r.category.toLowerCase()} em 10 anos (infarto, AVC ou morte cardiovascular). Valor
          exato: {fmt(r.continuousPct, 1)}%.
          {extra ? ` ${extra}` : ''}
        </Result>
      ) : (
        <Result label={title} value="—">
          {missing}
        </Result>
      )
    const outside = props.whoLab?.outsideAge || props.whoNonLab?.outsideAge
    return (
      <div className="card">
        <Results>
          {w(
            props.whoLab,
            'Com exames (colesterol)',
            'Informe idade, PA sistólica e colesterol total.',
            i.diabetes ? 'Inclui diabetes.' : 'Sem diabetes.',
          )}
          {w(
            props.whoNonLab,
            'Sem exames (IMC)',
            'Informe idade, PA sistólica e altura/peso (IMC).',
            'Não considera diabetes.',
          )}
        </Results>
        {outside ? (
          <Alert tone="warn">
            A calculadora vale de 40 a 74 anos; fora disso o valor é só ilustrativo.
          </Alert>
        ) : null}
        {i.diabetes ? (
          <Alert tone="info">
            Pelo PCDT DM2, quem tem DM2 já é de alto risco, qualquer que seja o resultado da
            calculadora.
          </Alert>
        ) : null}
        <Details summary="Como foi calculado e fonte">
          <p>
            Modelo da OMS 2019 recalibrado para a América Latina Tropical (Brasil). Como na
            calculadora HEARTS, o valor principal usa a faixa de idade, PA e colesterol (ou IMC); o
            “valor exato” usa os números informados. Categorias: &lt; 5% baixo; 5–9% moderado;
            10–19% alto; 20–29% muito alto; ≥ 30% crítico.
          </p>
          <Src href={SOURCES.oms.href}>{SOURCES.oms.text}.</Src>
        </Details>
      </div>
    )
  }
  // PREVENT
  const p = props.prev
  const hasEvent = i.recentAcs || i.priorMi || i.ischemicStroke || i.revascularization || i.pad
  return (
    <div className="card">
      {hasEvent ? (
        <Alert tone="warn">O PREVENT é para quem não tem doença cardiovascular estabelecida.</Alert>
      ) : !p ? (
        <Alert tone="info">Para calcular: {props.prevProblems.join('; ')}.</Alert>
      ) : (
        <>
          <Results>
            <Result
              label="Aterosclerótica (ASCVD) 10 anos"
              value={pct(p.tenYear.ascvd)}
              tone={p.tenYear.ascvd >= 0.2 ? 'danger' : p.tenYear.ascvd >= 0.05 ? 'warn' : 'ok'}
            >
              Infarto, AVC ou morte coronária. Faixas da SBC 2025: &lt; 5% baixo; 5 a &lt; 20%
              intermediário; ≥ 20% alto.
            </Result>
            <Result label="DCV total 10 anos" value={p.bmiMissing ? '—' : pct(p.tenYear.total_cvd)}>
              {p.bmiMissing
                ? 'Requer IMC (altura e peso) de 18,5 a 39,9.'
                : 'ASCVD + insuficiência cardíaca.'}
            </Result>
            <Result
              label="Insuficiência cardíaca 10 anos"
              value={p.bmiMissing ? '—' : pct(p.tenYear.heart_failure)}
            />
            {p.thirtyYear ? (
              <Result label="ASCVD 30 anos" value={pct(p.thirtyYear.ascvd)}>
                {p.bmiMissing
                  ? null
                  : `DCV total ${pct(p.thirtyYear.total_cvd)} · IC ${pct(p.thirtyYear.heart_failure)}`}
              </Result>
            ) : null}
          </Results>
          <p className="hint-inline">
            Modelo usado:{' '}
            {p.model === 'base'
              ? 'básico'
              : p.model === 'hba1c'
                ? 'com HbA1c'
                : p.model === 'uacr'
                  ? 'com albuminúria'
                  : 'com HbA1c e albuminúria'}
            .{i.diabetes ? ' Diabetes considerado como fator.' : ' Sem diabetes.'}
          </p>
          {i.diabetes ? (
            <Alert tone="info">
              A SBC 2025 e a SBD não usam o PREVENT para quem tem diabetes; o valor é informativo.
            </Alert>
          ) : null}
        </>
      )}
      <Details summary="Como foi calculado e fonte">
        <p>
          Equações PREVENT de 30 a 79 anos, sem doença cardiovascular. Colesterol total 130–320, HDL
          20–100, PA 90–180, TFGe 15–140 (CKD-EPI 2021). HbA1c e albuminúria são opcionais e mudam o
          modelo. O índice social (SDI) é dos EUA e não é usado. O horizonte de 30 anos é mostrado
          até 59 anos.
        </p>
        <Src href={SOURCES.prevent.href}>{SOURCES.prevent.text}.</Src>
      </Details>
    </div>
  )
}

function Comparison(props: {
  i: RiskInputs
  results: Record<'sbc' | 'sbd' | 'pcdt', ScaleResult>
  prev: PreventResult | null
  whoLab: WhoResult | null
  whoNonLab: WhoResult | null
  current: ScaleId
}) {
  const r = props.results
  const row = (id: ScaleId, label: string, result: string, target: string) => (
    <tr key={id} className={props.current === id ? 'current' : undefined}>
      <td>{label}</td>
      <td>{result}</td>
      <td>{target}</td>
    </tr>
  )
  const cat = (x: ScaleResult) => (x.applicable ? CATEGORY_LABEL[x.category] : 'Não se aplica')
  const tgt = (x: ScaleResult) => (x.target ? `LDL ${x.target.ldl}` : '—')
  const who = props.whoLab ?? props.whoNonLab
  return (
    <div className="card">
      <h3>Comparação entre as escalas</h3>
      <table>
        <thead>
          <tr>
            <th>Escala</th>
            <th>Resultado</th>
            <th>Meta de LDL (mg/dL)</th>
          </tr>
        </thead>
        <tbody>
          {row('sbc', 'SBC 2025', cat(r.sbc), tgt(r.sbc))}
          {row('sbd', 'SBD 2026', cat(r.sbd), tgt(r.sbd))}
          {row('pcdt', 'PCDT DM2 2026', cat(r.pcdt), '—')}
          {row('oms', 'OMS/HEARTS', who ? `${who.pct}% (${who.category.toLowerCase()})` : '—', '—')}
          {row(
            'prevent',
            'PREVENT',
            props.prev ? `ASCVD 10 anos ${pct(props.prev.tenYear.ascvd)}` : '—',
            '—',
          )}
        </tbody>
      </table>
    </div>
  )
}
