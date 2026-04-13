const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN ?? ''
const TIKTOK_API_URL      = 'https://open.tiktokapis.com/v2'

export async function publishTikTokVideo(params: {
  videoUrl:    string
  title:       string
  description: string
}): Promise<string> {
  // Step 1: Initialize upload
  const initRes = await fetch(`${TIKTOK_API_URL}/post/publish/video/init/`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({
      post_info: {
        title:        params.title,
        description:  params.description,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet:  false,
        disable_stitch: false,
        disable_comment: false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: {
        source:    'PULL_FROM_URL',
        video_url: params.videoUrl,
      },
    }),
  })

  if (!initRes.ok) {
    const err = await initRes.text()
    throw new Error(`TikTok init error: ${err}`)
  }

  const initData = await initRes.json()
  return initData.data?.publish_id ?? ''
}

export async function getTikTokPublishStatus(publishId: string): Promise<string> {
  const res = await fetch(`${TIKTOK_API_URL}/post/publish/status/fetch/`, {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json; charset=UTF-8',
    },
    body: JSON.stringify({ publish_id: publishId }),
  })
  if (!res.ok) throw new Error(`TikTok status error: ${await res.text()}`)
  const data = await res.json()
  return data.data?.status ?? 'UNKNOWN'
}
