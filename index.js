const { JsonRpcProvider } = require("@ethersproject/providers");
const { default: axios } = require("axios");
const ethers = require("ethers");
const jbx = require("juice-sdk-v1");

require("dotenv").config();

const RPC_HOST = `https://mainnet.infura.io/v3/${process.env.INFURA_ID}`;

const PEEL_JUICEBOX_PROJECT_ID = 329;

function postDiscordMessage(opts) {
  return axios.post(process.env.DISCORD_WEBHOOK_URL, opts);
}

function onTapEvent(_, projectId, beneficiary, amount) {
  const data = { projectId: projectId.toString(), beneficiary, amount };
  console.log(data);

  postDiscordMessage({
    content: "💸 Time to check your wallet... **we just got paid!** 💸",
  });
}

function onPayEvent(_, projectId, beneficiary, amount) {
  const data = { projectId: projectId.toString(), beneficiary, amount };
  console.log(data);

  const amountETH = ethers.utils.formatEther(amount);

  postDiscordMessage({
    content: `🎉 New Juicebox payment 🎉 \n\`${beneficiary}\` paid ${amountETH} ETH`,
  });
}

function addEventListeners({ projectId }) {
  const provider = new JsonRpcProvider(RPC_HOST);
  const TerminalV1_1 = jbx.getTerminalV1_1Contract(provider);

  const projectIdHex = ethers.BigNumber.from(projectId).toHexString();

  const tapFilter = TerminalV1_1.filters.Tap([], projectIdHex);
  TerminalV1_1.on(tapFilter, onTapEvent);

  const payFilter = TerminalV1_1.filters.Pay([], projectIdHex);
  TerminalV1_1.on(payFilter, onPayEvent);
}

function main({ projectId }) {
  addEventListeners({ projectId });

  console.log(`Listening for events on Juicebox project ${projectId}...`);
}

main({ projectId: PEEL_JUICEBOX_PROJECT_ID });
