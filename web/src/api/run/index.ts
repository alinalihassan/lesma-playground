import type { NextApiRequest, NextApiResponse } from "next";
import tmp from "tmp";
import { writeFileSync } from "fs";

tmp.setGracefulCleanup();
const util = require("util");
const exec = util.promisify(require("child_process").exec);

type Data = {
  code: string;
};

type Result = {
  events: [
    {
      Delay: number;
      Message: string;
      Kind: "stdout" | "stderr";
    }
  ];
};

let run_lesma = (code: string): Result => {
  const tmp_obj = tmp.fileSync();
  writeFileSync(tmp_obj.fd, code);

  let startTime = new Date().getTime();
  let { err, stdout, stderr } = exec(`lesma run ${tmp_obj.name}`);
  let elapsed = (new Date().getTime() - startTime) / 1000;

  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  console.log(`time: ${elapsed}`);

  if (err) {
    // node couldn't execute the command
    console.log(`Error: ${err}`);
    return {
      events: [
        {
          Delay: elapsed,
          Message: "An internal error occurred",
          Kind: "stderr",
        },
      ],
    };
  }

  if (stderr !== "") {
    return {
      events: [
        {
          Delay: elapsed,
          Message: stderr,
          Kind: "stderr",
        },
      ],
    };
  } else {
    return {
      events: [
        {
          Delay: elapsed,
          Message: stdout,
          Kind: "stdout",
        },
      ],
    };
  }
};

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  const { code } = req.body;
  let result = run_lesma(code);
  res.status(200).json(result);
}

export { run_lesma };
