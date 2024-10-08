import { NextApiRequest, NextApiResponse } from 'next'
import apiWrapper from 'lib/api/apiWrapper'
import { constructHeaders } from 'lib/api/apiHelpers'
import { PG_META_URL } from 'lib/constants'
import { post } from 'lib/common/fetch'

export default (req: NextApiRequest, res: NextApiResponse) =>
  apiWrapper(req, res, handler, { withAuth: true })

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req

  console.log({"index_url": req.url, "index_method": method})

  switch (method) {
    case 'POST':
      return handlePost(req, res)
    default:
      res.setHeader('Allow', ['POST'])
      res.status(405).json({ error: { message: `Method ${method} Not Allowed` } })
  }
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req.body
  const headers = constructHeaders(req.headers)
  const url = `${PG_META_URL}/query`
  const response = await post(url, { query: enrichQuery(query) }, { headers })

  console.log({url, query: enrichQuery(query)})
  if (response.error) {
    return res.status(400).json(response.error)
  } else {
    return res.status(200).json(response)
  }
}

const enrichQuery = (query: string) => `
-- source: dashboard
-- user: ${'self host'}
-- date: ${new Date().toISOString()}

${query}
`
