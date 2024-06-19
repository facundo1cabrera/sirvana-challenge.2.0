import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import clientPromise from '../../../lib/mongodb';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { question } = await req.json();
    const client = await clientPromise;

    try {

        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: question,
        });

        await client.connect();

        const database = client.db("sirvana-challenge");
        const coll = database.collection("products");

        const agg = [
            {
              '$vectorSearch': {
                'index': 'vector_index', 
                'path': 'plot_embedding', 
                'queryVector': embedding, 
                'numCandidates': 150, 
                'limit': 10
              }
            }, {
                "$project": {
                    "_id": 1,
                    "plot_embedding": 0,
                    "product": 0
                }
            }
          ];

        const result = coll.aggregate(agg);

        let document = []
        for await (const res of result) {
            document.push(res._id.toString())
        }

        return Response.json({ document })
    } catch (error) {
        console.log(error)
        return new Response(JSON.stringify({ message: "Internal server error" }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    finally {
        await client.close();
    }
}