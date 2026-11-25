// Subconjunto da WebUSB API usado aqui (Chrome/Edge). Declarado à mão para não depender de
// pacote de tipos externo.

interface USBDeviceFilter {
  vendorId?: number
  productId?: number
  classCode?: number
  subclassCode?: number
  protocolCode?: number
  serialNumber?: string
}

interface USBEndpoint {
  readonly endpointNumber: number
  readonly direction: 'in' | 'out'
  readonly type: 'bulk' | 'interrupt' | 'isochronous'
  readonly packetSize: number
}

interface USBAlternateInterface {
  readonly alternateSetting: number
  readonly interfaceClass: number
  readonly interfaceSubclass: number
  readonly interfaceProtocol: number
  readonly endpoints: readonly USBEndpoint[]
}

interface USBInterface {
  readonly interfaceNumber: number
  readonly alternate: USBAlternateInterface
  readonly alternates: readonly USBAlternateInterface[]
  readonly claimed: boolean
}

interface USBConfiguration {
  readonly configurationValue: number
  readonly interfaces: readonly USBInterface[]
}

interface USBInTransferResult {
  readonly data?: DataView
  readonly status: 'ok' | 'stall' | 'babble'
}

interface USBOutTransferResult {
  readonly bytesWritten: number
  readonly status: 'ok' | 'stall'
}

interface USBControlTransferParameters {
  requestType: 'standard' | 'class' | 'vendor'
  recipient: 'device' | 'interface' | 'endpoint' | 'other'
  request: number
  value: number
  index: number
}

interface USBDevice {
  readonly vendorId: number
  readonly productId: number
  readonly productName?: string
  readonly manufacturerName?: string
  readonly serialNumber?: string
  readonly opened: boolean
  readonly configuration: USBConfiguration | null
  readonly configurations: readonly USBConfiguration[]
  open(): Promise<void>
  close(): Promise<void>
  forget?(): Promise<void>
  selectConfiguration(value: number): Promise<void>
  claimInterface(n: number): Promise<void>
  releaseInterface(n: number): Promise<void>
  controlTransferIn(
    setup: USBControlTransferParameters,
    length: number,
  ): Promise<USBInTransferResult>
  transferIn(endpoint: number, length: number): Promise<USBInTransferResult>
  transferOut(endpoint: number, data: BufferSource): Promise<USBOutTransferResult>
  clearHalt(direction: 'in' | 'out', endpoint: number): Promise<void>
}

interface USB extends EventTarget {
  requestDevice(options: { filters: USBDeviceFilter[] }): Promise<USBDevice>
  getDevices(): Promise<USBDevice[]>
}

interface Navigator {
  readonly usb?: USB
}
