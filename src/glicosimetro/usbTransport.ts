// Transporte WebUSB para glicosímetros Accu-Chek com USB (classe PHDC, endpoints bulk).
// Só existe enquanto a aba está aberta: nenhuma permissão é guardada pela página, e ao fim
// da leitura o aparelho é fechado (e "esquecido", quando o navegador permite).

import { ROCHE_VENDOR_ID, USB_CLASS_PHDC } from './phdc/nomenclature'
import { type Transport, TimeoutError } from './phdc/manager'

export type UsbSupport = 'ok' | 'no-webusb' | 'insecure-context'

export function usbSupport(): UsbSupport {
  if (!window.isSecureContext) return 'insecure-context'
  if (!navigator.usb) return 'no-webusb'
  return 'ok'
}

export class UsbError extends Error {
  override name = 'UsbError'
  constructor(
    readonly code: 'cancelled' | 'not-phdc' | 'busy' | 'open-failed' | 'babble' | 'io',
    message: string,
  ) {
    super(message)
  }
}

export interface OpenedMeter {
  transport: Transport
  label: string
  close(): Promise<void>
}

/** Abre o seletor do navegador (exige gesto do usuário) e prepara o aparelho escolhido. */
export async function requestMeter(): Promise<OpenedMeter> {
  const usb = navigator.usb
  if (!usb) throw new UsbError('open-failed', 'Este navegador não tem WebUSB. Use Chrome ou Edge.')
  let device: USBDevice
  try {
    device = await usb.requestDevice({ filters: [{ vendorId: ROCHE_VENDOR_ID }] })
  } catch (e) {
    if (e instanceof DOMException && e.name === 'NotFoundError') {
      throw new UsbError('cancelled', 'Nenhum aparelho escolhido.')
    }
    throw new UsbError('open-failed', 'O navegador não liberou o acesso ao USB.')
  }
  return openDevice(device)
}

async function openDevice(device: USBDevice): Promise<OpenedMeter> {
  try {
    await device.open()
    if (device.configuration === null) await device.selectConfiguration(1)
  } catch {
    throw new UsbError(
      'busy',
      'Não foi possível abrir o glicosímetro. Feche outros programas que usam o aparelho (Accu-Chek 360°, Smart Pix, Tidepool, mySugr no PC). No Windows, pode ser preciso instalar o driver WinUSB (ver ajuda).',
    )
  }
  const iface = device.configuration?.interfaces.find((i) =>
    i.alternates.some((a) => a.interfaceClass === USB_CLASS_PHDC),
  )
  if (!iface) {
    await device.close().catch(() => {})
    throw new UsbError(
      'not-phdc',
      'Este aparelho Roche não usa o protocolo de saúde USB (PHDC). Modelos suportados: Accu-Chek Guide, Guide Me, Instant, Instant S, Performa Connect e Aviva Connect.',
    )
  }
  try {
    await device.claimInterface(iface.interfaceNumber)
  } catch {
    await device.close().catch(() => {})
    throw new UsbError(
      'busy',
      'O sistema não liberou o glicosímetro para o navegador. Feche outros programas do aparelho; no Windows, veja a ajuda sobre o driver WinUSB.',
    )
  }
  const alt = iface.alternates.find((a) => a.interfaceClass === USB_CLASS_PHDC) ?? iface.alternate
  const epIn = alt.endpoints.find((e) => e.direction === 'in' && e.type === 'bulk')
  const epOut = alt.endpoints.find((e) => e.direction === 'out' && e.type === 'bulk')
  if (!epIn || !epOut) {
    await device.close().catch(() => {})
    throw new UsbError('not-phdc', 'O glicosímetro não expôs os canais de dados esperados.')
  }

  // Mesmo passo dos drivers de referência: um GET_STATUS acorda a pilha USB do aparelho.
  await device
    .controlTransferIn(
      { requestType: 'standard', recipient: 'device', request: 0, value: 0, index: 0 },
      2,
    )
    .catch(() => undefined)

  let closed = false
  const transport: Transport = {
    async send(bytes) {
      const r = await device.transferOut(epOut.endpointNumber, bytes.slice().buffer as ArrayBuffer)
      if (r.status !== 'ok') throw new UsbError('io', 'Falha ao enviar dados ao glicosímetro.')
    },
    receive(timeoutMs) {
      return new Promise<Uint8Array>((resolve, reject) => {
        const timer = setTimeout(() => reject(new TimeoutError('timeout')), timeoutMs)
        device
          .transferIn(epIn.endpointNumber, 1024)
          .then((r) => {
            clearTimeout(timer)
            if (r.status === 'babble') {
              reject(
                new UsbError(
                  'babble',
                  'O aparelho ficou conectado tempo demais. Desconecte, reconecte e tente de novo.',
                ),
              )
            } else if (r.status !== 'ok' || !r.data) {
              reject(new UsbError('io', 'Falha ao ler dados do glicosímetro.'))
            } else {
              resolve(new Uint8Array(r.data.buffer, r.data.byteOffset, r.data.byteLength).slice())
            }
          })
          .catch((e: unknown) => {
            clearTimeout(timer)
            reject(closed ? new UsbError('io', 'Conexão encerrada.') : e)
          })
      })
    },
  }

  const label =
    [device.manufacturerName, device.productName].filter(Boolean).join(' ') || 'Glicosímetro Roche'
  return {
    transport,
    label,
    async close() {
      closed = true
      await device.releaseInterface(iface.interfaceNumber).catch(() => {})
      await device.close().catch(() => {})
      // Revoga a permissão concedida nesta sessão (Chrome 101+).
      await device.forget?.().catch(() => {})
    },
  }
}
