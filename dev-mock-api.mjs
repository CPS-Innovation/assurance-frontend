import http from 'node:http'

const port = Number(process.env.MOCK_API_PORT || 5000)

const json = (res, status, body) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  })
  res.end(JSON.stringify(body))
}

const sampleProject = {
  id: 'proj-1',
  name: 'Sample delivery',
  status: 'Green',
  phase: 'Discovery',
  standardsSummary: []
}

const sampleGroup = { id: 'group-1', name: 'Sample group' }
const samplePartner = { id: 'partner-1', name: 'Sample partner' }

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://localhost:${port}`)
  const { pathname } = url

  if (req.method === 'OPTIONS') return json(res, 204, null)

  if (pathname === '/health' || pathname === '/healthz') {
    return json(res, 200, { status: 'ok', service: 'assurance-api-mock' })
  }

  if (pathname === '/api/v1.0/projects') return json(res, 200, [sampleProject])
  if (pathname === '/api/v1.0/deliverygroups') return json(res, 200, [sampleGroup])
  if (pathname === '/api/v1.0/deliverypartners') return json(res, 200, [samplePartner])
  if (pathname === '/api/v1.0/professions') return json(res, 200, [])
  if (pathname === '/api/v1.0/servicestandards') return json(res, 200, [])
  if (pathname === '/api/v1.0/themes') return json(res, 200, [])

  if (pathname.startsWith('/api/v1.0/projects/')) {
    const id = pathname.split('/')[4]
    if (!id) return json(res, 404, { message: 'Not found' })
    if (pathname.endsWith('/history')) return json(res, 200, [])
    if (pathname.includes('/standards/')) return json(res, 200, { id: 'std-1', name: 'Standard' })
    if (pathname.endsWith('/deliverypartners')) return json(res, 200, [])
    return json(res, 200, { ...sampleProject, id })
  }

  if (pathname.startsWith('/api/v1.0/deliverygroups/')) {
    const id = pathname.split('/')[4]
    return json(res, 200, { ...sampleGroup, id })
  }

  if (pathname.startsWith('/api/v1.0/deliverypartners/')) {
    const id = pathname.split('/')[4]
    return json(res, 200, { ...samplePartner, id })
  }

  return json(res, 404, { message: 'Mock route not implemented', path: pathname })
})

server.listen(port, () => {
  console.log(`Mock assurance API listening on http://localhost:${port}`)
})
