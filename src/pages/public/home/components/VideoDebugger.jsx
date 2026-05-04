import { useEffect, useRef, useState } from 'react'

export function VideoDebugger({ src }) {
    const videoRef = useRef(null)
    const [log, setLog] = useState([])
    const [stats, setStats] = useState({
        readyState: '—',
        networkState: '—',
        paused: '—',
        error: 'none',
        currentSrc: '—',
        duration: '—',
    })

    const READY_STATES = [
        'HAVE_NOTHING (0)',
        'HAVE_METADATA (1)',
        'HAVE_CURRENT_DATA (2)',
        'HAVE_FUTURE_DATA (3)',
        'HAVE_ENOUGH_DATA (4)',
    ]
    const NETWORK_STATES = [
        'NETWORK_EMPTY (0)',
        'NETWORK_IDLE (1)',
        'NETWORK_LOADING (2)',
        'NETWORK_NO_SOURCE (3)',
    ]

    const addLog = (msg) =>
        setLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 40))

    const updateStats = (v) => setStats({
        readyState: READY_STATES[v.readyState] ?? v.readyState,
        networkState: NETWORK_STATES[v.networkState] ?? v.networkState,
        paused: String(v.paused),
        error: v.error ? `code=${v.error.code} msg=${v.error.message}` : 'none',
        currentSrc: v.currentSrc || '(empty — file not found or path wrong)',
        duration: isNaN(v.duration) ? 'NaN (no metadata yet)' : v.duration,
    })

    useEffect(() => {
        const v = videoRef.current
        if (!v) { addLog('❌ videoRef is null — ref not attached'); return }

        addLog(`Video element found. Initial readyState: ${v.readyState}`)
        updateStats(v)

        const events = [
            'loadstart', 'progress', 'suspend',
            'abort', 'error', 'emptied',
            'stalled', 'loadedmetadata', 'loadeddata',
            'canplay', 'canplaythrough', 'playing',
            'waiting', 'seeking', 'seeked',
        ]

        const handlers = events.map(name => {
            const fn = () => { addLog(`⚡ ${name}`); updateStats(v) }
            v.addEventListener(name, fn)
            return () => v.removeEventListener(name, fn)
        })

        // Extra: catch media errors with detail
        const onError = () => {
            const e = v.error
            const codes = { 1: 'ABORTED', 2: 'NETWORK', 3: 'DECODE', 4: 'SRC_NOT_SUPPORTED' }
            addLog(`❌ ERROR ${codes[e?.code] ?? e?.code}: ${e?.message}`)
            updateStats(v)
        }
        v.addEventListener('error', onError, true)

        // Fetch the src directly to check if the file is reachable
        const checkSrc = async () => {
            try {
                const res = await fetch(src, { method: 'HEAD' })
                addLog(`fetch HEAD ${src} → ${res.status} ${res.statusText}`)
                if (!res.ok) addLog(`❌ File not reachable — check your /public path`)
                else addLog(`✅ File reachable, Content-Type: ${res.headers.get('content-type')}`)
            } catch (err) {
                addLog(`❌ fetch failed: ${err.message}`)
            }
        }
        checkSrc()

        return () => { handlers.forEach(off => off()); v.removeEventListener('error', onError, true) }
    }, [src])

    const rowStyle = { display: 'flex', gap: '12px', padding: '4px 0', borderBottom: '0.5px solid #eee' }
    const keyStyle = { color: '#888', minWidth: '130px', fontSize: '12px' }
    const valStyle = { fontSize: '12px', wordBreak: 'break-all' }

    return (
        <div style={{
            position: 'fixed', bottom: '16px', right: '16px', width: '420px',
            background: 'rgba(10,10,10,0.93)', color: '#e8e8e8', borderRadius: '10px',
            fontFamily: 'monospace', fontSize: '12px', zIndex: 9999,
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)', overflow: 'hidden'
        }}>

            <div style={{ padding: '8px 12px', borderBottom: '1px solid #333', fontWeight: 'bold', color: '#ccc' }}>
                Video Debugger
            </div>

            {/* Hidden video element — same src, same attrs as your real one */}
            <video ref={videoRef} src={src} autoPlay muted loop playsInline preload="auto"
                style={{ display: 'none' }} />

            <div style={{ padding: '8px 12px', borderBottom: '1px solid #333' }}>
                {Object.entries(stats).map(([k, v]) => (
                    <div key={k} style={rowStyle}>
                        <span style={keyStyle}>{k}</span>
                        <span style={{ ...valStyle, color: v.includes?.('❌') || v === 'true' ? '#f87171' : v === 'false' ? '#4ade80' : '#e8e8e8' }}>{v}</span>
                    </div>
                ))}
            </div>

            <div style={{ height: '160px', overflowY: 'auto', padding: '8px 12px' }}>
                {log.map((line, i) => (
                    <div key={i} style={{
                        padding: '2px 0', borderBottom: '0.5px solid #222',
                        color: line.includes('❌') ? '#f87171' : line.includes('✅') ? '#4ade80' : '#ccc'
                    }}>
                        {line}
                    </div>
                ))}
            </div>
        </div>
    )
}