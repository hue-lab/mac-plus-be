import { PipelineStage } from "mongoose";

export function paginate(aggregate: PipelineStage[], page: number, limit: number): void {
    aggregate.push(
        {
            $facet: {
                metadata: [ { $count: "total" }, { $addFields: { page, limit, lastPage: { $ceil: { $divide: ['$total', limit] } } } } ],
                data: [ { $skip: (page - 1) * limit }, { $limit: limit } ]
            },
        },
        {
            $addFields: {
                metadata: {
                    $ifNull: [
                        { $arrayElemAt: [ "$metadata", 0 ] },
                        {
                            total: 0,
                            page,
                            limit,
                            lastPage: 1,
                        }
                    ]
                }
            }
        },
    )
}