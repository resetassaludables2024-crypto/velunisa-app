const IG_USER_ID   = process.env.META_INSTAGRAM_USER_ID ?? ''
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN ?? ''
const GRAPH_URL    = 'https://graph.facebook.com/v19.0'

export async function createMediaContainer(params: {
  imageUrl: string
  caption: string
}): Promise<string> {
  const url = `${GRAPH_URL}/${IG_USER_ID}/media`
  const res = await fetch(url, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url:    params.imageUrl,
      caption:      params.caption,
      access_token: ACCESS_TOKEN,
    }),
  })
  if (!res.ok) throw new Error(`IG container error: ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}

async function waitForContainer(containerId: string, maxAttempts = 10): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 3000))
    const res = await fetch(
      `${GRAPH_URL}/${containerId}?fields=status_code&access_token=${ACCESS_TOKEN}`
    )
    const data = await res.json()
    if (data.status_code === 'FINISHED') return
    if (data.status_code === 'ERROR') throw new Error('Container processing failed')
  }
  throw new Error('Container processing timeout')
}

export async function publishInstagramPost(params: {
  imageUrl: string
  caption:  string
}): Promise<string> {
  const containerId = await createMediaContainer(params)
  await waitForContainer(containerId)

  const res = await fetch(`${GRAPH_URL}/${IG_USER_ID}/media_publish`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id:  containerId,
      access_token: ACCESS_TOKEN,
    }),
  })
  if (!res.ok) throw new Error(`IG publish error: ${await res.text()}`)
  const data = await res.json()
  return data.id as string
}
