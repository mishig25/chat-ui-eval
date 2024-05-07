# chat-ui-eval

A helper repo that runs sets of prompts on chat-ui (using the API) and records the responses into json file. This is helpful for vibe check when we are experimenting with a new techniques such as websearch, text chunking, etc. This [Google sheet](https://docs.google.com/spreadsheets/u/1/d/1pNoDa00d-yoOQt5SwVczDeOO8atsbY3YTK002FwUIPU/edit?usp=sharing) was produced using `chat-ui-eval`.

### How it works

1. Make sure you have local chat-ui running
2. Install all deps of `chat-ui-eval` with `npm ci`
3. Change `EXPERIMENT_ID` & `CHAT_UI_BRANCH_NAME` in `.env` file
3. Change prompts if needed by changing contents of `prompts.js` file
4. Run experiment by `npm run eval`
5. Once done, the result will be recorded at `data/${process.env.EXPERIMENT_ID}/${process.env.CHAT_UI_BRANCH_NAME}.json` (you can visit `data` folder to see past experiments).
6. (Optionally), you can use `aggregator.ipynb` to aggregate experiments for comparisons and create a unified sheet

