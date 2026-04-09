import { useEffect } from 'react'

const useMSE = (src: string, videoRef: React.RefObject<HTMLVideoElement>) => {
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let type = 'normal'
    if (/m3u8(#|\?|$)/i.exec(src)) type = 'hls'
    else if (/.flv(#|\?|$)/i.exec(src)) type = 'flv'

    if (
      type === 'hls' &&
      (video.canPlayType('application/x-mpegURL') || video.canPlayType('application/vnd.apple.mpegURL'))
    ) {
      type = 'normal'
    }

    if (type === 'hls') {
      const Hls = (window as any).Hls
      if (Hls && Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(video)
      }
    }
    else if (type === 'flv') {
      const flvjs = (window as any).flvjs
      if (flvjs && flvjs.isSupported()) {
        const flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: src,
        })
        flvPlayer.attachMediaElement(video)
        flvPlayer.load()
      }
    }
  }, [src, videoRef])
}

export default useMSE
