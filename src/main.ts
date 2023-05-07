import { config } from 'dotenv';
import { Configuration, OpenAIApi } from 'openai';

config();
const apiKey = process.env.OPENAI_API_KEY || '';
if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not set');
}

const client = new OpenAIApi(new Configuration({ apiKey }));

async function main() {
}

main().then(()=> {
    console.log('Completed');
}).catch(err => {
    console.error(err?.message ?? err?.response?.status ?? err?.response?.data ?? err);
});