import { useEffect, useMemo, useState } from 'react'
import { downloadText, nowStamp } from '../shared/download'
import { NumberField, SelectField } from '../shared/NumberField'
import {
  DEFAULT_TARGET,
  type PeriodDays,
  type Reading,
  type Unit,
  computeStats,
  filterPeriod,
  formatGlucose,
  readingLabel,
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
  | { kind: 'loaded'; result: DownloadResult; readings: Reading[]; demo: boolean; at: string }
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

const fmtPct = (v: number | null) => (v === null ? '—' : `${v.toFixed(0)}%`)
const fmtDate = (key: string | null) =>
  key ? key.slice(0, 10).split('-').reverse().join('/') : '—'

export function GlicosimetroPage(props: { onDataChange?: (hasData: boolean) => void }) {
  const [state, setState] = useState<State>({ kind: 'idle' })
  const [period, setPeriod] = useState('14')
  const [unit, setUnit] = useState<Unit>('mg/dL')
  const [low, setLow] = useState<number | null>(DEFAULT_TARGET.low)
  const [high, setHigh] = useState<number | null>(DEFAULT_TARGET.high)
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
      setState({
        kind: 'loaded',
        result,
        readings: toReadings(result.readings),
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
          low={low}
          setLow={setLow}
          high={high}
          setHigh={setHigh}
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
          Lê a memória de glicosímetros Accu-Chek com porta micro-USB (Guide, Guide Me, Instant,
          Instant S, Performa Connect e Aviva Connect). As medições aparecem só nesta tela: nada é
          enviado ou gravado.
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
  low: number | null
  setLow: (v: number | null) => void
  high: number | null
  setHigh: (v: number | null) => void
  patientLabel: string
  setPatientLabel: (v: string) => void
  onClear: () => void
}) {
  const { result, readings, demo, at } = props.state
  const toMgdl = (v: number | null) =>
    v === null ? null : props.unit === 'mmol/L' ? v * 18.016 : v
  const lowMg = toMgdl(props.low) ?? DEFAULT_TARGET.low
  const highMg = toMgdl(props.high) ?? DEFAULT_TARGET.high
  const target = useMemo(
    () => (lowMg < highMg ? { low: lowMg, high: highMg } : DEFAULT_TARGET),
    [lowMg, highMg],
  )
  const days: PeriodDays = props.period === 'all' ? 'all' : (Number(props.period) as PeriodDays)
  const shown = useMemo(() => filterPeriod(readings, days), [readings, days])
  const stats = useMemo(() => computeStats(shown, target), [shown, target])
  const byPeriod = useMemo(() => statsByDayPeriod(shown, target), [shown, target])
  const d = result.device
  const deviceLabel =
    d.modelName ?? (d.modelNumber ? `Roche modelo ${d.modelNumber}` : 'Glicosímetro Roche')
  const g = (v: number | null) => (v === null ? '—' : formatGlucose(v, props.unit))

  function changeUnit(u: Unit) {
    if (u === props.unit) return
    const conv = (v: number | null) =>
      v === null
        ? null
        : u === 'mmol/L'
          ? Math.round((v / 18.016) * 10) / 10
          : Math.round(v * 18.016)
    props.setLow(conv(props.low))
    props.setHigh(conv(props.high))
    props.setUnit(u)
  }

  function exportCsv() {
    const stamp = nowStamp()
    downloadText(
      `glicemias-${stamp.file}.csv`,
      toCsv(shown, props.unit, {
        deviceLabel,
        serialNumber: d.serialNumber,
        exportedAt: stamp.human,
      }),
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
            <p className="note" style={{ fontSize: 13 }}>
              Data e hora são as do relógio do glicosímetro. Se o relógio estiver errado, as datas
              também estarão.
            </p>
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
              <span className="hint">Fica só nesta tela e no PDF que você gerar.</span>
            </div>
            <div className="actions" style={{ marginTop: 12 }}>
              <button type="button" className="primary" onClick={exportCsv}>
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
            value={props.low}
            onChange={props.setLow}
          />
          <NumberField
            label="Alvo máximo"
            unit={props.unit}
            value={props.high}
            onChange={props.setHigh}
          />
        </div>
        {lowMg >= highMg ? (
          <p className="note warn">O alvo mínimo precisa ser menor que o máximo; usando 70–180.</p>
        ) : null}
      </div>

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
            label="Medições por dia"
            value={stats.perDay === null ? '—' : stats.perDay.toFixed(1).replace('.', ',')}
            sub={`${stats.days} dias com medição`}
          />
          <Tile
            label="Abaixo de 54 mg/dL"
            value={fmtPct(stats.pctBelow54)}
            sub={`LO: ${stats.lo}`}
          />
          <Tile
            label="Acima de 250 mg/dL"
            value={fmtPct(stats.pctAbove250)}
            sub={`HI: ${stats.hi}`}
          />
          <Tile
            label="Menor / maior"
            value={`${g(stats.min)} / ${g(stats.max)}`}
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
                <ZoneKey zone="low" /> Abaixo de {g(target.low)}: {fmtPct(stats.pctBelow)}
              </span>
              <span className="badge" style={{ fontWeight: 400 }}>
                <ZoneKey zone="in" /> No alvo: {fmtPct(stats.pctInRange)}
              </span>
              <span className="badge" style={{ fontWeight: 400 }}>
                <ZoneKey zone="high" /> Acima de {g(target.high)}: {fmtPct(stats.pctAbove)}
              </span>
            </div>
          </>
        ) : null}
        {stats.control > 0 ? (
          <p className="source">
            {stats.control} testes com solução de controle ficaram fora do resumo.
          </p>
        ) : null}
        <p className="source">
          Percentuais sobre medições capilares pontuais (inclui HI e LO), não sobre tempo contínuo
          como no sensor (CGM). A média e o desvio padrão não incluem HI/LO.
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
              <th className="num">Abaixo</th>
              <th className="num">Acima</th>
            </tr>
          </thead>
          <tbody>
            {byPeriod.map((p) => (
              <tr key={p.key}>
                <td>{p.label}</td>
                <td className="num">{p.stats.numeric + p.stats.hi + p.stats.lo}</td>
                <td className="num">{g(p.stats.mean)}</td>
                <td className="num">{g(p.stats.min)}</td>
                <td className="num">{g(p.stats.max)}</td>
                <td className="num">{fmtPct(p.stats.pctBelow)}</td>
                <td className="num">{fmtPct(p.stats.pctAbove)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h3>Medições ({shown.length})</h3>
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
                      !r.flag && r.mgdl !== null && r.mgdl < target.low ? 'abaixo do alvo' : '',
                      !r.flag && r.mgdl !== null && r.mgdl > target.high ? 'acima do alvo' : '',
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
