import { useEffect, useRef, useState } from 'react'
import { Facebook, Loader2, ShieldCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { integrationsAPI } from '../../services/api'
import { useIntegrationsStore } from '../../store/integrationsStore'

let fbSdkPromise = null

function loadFacebookSdk(appId, graphApiVersion) {
  if (window.FB) return Promise.resolve(window.FB)
  if (fbSdkPromise) return fbSdkPromise

  fbSdkPromise = new Promise((resolve, reject) => {
    window.fbAsyncInit = function fbAsyncInit() {
      window.FB.init({ appId, cookie: true, xfbml: false, version: graphApiVersion || 'v19.0' })
      resolve(window.FB)
    }
    const script = document.createElement('script')
    script.src = 'https://connect.facebook.net/en_US/sdk.js'
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'
    script.onerror = () => reject(new Error('Failed to load the Facebook SDK.'))
    document.body.appendChild(script)
  })
  return fbSdkPromise
}

export default function MetaWhatsAppConnect({ onConnected }) {
  const applyIntegrationResult = useIntegrationsStore((s) => s.applyIntegrationResult)
  const [metaConfig, setMetaConfig] = useState(null)
  const [loadingConfig, setLoadingConfig] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const codeRef = useRef(null)
  const sessionInfoRef = useRef(null)
  const finalizingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    integrationsAPI.getMetaWhatsAppConfig()
      .then((cfg) => { if (!cancelled) setMetaConfig(cfg) })
      .catch(() => { if (!cancelled) setMetaConfig(null) })
      .finally(() => { if (!cancelled) setLoadingConfig(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const handleMessage = (event) => {
      if (!/facebook\.com$/.test(event.origin || '')) return
      let data
      try {
        data = JSON.parse(event.data)
      } catch {
        return
      }
      if (data?.type !== 'WA_EMBEDDED_SIGNUP') return

      if (data.event === 'FINISH' || data.event === 'FINISH_ONLY_WABA' || data.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') {
        sessionInfoRef.current = {
          wabaId: data.data?.waba_id || data.data?.business_id,
          phoneNumberId: data.data?.phone_number_id,
        }
        finalizeSignup()
      } else if (data.event === 'CANCEL') {
        setConnecting(false)
        toast.error('WhatsApp signup was cancelled before it finished.')
      } else if (data.event === 'ERROR') {
        setConnecting(false)
        toast.error(data.data?.error_message || 'WhatsApp signup failed on the Facebook side.')
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const finalizeSignup = async () => {
    if (finalizingRef.current) return
    const code = codeRef.current
    const session = sessionInfoRef.current
    if (!code || !session?.wabaId || !session?.phoneNumberId) {
      return
    }
    finalizingRef.current = true
    try {
      const row = await integrationsAPI.exchangeMetaWhatsApp({
        code,
        wabaId: session.wabaId,
        phoneNumberId: session.phoneNumberId,
      })
      applyIntegrationResult('whatsapp', row)
      toast.success('WhatsApp connected via Facebook.')
      onConnected?.(row)
    } catch (err) {
      toast.error(err?.message || 'Could not finish connecting WhatsApp. Please try again.')
    } finally {
      finalizingRef.current = false
      codeRef.current = null
      sessionInfoRef.current = null
      setConnecting(false)
    }
  }

  const handleConnect = async () => {
    if (!metaConfig?.appId || !metaConfig?.configId) {
      toast.error('WhatsApp Embedded Signup is not configured on the backend yet.')
      return
    }
    setConnecting(true)
    codeRef.current = null
    sessionInfoRef.current = null

    try {
      const FB = await loadFacebookSdk(metaConfig.appId, metaConfig.graphApiVersion)
      FB.login(
        (response) => {
          if (response?.authResponse?.code) {
            codeRef.current = response.authResponse.code
            finalizeSignup()
          } else {
            setConnecting(false)
            toast.error('WhatsApp signup was cancelled or did not complete.')
          }
        },
        {
          config_id: metaConfig.configId,
          response_type: 'code',
          override_default_response_type: true,
          extras: { setup: {}, sessionInfoVersion: '3' },
        }
      )
    } catch (err) {
      setConnecting(false)
      toast.error(err?.message || 'Failed to load the Facebook SDK.')
    }
  }

  const configured = !loadingConfig && metaConfig?.appId && metaConfig?.configId

  return (
    <div className="mx-5 mt-4 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-900/20">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#1877F2]/10 flex items-center justify-center flex-shrink-0">
          <Facebook className="w-4 h-4 text-[#1877F2]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Recommended: Connect with Facebook</p>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-0.5">
            Uses Meta's official WhatsApp Embedded Signup — no API keys to copy, and your number stays on Meta's Cloud API.
          </p>
          <button
            type="button"
            onClick={handleConnect}
            disabled={connecting || loadingConfig || !configured}
            className="mt-2 inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl bg-[#1877F2] text-white hover:bg-[#1465d1] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {connecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Facebook className="w-3.5 h-3.5" />}
            {connecting ? 'Connecting…' : 'Connect WhatsApp with Facebook'}
          </button>
          {!loadingConfig && !configured && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Backend is missing META_APP_ID / META_WHATSAPP_CONFIG_ID — use manual setup below for now.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
