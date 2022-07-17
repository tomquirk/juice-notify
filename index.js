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

function main({ projectId }) {
  const provider = new JsonRpcProvider(RPC_HOST);
  const TerminalV1_1 = jbx.getTerminalV1_1Contract(provider);

  const filter = TerminalV1_1.filters.Tap(
    [],
    ethers.BigNumber.from(projectId).toHexString()
  );

  TerminalV1_1.on(filter, onTapEvent);

  console.log("Listening for Tap event...");
}

main({ projectId: PEEL_JUICEBOX_PROJECT_ID });
