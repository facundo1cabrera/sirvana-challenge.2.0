import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import clientPromise from '../../../lib/mongodb';


export const maxDuration = 30;

export async function POST(req: Request) {
  const { product } = await req.json();
  const client = await clientPromise;
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: product.description,
    });

    const db = client.db('sirvana-challenge');
    const collection = db.collection("products");

    await collection.insertOne({ product, plot_embedding: embedding })

    return Response.json({})
  } catch (err) {
    console.log(err)
    return Response.json({ message: 'Internal server error' }, {
      status: 500
    })
  } finally {
    await client.close();
  }
}