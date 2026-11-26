import { useEffect, useMemo, useState } from 'react'
import { downloadText, nowStamp } from '../shared/download'
import { NumberField, SelectField } from '../shared/NumberField'
import {
  DEFAULT_TARGET,
  MGDL_PER_MMOL,
  TARGET_BOUNDS,
  type PeriodDays,
  type Reading,
  type Unit,
  computeStats,
  countFuture,
  countUndated,
  dedupeReadings,
  periodDayCount,
  dayDiffFromToday,
  filterPeriod,
  formatGlucose,
  formatPct,
  mmolToMgdl,
  readingLabel,
  resolveTarget,
  sanitizeReadings,
  statsByDayPeriod,
  toCsv,
  toReadings,
} from './analysis'
import { GlucoseChart, RangeBar, ZoneKey } from './GlucoseChart'
import { FakeMeter, demoReadings } from './phdc/fakeMeter'
import { type DownloadResult, type Progress, SessionError, downloadMeter } from './phdc/manager'
import { formatDeviceDateTime } from './phdc/types'
import { UsbError, requestMeter, usbSupport } from './usbTransport'

type State =
  | { kind: 'idle' }
  | { kind: 'reading'; progress: Progress | null }
  | {
      kind: 'loaded'
      result: DownloadResult
      readings: Reading[]
      duplicates: number
      implausible: number
      mmolSuspect: boolean
      demo: boolean
      at: string
    }
  | { kind: 'error'; message: string; code: string }

const STEP_LABEL: Record<Progress['step'], string> = {
  associating: 'Aguardando o glicosímetro iniciar a comunicação…',
  config: 'Lendo a configuração do aparelho…',
  'device-info': 'Lendo modelo e número de série…',
  segments: 'Consultando a memória…',
  transfer: 'Baixando as medições…',
  releasing: 'Encerrando a conexão…',
  done: 'Concluído.',
}

const PERIODS: { value: string; label: string }[] = [
  { value: '7', label: 'Últimos 7 dias' },
  { value: '14', label: 'Últimos 14 dias' },
  { value: '30', label: 'Últimos 30 dias' },
  { value: '90', label: 'Últimos 90 dias' },
  { value: 'all', label: 'Toda a memória' },
]

const fmtPct = formatPct
const fmtDate = (key: string | null) =>
  key ? key.slice(0, 10).split('-').reverse().join('/') : '—'

export function GlicosimetroPage(props: { onDataChange?: (hasData: boolean) => void }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [period, setPeriod] = useState('14')
  const [unit, setUnit] = useState<Unit>('mg/dL')
  // O alvo é guardado em mg/dL; a unidade escolhida só muda a exibição.
  const [lowMg, setLowMg] = useState<number | null>(DEFAULT_TARGET.low)
  const [highMg, setHighMg] = useState<number | null>(DEFAULT_TARGET.high)
  const [patientLabel, setPatientLabel] = useState('')
  const support = usbSupport()
  const { onDataChange } = props

  useEffect(() => {
    onDataChange?.(state.kind === 'loaded')
  }, [state.kind, onDataChange])

  async function run(demo: boolean) {
    setState({ kind: 'reading', progress: null })
    let close: (() => Promise<void>) | null = null
    try {
      let transport
      if (demo) {
        transport = new FakeMeter({
          readings: demoReadings(),
          serialNumber: 'DEMO0001',
          chunkSize: 64,
        })
      } else {
        const meter = await requestMeter()
        transport = meter.transport
        close = meter.close
      }
      const result = await downloadMeter(transport, {
        onProgress: (p) => setState({ kind: 'reading', progress: p }),
        associationTimeoutMs: demo ? 2_000 : 12_000,
      })
      const unique = dedupeReadings(toReadings(result.readings))
      const clean = sanitizeReadings(unique.readings)
      setState({
        kind: 'loaded',
        result,
        readings: clean.readings,
        duplicates: unique.duplicates,
        implausible: clean.implausible,
        mmolSuspect: clean.mmolSuspect,
        demo,
        at: nowStamp().human,
      })
    } catch (e) {
      if (e instanceof UsbError && e.code === 'cancelled') setState({ kind: 'idle' })
      else if (e instanceof UsbError || e instanceof SessionError)
        setState({ kind: 'error', message: e.message, code: e.code })
      else
        setState({
          kind: 'error',
          message: 'Falha inesperada na comunicação com o glicosímetro.',
          code: 'unknown',
        })
    } finally {
      await close?.()
    }
  }

  function clear() {
    setState({ kind: 'idle' })
    setPatientLabel('')
  }

  return (
    <div>
      <h2>Glicosímetro Accu-Chek (cabo USB)</h2>
      {state.kind !== 'loaded' ? (
        <ConnectPanel
          support={support}
          state={state}
          onConnect={() => void run(false)}
          onDemo={() => void run(true)}
        />
      ) : (
        <Report
          state={state}
          period={period}
          setPeriod={setPeriod}
          unit={unit}
          setUnit={setUnit}
          lowMg={lowMg}
          setLowMg={setLowMg}
          highMg={highMg}
          setHighMg={setHighMg}
          patientLabel={patientLabel}
          setPatientLabel={setPatientLabel}
          onClear={clear}
        />
      )}
    </div>
  )
}

function ConnectPanel(props: {
  support: ReturnType<typeof usbSupport>
  state: State
  onConnect: () => void
  onDemo: () => void
}) {
  const busy = props.state.kind === 'reading'
  return (
    <>
      <div className="card">
        <p style={{ marginTop: 0 }}>
          Lê a memória de glicosímetros Accu-Chek em mg/dL com porta micro-USB (modelos previstos:
          Guide, Guide Me, Instant, Instant S, Performa Connect, Aviva Connect e ReliOn Platinum).
          As medições aparecem só nesta tela: a página não envia nem guarda nada. Fica no computador
          apenas o que você exportar (CSV, PDF ou diagnóstico), e esses arquivos contêm dado de
          saúde.
        </p>
        <ol>
          <li>Use Chrome ou Edge no computador (ou Chrome no Android, com adaptador OTG).</li>
          <li>Feche outros programas do glicosímetro (Accu-Chek 360°, Smart Pix, Tidepool).</li>
          <li>
            Ligue o cabo micro-USB ao glicosímetro e ao computador. O aparelho indica a
            transferência no visor.
          </li>
          <li>Clique em “Conectar glicosímetro” e escolha o aparelho na janela do navegador.</li>
        </ol>
        {props.support === 'no-webusb' ? (
          <p className="note warn">
            <strong>Navegador sem WebUSB.</strong> Abra esta página no Chrome ou no Edge. Firefox e
            Safari não permitem acesso a USB.
          </p>
        ) : null}
        {props.support === 'insecure-context' ? (
          <p className="note warn">
            <strong>Página sem HTTPS.</strong> O navegador só libera USB em páginas https:// ou em
            localhost.
          </p>
        ) : null}
        <div className="actions">
          <button
            type="button"
            className="primary"
            disabled={busy || props.support !== 'ok'}
            onClick={props.onConnect}
          >
            Conectar glicosímetro
          </button>
          <button type="button" className="secondary" disabled={busy} onClick={props.onDemo}>
            Ver demonstração (dados fictícios)
          </button>
        </div>
        <div aria-live="polite" style={{ marginTop: 12 }}>
          {props.state.kind === 'reading' ? (
            <p>
              {props.state.progress
                ? STEP_LABEL[props.state.progress.step]
                : 'Aguardando a escolha do aparelho…'}
              {props.state.progress?.step === 'transfer'
                ? ` ${props.state.progress.received}${props.state.progress.expected ? ` de ${props.state.progress.expected}` : ''}`
                : ''}
            </p>
          ) : null}
          {props.state.kind === 'error' ? (
            <p className="note danger" role="alert">
              <strong>Não foi possível ler o glicosímetro.</strong> {props.state.message}
            </p>
          ) : null}
        </div>
      </div>
      <details className="card">
        <summary>Ajuda: o aparelho não aparece ou não abre</summary>
        <ul>
          <li>
            Se o glicosímetro não aparece na janela do navegador, troque o cabo (alguns cabos só
            carregam, não transmitem dados) e reconecte com o aparelho desligado.
          </li>
          <li>
            Se aparece mas não abre, outro programa está usando o aparelho, ou o sistema prendeu o
            aparelho a um driver próprio. No Windows, o navegador só acessa o aparelho com o driver
            genérico <em>WinUSB</em>. A ferramenta gratuita Zadig instala esse driver para o
            “ACCU-CHEK” (VID 173A). Isso afeta o Accu-Chek 360° no mesmo computador, que volta a
            funcionar ao reinstalar o driver da Roche.
          </li>
          <li>
            No Linux, o usuário precisa de permissão no dispositivo USB (regra udev para o
            fabricante 173a).
          </li>
          <li>
            “Ficou conectado tempo demais”: alguns aparelhos encerram a sessão USB depois de um
            tempo parados. Desconecte, reconecte e clique de novo.
          </li>
          <li>
            Modelos sem porta USB (Active, Performa antigo) e o Accu-Chek Mobile não usam este
            protocolo e não são lidos aqui.
          </li>
        </ul>
      </details>
    </>
  )
}

function Report(props: {
  state: Extract<State, { kind: 'loaded' }>
  period: string
  setPeriod: (v: string) => void
  unit: Unit
  setUnit: (v: Unit) => void
  lowMg: number | null
  setLowMg: (v: number | null) => void
  highMg: number | null
  setHighMg: (v: number | null) => void
  patientLabel: string
  setPatientLabel: (v: string) => void
  onClear: () => void
}) {
  const { result, readings, duplicates, implausible, mmolSuspect, demo, at } = props.state
  const toMgdl = (v: number | null) =>
    v === null ? null : props.unit === 'mmol/L' ? mmolToMgdl(v) : v
  const toDisplay = (mg: number | null) =>
    mg === null ? null : props.unit === 'mmol/L' ? Math.round((mg / MGDL_PER_MMOL) * 10) / 10 : mg
  const resolved = useMemo(
    () => resolveTarget(props.lowMg, props.highMg),
    [props.lowMg, props.highMg],
  )
  const target = resolved.target
  const days: PeriodDays = props.period === 'all' ? 'all' : (Number(props.period) as PeriodDays)
  const shown = useMemo(() => filterPeriod(readings, days), [readings, days])
  const periodLabel = PERIODS.find((p) => p.value === props.period)?.label ?? ''
  const stats = useMemo(() => computeStats(shown, target), [shown, target])
  const byPeriod = useMemo(() => statsByDayPeriod(shown, target), [shown, target])
  const d = result.device
  const deviceLabel =
    d.modelName ?? (d.modelNumber ? `Roche modelo ${d.modelNumber}` : 'Glicosímetro Roche')
  const g = (v: number | null) => (v === null ? '—' : formatGlucose(v, props.unit))
  const future = useMemo(() => countFuture(readings), [readings])
  const undated = useMemo(() => countUndated(readings), [readings])
  const clockOff = d.clock !== null && Math.abs(dayDiffFromToday(d.clock)) > 1
  const minLabel = (s: { lo: number; min: number | null }) => (s.lo > 0 ? 'LO' : g(s.min))
  const maxLabel = (s: { hi: number; max: number | null }) => (s.hi > 0 ? 'HI' : g(s.max))
  const pctN = (p: number | null, n: number) => `${fmtPct(p)} (${n} de ${stats.count})`

  function changeUnit(u: Unit) {
    props.setUnit(u)
  }

  function exportCsv() {
    const stamp = nowStamp()
    const tag = props.period === 'all' ? 'toda-memoria' : `ultimos-${props.period}-dias`
    downloadText(
      `glicemias-${tag}-${stamp.file}.csv`,
      toCsv(shown, props.unit),
      'text/csv;charset=utf-8',
    )
  }

  function exportTraffic() {
    const lines = result.traffic.map((t) => `${t.dir === 'in' ? '<-' : '->'} ${t.hex}`)
    downloadText(
      `diagnostico-usb-${nowStamp().file}.txt`,
      [
        '# Tráfego IEEE 11073 da leitura (contém as medições). Use só para diagnóstico.',
        `# Aparelho: ${deviceLabel}; modelo ${d.modelNumber ?? '?'}; segmentos: ${JSON.stringify(result.segments)}`,
        ...lines,
      ].join('\n'),
      'text/plain;charset=utf-8',
    )
  }

  return (
    <>
      {demo ? (
        <p className="note warn">
          <strong>Demonstração.</strong> Dados fictícios gerados pela própria página, para conhecer
          a tela.
        </p>
      ) : null}

      {!demo ? (
        <div className="note warn">
          <p style={{ margin: 0 }}>
            <strong>Leitura ainda não validada com aparelho físico.</strong> Confira as medições,
            datas e horas no visor do aparelho.
          </p>
          {result.segments.some((s) => !s.hasEntryMap) ? (
            <p style={{ margin: '4px 0 0' }}>
              Este aparelho não informa o tipo de cada teste: testes com solução de controle não são
              identificados e entram no resumo.
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="print-only">
        <h1 style={{ fontSize: '1.3rem', margin: 0 }}>Relatório de glicemias capilares</h1>
        {props.patientLabel ? (
          <p style={{ margin: '4px 0' }}>Paciente: {props.patientLabel}</p>
        ) : null}
      </div>

      <div className="card">
        <div className="grid2">
          <div>
            <h3>{deviceLabel}</h3>
            <div style={{ fontSize: 14, color: 'var(--ink-2)' }}>
              {d.serialNumber ? <>Série {d.serialNumber} · </> : null}
              {readings.length} medições na memória · lido em {at}
              <br />
              Relógio do aparelho:{' '}
              {d.clock ? formatDeviceDateTime(d.clock).slice(0, 16) : 'não informado'}
            </div>
            {duplicates > 0 ? (
              <p className="note" style={{ fontSize: 13 }}>
                {duplicates}{' '}
                {duplicates === 1 ? 'medição repetida ignorada' : 'medições repetidas ignoradas'}{' '}
                (mesma data, hora e valor).
              </p>
            ) : null}
            <p className="note" style={{ fontSize: 13 }}>
              Data e hora são as do relógio do glicosímetro. Se o relógio estiver errado, as datas
              também estarão.
            </p>
            {clockOff ? (
              <p className="note warn" style={{ fontSize: 13 }}>
                O relógio do aparelho difere do relógio deste computador em mais de 1 dia. Confira
                data e hora no aparelho.
              </p>
            ) : null}
            {future > 0 ? (
              <p className="note warn" style={{ fontSize: 13 }}>
                {future} {future === 1 ? 'medição tem' : 'medições têm'} data posterior a hoje
                (relógio do computador). O relógio do aparelho pode estar errado. Essas medições
                ficam fora dos períodos de 7 a 90 dias; só “Toda a memória” as inclui.
              </p>
            ) : null}
            {result.declaredUnit === null ? (
              <p className="note warn" style={{ fontSize: 13 }}>
                O aparelho não informou a unidade; os valores foram lidos como mg/dL. Confira no
                visor.
              </p>
            ) : null}
            {implausible > 0 ? (
              <p className="note warn" style={{ fontSize: 13 }}>
                {implausible} {implausible === 1 ? 'registro tem valor' : 'registros têm valor'}{' '}
                fora de 10–600 mg/dL (impossível para o aparelho) e{' '}
                {implausible === 1 ? 'ficou' : 'ficaram'} fora do resumo.
              </p>
            ) : null}
          </div>
          <div className="no-print">
            <div className="field">
              <label htmlFor="patient-label">Identificação no relatório impresso (opcional)</label>
              <input
                id="patient-label"
                type="text"
                value={props.patientLabel}
                autoComplete="off"
                onChange={(e) => props.setPatientLabel(e.target.value)}
              />
              <span className="hint">
                Fica só nesta tela e no PDF que você gerar (nome de paciente é dado pessoal).
              </span>
            </div>
            <span className="hint">
              O CSV leva só o período escolhido abaixo ({periodLabel.toLowerCase()}); o nome do
              arquivo traz o período.
            </span>
            <div className="actions" style={{ marginTop: 12 }}>
              <button type="button" className="primary" disabled={mmolSuspect} onClick={exportCsv}>
                Exportar CSV
              </button>
              <button type="button" className="secondary" onClick={() => window.print()}>
                Imprimir / salvar PDF
              </button>
              <button type="button" className="secondary" onClick={props.onClear}>
                Apagar e ler outro
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card no-print">
        <div className="fields">
          <SelectField
            label="Período"
            value={props.period}
            options={PERIODS}
            onChange={props.setPeriod}
          />
          <SelectField
            label="Unidade"
            value={props.unit}
            options={[
              { value: 'mg/dL', label: 'mg/dL' },
              { value: 'mmol/L', label: 'mmol/L' },
            ]}
            onChange={(v) => changeUnit(v as Unit)}
          />
          <NumberField
            label="Alvo mínimo"
            unit={props.unit}
            value={toDisplay(props.lowMg)}
            onChange={(v) => props.setLowMg(toMgdl(v))}
          />
          <NumberField
            label="Alvo máximo"
            unit={props.unit}
            value={toDisplay(props.highMg)}
            onChange={(v) => props.setHighMg(toMgdl(v))}
          />
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Os dias do período contam a partir da última medição, não de hoje.
          {props.period !== 'all' && undated > 0
            ? ` ${undated} ${undated === 1 ? 'medição sem data não entra' : 'medições sem data não entram'} neste período.`
            : ''}
        </p>
        {resolved.invalid ? (
          <p className="note warn">
            O alvo precisa ficar entre {g(TARGET_BOUNDS.min)} e {g(TARGET_BOUNDS.max)} {props.unit},
            com o mínimo menor que o máximo. Usando o padrão {g(DEFAULT_TARGET.low)}–
            {g(DEFAULT_TARGET.high)} {props.unit}.
          </p>
        ) : null}
        {resolved.lowEmpty || resolved.highEmpty ? (
          <p className="note warn">
            Campo de alvo vazio: usando o padrão
            {resolved.lowEmpty ? ` mínimo ${g(DEFAULT_TARGET.low)} ${props.unit}` : ''}
            {resolved.lowEmpty && resolved.highEmpty ? ' e' : ''}
            {resolved.highEmpty ? ` máximo ${g(DEFAULT_TARGET.high)} ${props.unit}` : ''}.
          </p>
        ) : null}
      </div>

      {mmolSuspect ? (
        <div className="card">
          <p className="note danger" role="alert" style={{ margin: 0 }}>
            <strong>Os valores parecem estar em mmol/L.</strong> Todos os valores lidos são menores
            que 30, o que não é possível em mg/dL. Por segurança, o resumo, o gráfico e a exportação
            ficam bloqueados. Confira a unidade no visor do aparelho.
          </p>
        </div>
      ) : (
        <>
          <div className="card">
            <h3>
              Resumo · {fmtDate(stats.firstKey)} a {fmtDate(stats.lastKey)}
            </h3>
            <div className="results">
              <Tile
                label="Média"
                value={g(stats.mean)}
                unit={props.unit}
                sub={`${stats.numeric} medições com valor`}
              />
              <Tile
                label="Desvio padrão"
                value={g(stats.sd)}
                unit={props.unit}
                sub={stats.cv === null ? '' : `CV ${stats.cv.toFixed(0)}%`}
              />
              <Tile
                label="Medições por dia (só nos dias com medição)"
                value={stats.perDay === null ? '—' : stats.perDay.toFixed(1).replace('.', ',')}
                sub={`Mediu em ${stats.days} de ${periodDayCount(shown, days)} dias (da 1ª à última medição)`}
              />
              <Tile
                label={`Abaixo de ${g(54)} ${props.unit}`}
                value={fmtPct(stats.pctBelow54)}
                sub={`${stats.below54N} de ${stats.count} (LO: ${stats.lo})`}
              />
              <Tile
                label={`Acima de ${g(250)} ${props.unit}`}
                value={fmtPct(stats.pctAbove250)}
                sub={`${stats.above250N} de ${stats.count} (HI: ${stats.hi})`}
              />
              <Tile
                label="Menor / maior"
                value={`${minLabel(stats)} / ${maxLabel(stats)}`}
                unit={props.unit}
              />
            </div>
            {stats.pctInRange !== null ? (
              <>
                <RangeBar
                  below={stats.pctBelow ?? 0}
                  inRange={stats.pctInRange}
                  above={stats.pctAbove ?? 0}
                />
                <div className="actions" style={{ gap: 16, fontSize: 14 }}>
                  <span className="badge" style={{ fontWeight: 400 }}>
                    <ZoneKey zone="low" /> Abaixo de {g(target.low)}:{' '}
                    {pctN(stats.pctBelow, stats.belowN)}
                  </span>
                  <span className="badge" style={{ fontWeight: 400 }}>
                    <ZoneKey zone="in" /> No alvo: {pctN(stats.pctInRange, stats.inRangeN)}
                  </span>
                  <span className="badge" style={{ fontWeight: 400 }}>
                    <ZoneKey zone="high" /> Acima de {g(target.high)}:{' '}
                    {pctN(stats.pctAbove, stats.aboveN)}
                  </span>
                </div>
              </>
            ) : null}
            {stats.control > 0 ? (
              <p className="source">
                {stats.control} testes com solução de controle ficaram fora do resumo.
              </p>
            ) : null}
            {stats.invalid > 0 ? (
              <p className="source">
                {stats.invalid} registros sem valor numérico ficaram fora do resumo.
              </p>
            ) : null}
            <p className="source">
              {stats.count} medições capilares (glicemia de ponta de dedo, não sensor CGM). Os
              percentuais são sobre medições pontuais, não sobre tempo contínuo, e com poucas
              medições são só indicativos. Média, desvio padrão, menor e maior não incluem HI/LO
              (que aparecem como HI e LO).
            </p>
            <p className="source">
              Fonte: Battelino T et al. Clinical Targets for CGM Data Interpretation:
              Recommendations From the International Consensus on Time in Range. Diabetes Care
              2019;42(8):1593–1603 (doi 10.2337/dci19-0028). Limiares da fonte: alvo 70–180 mg/dL
              (3,9–10,0 mmol/L); abaixo de 70 e de 54 mg/dL; acima de 180 e de 250 mg/dL. Alvo em
              uso nesta tela: {g(target.low)}–{g(target.high)} {props.unit} (ajustável entre{' '}
              {g(TARGET_BOUNDS.min)} e {g(TARGET_BOUNDS.max)}); 54 e 250 são fixos. O alvo 70–180 é
              o de adultos em geral: gestação e outros grupos usam alvos diferentes (ajuste o alvo).
              Definidos para sensor (CGM) e aplicados aqui às glicemias capilares. Conversão: 1
              mmol/L = 18,016 mg/dL (massa molar da glicose, 180,16 g/mol, ÷ 10).
            </p>
          </div>

          <div className="card">
            <h3>Glicemias no período</h3>
            {shown.length ? (
              <GlucoseChart readings={shown} target={target} unit={props.unit} />
            ) : (
              <p>Sem medições no período.</p>
            )}
          </div>

          <div className="card">
            <h3>Por período do dia</h3>
            <table>
              <thead>
                <tr>
                  <th>Período</th>
                  <th className="num">Medições</th>
                  <th className="num">Média ({props.unit})</th>
                  <th className="num">Menor</th>
                  <th className="num">Maior</th>
                  <th className="num">% abaixo do alvo</th>
                  <th className="num">% acima do alvo</th>
                </tr>
              </thead>
              <tbody>
                {byPeriod.map((p) => (
                  <tr key={p.key}>
                    <td>{p.label}</td>
                    <td className="num">{p.stats.numeric + p.stats.hi + p.stats.lo}</td>
                    <td className="num">{g(p.stats.mean)}</td>
                    <td className="num">{minLabel(p.stats)}</td>
                    <td className="num">{maxLabel(p.stats)}</td>
                    <td className="num">{fmtPct(p.stats.pctBelow)}</td>
                    <td className="num">{fmtPct(p.stats.pctAbove)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="hint">
              Alvo {g(target.low)}–{g(target.high)} {props.unit}. Os percentuais são sobre as
              medições de cada período do dia (coluna Medições); com poucas medições, são só
              indicativos.
            </p>
          </div>

          <div className="card">
            <h3>
              Medições ({shown.length}
              {stats.control > 0 ? `, ${stats.control} de controle` : ''})
            </h3>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Hora</th>
                    <th className="num">Glicemia ({props.unit})</th>
                    <th>Observação</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((r) => (
                    <tr key={r.index}>
                      <td>{fmtDate(r.timeKey || null)}</td>
                      <td>{r.timeKey.slice(11, 16) || '—'}</td>
                      <td className="num">{readingLabel(r, props.unit)}</td>
                      <td>
                        {[
                          r.flag === 'HI' ? 'acima da faixa do aparelho' : '',
                          r.flag === 'LO' ? 'abaixo da faixa do aparelho' : '',
                          r.isControl ? 'solução de controle' : '',
                          !r.isControl && !r.flag && r.mgdl !== null && r.mgdl < target.low
                            ? 'abaixo do alvo'
                            : '',
                          !r.isControl && !r.flag && r.mgdl !== null && r.mgdl > target.high
                            ? 'acima do alvo'
                            : '',
                        ]
                          .filter(Boolean)
                          .join('; ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <details className="card no-print">
        <summary>Detalhes técnicos da leitura</summary>
        <p style={{ fontSize: 14 }}>
          Modelo informado: {d.modelNumber ?? '—'} · fabricante: {d.manufacturer ?? '—'} · firmware:{' '}
          {d.firmware ?? '—'} · unidade declarada: {result.declaredUnit ?? '—'} · segmentos:{' '}
          {result.segments
            .map(
              (s) =>
                `${s.instance} (${s.usageCount ?? '?'} registros, mapa ${s.hasEntryMap ? 'sim' : 'não'})`,
            )
            .join(', ')}
        </p>
        <p style={{ fontSize: 14 }}>
          Se a leitura parecer errada, o arquivo de diagnóstico ajuda a corrigir a página. Ele
          contém as medições: trate como dado de saúde.
        </p>
        <button type="button" className="secondary" onClick={exportTraffic}>
          Baixar diagnóstico (.txt)
        </button>
      </details>
    </>
  )
}

function Tile(props: { label: string; value: string; unit?: string; sub?: string }) {
  return (
    <div className="tile">
      <span className="label">{props.label}</span>
      <div className="value">
        {props.value}{' '}
        {props.unit && props.value !== '—' ? <span className="unit">{props.unit}</span> : null}
      </div>
      {props.sub ? <div className="sub">{props.sub}</div> : null}
    </div>
  )
}
