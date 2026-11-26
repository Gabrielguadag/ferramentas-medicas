import { type KeyboardEvent, useCallback, useEffect, useState } from 'react'
import { CriancaPage } from './crianca/CriancaPage'
import { GestantePage } from './gestante/GestantePage'
import { ConsultaPage } from './glargina/ConsultaPage'
import { GlicosimetroPage } from './glicosimetro/GlicosimetroPage'

type Area = 'diabetes' | 'gestante' | 'crianca'
type Tool = 'consulta' | 'glicosimetro'

const AREAS: { id: Area; label: string }[] = [
  { id: 'diabetes', label: 'Diabetes' },
  { id: 'gestante', label: 'Gestante' },
  { id: 'crianca', label: 'Criança' },
]

const TOOLS: { id: Tool; label: string }[] = [
  { id: 'consulta', label: 'Consulta de diabetes' },
  { id: 'glicosimetro', label: 'Glicosímetro (USB)' },
]

/** Navegação por setas entre abas (WAI-ARIA): Esquerda/Direita, Início e Fim; foco e seleção juntos. */
function tabKeys<T extends string>(
  e: KeyboardEvent,
  ids: readonly T[],
  current: T,
  select: (id: T) => void,
  prefix: string,
) {
  const i = ids.indexOf(current)
  let next = -1
  if (e.key === 'ArrowRight') next = (i + 1) % ids.length
  else if (e.key === 'ArrowLeft') next = (i - 1 + ids.length) % ids.length
  else if (e.key === 'Home') next = 0
  else if (e.key === 'End') next = ids.length - 1
  if (next < 0) return
  e.preventDefault()
  const id = ids[next] as T
  select(id)
  document.getElementById(`${prefix}${id}`)?.focus()
}

export function App() {
  const [area, setArea] = useState<Area>('diabetes')
  const [tool, setTool] = useState<Tool>('consulta')
  const [meterHasData, setMeterHasData] = useState(false)
  const onMeterData = useCallback((v: boolean) => setMeterHasData(v), [])

  // Avisa antes de fechar ou recarregar quando há medições na tela (elas não ficam guardadas).
  useEffect(() => {
    if (!meterHasData) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [meterHasData])

  return (
    <>
      <a className="skip" href="#conteudo">
        Ir para o conteúdo
      </a>
      <header className="app">
        <div className="inner">
          <h1>Ferramentas para a consulta</h1>
          <p className="privacy">
            Sem cadastro: a página não envia nem guarda nada. Tudo o que você digita ou lê do
            glicosímetro fica só nesta aba e some ao fechar ou recarregar. Só ficam no computador os
            arquivos que você exportar (CSV, PDF, diagnóstico), que contêm dado de saúde.
          </p>
          <nav
            className="areas"
            role="tablist"
            aria-label="Áreas"
            onKeyDown={(e) =>
              tabKeys(
                e,
                AREAS.map((a) => a.id),
                area,
                setArea,
                'area-',
              )
            }
          >
            {AREAS.map((a) => (
              <button
                key={a.id}
                type="button"
                role="tab"
                id={`area-${a.id}`}
                aria-selected={area === a.id}
                tabIndex={area === a.id ? 0 : -1}
                aria-controls={`area-panel-${a.id}`}
                onClick={() => setArea(a.id)}
              >
                {a.label}
              </button>
            ))}
          </nav>
          {area === 'diabetes' ? (
            <nav
              className="tabs"
              role="tablist"
              aria-label="Ferramentas de diabetes"
              onKeyDown={(e) =>
                tabKeys(
                  e,
                  TOOLS.map((t) => t.id),
                  tool,
                  setTool,
                  'tab-',
                )
              }
            >
              {TOOLS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  id={`tab-${t.id}`}
                  aria-selected={tool === t.id}
                  tabIndex={tool === t.id ? 0 : -1}
                  aria-controls={`panel-${t.id}`}
                  onClick={() => setTool(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          ) : null}
        </div>
      </header>
      <main id="conteudo">
        <div className="inner">
          {/* As áreas e os painéis ficam montados para não perder o que foi digitado ao trocar. */}
          <div
            id="area-panel-diabetes"
            role="tabpanel"
            aria-labelledby="area-diabetes"
            hidden={area !== 'diabetes'}
          >
            <section
              id="panel-consulta"
              role="tabpanel"
              aria-label="Consulta de diabetes"
              hidden={tool !== 'consulta'}
            >
              <ConsultaPage />
            </section>
            <section
              id="panel-glicosimetro"
              role="tabpanel"
              aria-label="Glicosímetro (USB)"
              hidden={tool !== 'glicosimetro'}
            >
              <GlicosimetroPage onDataChange={onMeterData} />
            </section>
          </div>
          <div
            id="area-panel-gestante"
            role="tabpanel"
            aria-labelledby="area-gestante"
            hidden={area !== 'gestante'}
          >
            <GestantePage />
          </div>
          <div
            id="area-panel-crianca"
            role="tabpanel"
            aria-labelledby="area-crianca"
            hidden={area !== 'crianca'}
          >
            <CriancaPage />
          </div>
          <p className="disclaimer">
            Apoio à decisão para profissionais de saúde. Não substitui a avaliação clínica nem a
            prescrição. Os cálculos seguem as fontes citadas em cada seção; confira sempre com o
            protocolo vigente do seu serviço.
          </p>
        </div>
      </main>
    </>
  )
}
