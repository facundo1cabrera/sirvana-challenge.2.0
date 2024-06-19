'use server';

import { createStreamableValue } from 'ai/rsc';
import { embed, streamText } from 'ai';
import { openai } from '@ai-sdk/openai';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function getResponse(prompt: string) {
    const client = await clientPromise;

    try {
        const { embedding } = await embed({
            model: openai.embedding('text-embedding-3-small'),
            value: prompt,
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

        const retrievedPrompt = `
DOCUMENT:
${document.toString()}

QUESTION:
${prompt}

INSTRUCTIONS:
Answer the users QUESTION and add related code ids from the DOCUMENT if possible with <id>productId</id>
`;
        console.log(document)

        const response = await streamText({
            model: openai('gpt-4-turbo'),
            prompt: retrievedPrompt,
        });

        const stream = createStreamableValue(response.textStream);
        return stream.value;
    } catch (error) {
        throw new Error("Error getting a response.")
    }
    finally {
        await client.close();
    }
}

export async function getProductData(id: string) {
    const client = await clientPromise;

    try {
        await client.connect();

        const database = client.db("sirvana-challenge");
        const coll = database.collection("products");

        const product = await coll.findOne({ _id: new ObjectId(id) });

        return product;
    } catch (error) {
        throw new Error("Error getting product data.")
    }
    finally {
        await client.close();
    }
}