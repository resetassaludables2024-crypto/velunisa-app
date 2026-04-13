/**
 * Paymentez / Nuvei — integración servidor
 * Docs: https://paymentez.github.io/api-doc/
 *
 * Entorno:
 *   Staging:    https://ccapi-stg.paymentez.com/v2
 *   Producción: https://ccapi.paymentez.com/v2
 */

import crypto from 'crypto'

const IS_PROD   = process.env.NODE_ENV === 'production'
const BASE_URL  = IS_PROD
  ? 'https://ccapi.paymentez.com/v2'
  : 'https://ccapi-stg.paymentez.com/v2'

/** Genera el Auth-Token requerido por la API de Paymentez */
function buildAuthToken(): string {
  const appCode  = process.env.PAYMENTEZ_SERVER_APP_CODE ?? ''
  const appKey   = process.env.PAYMENTEZ_SERVER_APP_KEY  ?? ''
  const timestamp = Math.floor(Date.now() / 1000)
  const hash      = crypto
    .createHash('sha256')
    .update(appKey + timestamp)
    .digest('hex')
  return Buffer.from(`${appCode};${timestamp};${hash}`).toString('base64')
}

export interface PaymentezDebitParams {
  /** Token de tarjeta obtenido del SDK JS en el cliente */
  cardToken:    string
  /** Email del comprador */
  userEmail:    string
  /** ID único del usuario (puede ser email o UUID) */
  userId:       string
  /** Monto TOTAL a cobrar (incluye IVA) en USD */
  amount:       number
  /** Descripción del pedido */
  description:  string
  /** Referencia interna (número de pedido Velunisa) */
  devReference: string
}

export interface PaymentezResult {
  success:       boolean
  transactionId: string | null
  status:        string        // 'success' | 'pending' | 'failure'
  message:       string
  authCode:      string | null
  raw:           unknown
}

/**
 * Cobra una tarjeta tokenizada por Paymentez.js
 */
export async function chargeCard(params: PaymentezDebitParams): Promise<PaymentezResult> {
  const vatAmount  = parseFloat((params.amount * 0.12 / 1.12).toFixed(2))

  const payload = {
    user: {
      id:    params.userId,
      email: params.userEmail,
    },
    order: {
      amount:         params.amount,
      tax_percentage: 12,      // IVA Ecuador
      description:    params.description,
      dev_reference:  params.devReference,
      vat:            vatAmount,
    },
    card: {
      token: params.cardToken,
    },
  }

  try {
    const res = await fetch(`${BASE_URL}/transaction/debit/`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'Auth-Token':   buildAuthToken(),
      },
      body: JSON.stringify(payload),
    })

    const json = await res.json() as any

    // Paymentez response structure
    const txn    = json?.transaction
    const status = txn?.status ?? 'failure'

    if (!res.ok || status === 'failure') {
      return {
        success:       false,
        transactionId: txn?.id ?? null,
        status:        'failure',
        message:       txn?.message ?? json?.error?.description ?? 'Error al procesar el pago',
        authCode:      null,
        raw:           json,
      }
    }

    return {
      success:       status === 'success',
      transactionId: txn?.id ?? null,
      status,
      message:       txn?.message ?? (status === 'success' ? 'Pago aprobado' : 'Pago pendiente'),
      authCode:      txn?.authorization_code ?? null,
      raw:           json,
    }
  } catch (err) {
    console.error('[paymentez] chargeCard error:', err)
    return {
      success:       false,
      transactionId: null,
      status:        'failure',
      message:       'Error de conexión con Paymentez',
      authCode:      null,
      raw:           { error: String(err) },
    }
  }
}

/**
 * Verifica el estado de una transacción
 */
export async function getTransaction(transactionId: string): Promise<unknown> {
  const res = await fetch(`${BASE_URL}/transaction/${transactionId}/`, {
    headers: { 'Auth-Token': buildAuthToken() },
  })
  return res.json()
}
