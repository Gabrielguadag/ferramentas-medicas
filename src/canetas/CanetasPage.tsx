import { useState } from 'react'
import { DateField } from '../shared/DateField'
import { NumberField, SelectField } from '../shared/NumberField'
import { fmtData, hojeIso, parseIso } from '../shared/datas'
import { Alert, Card, Details, Result, Results, Src } from '../shared/ui'
import {
  type Apresentacao,
  ESQUEMA,
  LINHA_ROTULO,
  PRODUTOS,
  type Produto,
  contarCliques,
  doseMaxima,
  dosesTabela,
  fmtMg,
  mgPorClique,
  rendimento,
} from './canetas'
import { BULA, FDA_DMEPA_2017 } from './sources'

const MODULOS = [
  { id: 'cliques', label: 'Cliques por dose', hint: 'Dose fora da marca da caneta' },
  { id: 'esquema', label: 'Início e aumento', hint: 'Esquema da bula com datas' },
] as const

type ModuloId = (typeof MODULOS)[number]['id']

const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`

export function CanetasPage() {
  const [current, setCurrent] = useState<ModuloId>('cliques')
  const [prodId, setProdId] = useState<string>(PRODUTOS[0]!.id)
  const prod = PRODUTOS.find((p) => p.id === prodId) ?? PRODUTOS[0]!
  const [apId, setApId] = useState<string>(prod.apresentacoes[0]!.id)
  const ap = prod.apresentacoes.find((a) => a.id === apId) ?? prod.apresentacoes[0]!

  function trocarProduto(id: string) {
    setProdId(id)
    const novo = PRODUTOS.find((p) => p.id === id)
    // Mantém a apresentação se ela existe no novo produto (ex.: 1 mg); senão, a primeira.
    if (novo && !novo.apresentacoes.some((a) => a.id === apId)) {
      setApId(novo.apresentacoes[0]!.id)
    }
  }

  return (
    <div className="layout">
      <nav className="side" aria-label="Módulos das canetas">
        {MODULOS.map((m) => (
          <button
            key={m.id}
            type="button"
            aria-current={current === m.id ? 'page' : undefined}
            onClick={() => setCurrent(m.id)}
          >
            <span className="side-label">{m.label}</span>
            <span className="side-hint">{m.hint}</span>
          </button>
        ))}
      </nav>
      <div>
        <Card title="Caneta de semaglutida" subtitle="Vale para os dois módulos.">
          <div className="fields">
            <SelectField
              label="Marca"
              value={prod.id}
              options={PRODUTOS.map((p) => ({ value: p.id, label: `${p.nome} (${p.fabricante})` }))}
              onChange={trocarProduto}
            />
            <SelectField
              label="Apresentação"
              value={ap.id}
              options={prod.apresentacoes.map((a) => ({ value: a.id, label: a.rotulo }))}
              onChange={setApId}
            />
          </div>
          <ResumoCaneta prod={prod} ap={ap} />
        </Card>

        <section hidden={current !== 'cliques'} aria-label="Cliques por dose">
          <h2 className="section-title">Cliques por dose</h2>
          <CliquesView prod={prod} ap={ap} />
        </section>
        <section hidden={current !== 'esquema'} aria-label="Início e aumento">
          <h2 className="section-title">Início e aumento</h2>
          <EsquemaView prod={prod} ap={ap} />
        </section>
      </div>
    </div>
  )
}

function ResumoCaneta({ prod, ap }: { prod: Produto; ap: Apresentacao }) {
  const marcas = ap.marcas.map((m) => `${fmtMg(m.mg)} mg = ${m.cliques} cliques`).join('; ')
  return (
    <ul className="checklist">
      <li>
        <strong>Indicação:</strong> {LINHA_ROTULO[prod.linha]}.
      </li>
      <li>
        {fmtMg(ap.mgPorMl)} mg/mL, {fmtMg(ap.volumeMl)} mL ({fmtMg(ap.mgTotal)} mg). Marcas do
        contador: {marcas}. Cada clique ≈ {fmtMg(mgPorClique(ap), 4)} mg.
      </li>
      <li>
        Depois da primeira aplicação, vale {prod.validadeDias / 7} semanas ({prod.validadeDias}{' '}
        dias), mesmo com sobra.
      </li>
    </ul>
  )
}

function CliquesView({ prod, ap }: { prod: Produto; ap: Apresentacao }) {
  const [dose, setDose] = useState<number | null>(null)
  const c = dose === null ? null : contarCliques(ap, dose)
  const max = doseMaxima(ap)

  return (
    <>
      <Card title="Dose desejada" subtitle={`Esta caneta vai até ${fmtMg(max)} mg por aplicação.`}>
        <div className="fields">
          <NumberField
            label="Dose semanal"
            unit="mg"
            value={dose}
            onChange={setDose}
            min={0}
            max={max}
            step={0.05}
          />
        </div>
        {c === null ? (
          <p className="empty">Informe a dose para ver os cliques.</p>
        ) : c.tipo === 'invalida' ? (
          <Alert tone="warn">{c.motivo}</Alert>
        ) : (
          <ResultadoCliques prod={prod} ap={ap} dose={dose as number} c={c} />
        )}
      </Card>

      <Card
        title="Tabela de cliques desta caneta"
        subtitle="Cliques contados do 0, girando só para frente."
      >
        <table className="compact">
          <caption className="sr-only">Cliques por dose</caption>
          <thead>
            <tr>
              <th scope="col">Dose</th>
              <th scope="col" className="num">
                Cliques
              </th>
              <th scope="col" className="num">
                Aplicações por caneta
              </th>
            </tr>
          </thead>
          <tbody>
            {dosesTabela(ap).map((d) => {
              const r = contarCliques(ap, d)
              if (r.tipo !== 'ok') return null
              const maior = r.opcoes[r.opcoes.length - 1]!.cliques
              const rend = rendimento(prod, ap, maior)
              return (
                <tr key={d}>
                  <th scope="row">
                    {fmtMg(d)} mg{r.marcada ? ' (marca)' : ''}
                  </th>
                  <td className="num">{r.opcoes.map((o) => o.cliques).join(' ou ')}</td>
                  <td className="num">{rend.aplicacoes}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <Details>
          <ul>
            <li>
              Conta proporcional à marca de {fmtMg(max)} mg (
              {ap.marcas[ap.marcas.length - 1]!.cliques} cliques): cliques = dose ÷ {fmtMg(max)} ×{' '}
              {ap.marcas[ap.marcas.length - 1]!.cliques}. Quando a conta cai perto do meio entre
              dois cliques, a tabela mostra os dois.
            </li>
            <li>
              Aplicações por caneta: o menor entre o conteúdo nominal ({fmtMg(ap.mgTotal)} mg) e as
              semanas de validade depois de aberta. Com dois cliques possíveis, conta o maior.
            </li>
            <li>
              Uso fora de bula: as bulas orientam selecionar só as doses marcadas no contador.
            </li>
          </ul>
          <Src href={FDA_DMEPA_2017.url}>{FDA_DMEPA_2017.titulo}</Src>
          <Src href={BULA[prod.bula].url}>{BULA[prod.bula].titulo}</Src>
        </Details>
      </Card>
    </>
  )
}

function ResultadoCliques(props: {
  prod: Produto
  ap: Apresentacao
  dose: number
  c: Extract<ReturnType<typeof contarCliques>, { tipo: 'ok' }>
}) {
  const { prod, ap, dose, c } = props
  const maior = c.opcoes[c.opcoes.length - 1]!.cliques
  const rend = rendimento(prod, ap, maior)
  return (
    <>
      <Results>
        <Result
          label={`${fmtMg(dose)} mg nesta caneta`}
          value={c.opcoes.map((o) => o.cliques).join(' ou ')}
          unit="cliques"
          tone="info"
        >
          {c.marcada
            ? 'É uma marca do contador: gire até o contador mostrar a dose.'
            : c.opcoes.length === 2
              ? `A conta dá ${fmtMg(c.exato, 1)}: ${c.opcoes
                  .map((o) => `${o.cliques} cliques = ${fmtMg(o.mg, 3)} mg`)
                  .join('; ')}.`
              : `${c.opcoes[0]!.cliques} cliques = ${fmtMg(c.opcoes[0]!.mg, 3)} mg.`}
        </Result>
        <Result label="Aplicações por caneta" value={rend.aplicacoes} tone="neutral">
          {rend.limite === 'validade'
            ? `Limitada pela validade de ${prod.validadeDias / 7} semanas depois de aberta (o conteúdo daria ${rend.peloConteudo}).`
            : `Limitada pelo conteúdo da caneta.`}
        </Result>
      </Results>
      {c.marcada ? null : (
        <ul className="checklist">
          <li>Na caneta nova, faça antes o teste de fluxo da bula; ele não entra na contagem.</li>
          <li>
            Gire o seletor só para frente, contando os cliques a partir do 0. Se passar, volte ao 0
            e conte de novo.
          </li>
          <li>
            Quando sobra menos que a dose na caneta, o seletor para antes: confira se chegou ao
            número de cliques.
          </li>
        </ul>
      )}
    </>
  )
}

function EsquemaView({ prod, ap }: { prod: Produto; ap: Apresentacao }) {
  const [inicio, setInicio] = useState(hojeIso())
  const dia = parseIso(inicio)
  const etapas = ESQUEMA[prod.linha]
  const max = doseMaxima(ap)

  return (
    <Card
      title={
        prod.linha === 'dm2'
          ? 'Esquema da bula: diabetes tipo 2'
          : 'Esquema da bula: controle de peso'
      }
      subtitle={`Cliques na caneta escolhida: ${prod.nome} ${ap.rotulo}.`}
    >
      <div className="fields">
        <DateField label="Primeira aplicação" value={inicio} onChange={setInicio} />
      </div>
      {dia === null ? (
        <p className="empty">Informe a data da primeira aplicação.</p>
      ) : (
        <table className="compact">
          <caption className="sr-only">Esquema de doses</caption>
          <thead>
            <tr>
              <th scope="col">Semanas</th>
              <th scope="col">A partir de</th>
              <th scope="col">Dose semanal</th>
              <th scope="col">Nesta caneta</th>
            </tr>
          </thead>
          <tbody>
            {etapas.map((e) => {
              const c = contarCliques(ap, e.doseMg)
              const nestaCaneta =
                e.doseMg > max + 1e-9
                  ? `acima do máximo da caneta (${fmtMg(max)} mg)`
                  : c.tipo !== 'ok'
                    ? '—'
                    : c.marcada
                      ? 'marca do contador'
                      : `${c.opcoes.map((o) => o.cliques).join(' ou ')} cliques (${plural(
                          rendimento(prod, ap, c.opcoes[c.opcoes.length - 1]!.cliques).aplicacoes,
                          'aplicação',
                          'aplicações',
                        )} por caneta)`
              return (
                <tr key={e.semanaInicio}>
                  <th scope="row">
                    {e.semanaFim === null
                      ? `${e.semanaInicio} em diante`
                      : `${e.semanaInicio} a ${e.semanaFim}`}
                  </th>
                  <td>{fmtData(dia + (e.semanaInicio - 1) * 7)}</td>
                  <td>
                    {fmtMg(e.doseMg)} mg
                    {e.nota ? <span className="hint"> {e.nota}</span> : null}
                  </td>
                  <td>{nestaCaneta}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
      <ul className="checklist">
        <li>
          Dose esquecida: aplicar assim que possível, se até 5 dias depois; passados 5 dias, pular e
          seguir no dia de sempre.
          {prod.linha === 'peso'
            ? ' Se mais doses forem esquecidas, considerar reduzir a dose e reiniciar o escalonamento.'
            : ''}
        </li>
        {prod.linha === 'peso' ? (
          <li>
            Sintomas gastrointestinais significativos: considerar adiar o aumento da dose até
            melhorarem e então tentar reescalar.
          </li>
        ) : null}
      </ul>
      <Src href={BULA[prod.bula].url}>{BULA[prod.bula].titulo}</Src>
    </Card>
  )
}
