// test_openai.js

const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function testAPI() {
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: 'Hello, world!',
      max_tokens: 5,
    });
    console.log(response.data.choices[0].text.trim());
  } catch (error) {
    console.error('OpenAI API test failed:', error);
  }
}

testAPI();
