const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const sha256 = (message) => {
  return crypto.createHash("sha256").update(message).digest("hex");
};

const formatBlockHeader = (
  hash,
  prevBlockHash,
  merkleRoot,
  timestamp,
  difficulty,
  nonce
) => {
  const headerBorder =
    "+-------------------------------------------------------------------------------------+\n";
  const formatLine = (label, value) =>
    `| ${label.padEnd(15)}: ${value.padEnd(40)}\n`;

  let output = "";
  output += headerBorder;
  output += formatLine("Block Hash", hash);
  output += headerBorder;
  output += formatLine("Prev Block", prevBlockHash);
  output += formatLine("Merkle Root", merkleRoot);
  output += formatLine("Timestamp", timestamp.toString());
  output += formatLine("Difficulty", difficulty);
  output += formatLine("Nonce", nonce.toString());
  output += headerBorder;

  return output;
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const prevBlockHash = "000000000000000000abcdef1234567890";
const merkleRoot =
  "a65b2099ee79a3677f6a0a80607f8f42643e8d203ad99a016a52100ac3fc8f93";
const timestamp = Math.floor(Date.now() / 1000);
const difficulty = "0x1d00ffff";

const ensurePendingBlocksDirectory = () => {
  const directoryPath = path.join(__dirname, "pendingBlocks");
  if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath);
  }
  return directoryPath;
};

const getNextBlockFileName = (directoryPath) => {
  const files = fs.readdirSync(directoryPath);
  const blockNumbers = files
    .map((file) => {
      const match = file.match(/pendingBlock#(\d+)\.txt$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((num) => num !== null);

  const nextBlockNumber =
    blockNumbers.length > 0 ? Math.max(...blockNumbers) + 1 : 0;
  return `pendingBlock#${nextBlockNumber}.txt`;
};

const mineBlock = async () => {
  let nonce = 0;
  let hash;

  const directoryPath = ensurePendingBlocksDirectory();

  while (true) {
    hash = sha256(
      `${prevBlockHash}${merkleRoot}${timestamp}${difficulty}${nonce}`
    );

    if (hash.startsWith("00")) {
      console.log("채굴에 성공하였습니다!");

      const blockHeader = formatBlockHeader(
        hash,
        prevBlockHash,
        merkleRoot,
        timestamp,
        difficulty,
        nonce
      );

      const fileName = getNextBlockFileName(directoryPath);
      const filePath = path.join(directoryPath, fileName);

      fs.writeFileSync(filePath, blockHeader, "utf8");
      console.log(`블록 헤더가 '${fileName}' 파일로 저장되었습니다.`);
      break;
    }

    console.log(`Nonce: ${nonce}, Hash: ${hash}`);

    await delay(500);

    nonce += 1;
  }
};

mineBlock();
