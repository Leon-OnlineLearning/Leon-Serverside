export default function paginationParameters(req: any) {
    const page: any = req.query.page
    const limit : any = req.query.limit
    const skip = page && limit ? (parseInt(page) - 1) * parseInt(limit) : undefined
    const take = limit ? parseInt(limit) : undefined
    return [skip, take]
}