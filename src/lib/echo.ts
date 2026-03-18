import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Pusher: typeof Pusher
  }
}

window.Pusher = Pusher

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let echo: Echo<any> | null = null

if (import.meta.env.VITE_REVERB_APP_KEY) {
  const forceTLS = (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https'
  const reverbPort = Number(import.meta.env.VITE_REVERB_PORT) || (forceTLS ? 443 : 8081)

  echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST ?? 'localhost',
    wsPort: reverbPort,
    wssPort: reverbPort,
    forceTLS,
    enabledTransports: forceTLS ? ['wss'] : ['ws'],
    disableStats: true,
  })
}

export default echo
