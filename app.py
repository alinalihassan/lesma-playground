import os
import tempfile
import time
import os.path

from pydantic import BaseModel
from fastapi import FastAPI

from subprocess import check_output, CalledProcessError

app = FastAPI()

class RunRequest(BaseModel):
    body: str

@app.post("/api/run")
def run_code(req: RunRequest):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(req.body.encode())
        tmp.close()

        timeStarted = time.time()
        try:
            out = check_output(["/root/.lesma/bin/lesma", "run", tmp.name])
            timeEnded = time.time()
            os.remove(tmp.name)
            
            return {"events": [{
                "Delay": timeEnded - timeStarted,
                "Message": out.decode("utf-8"),
                "Kind": "stdout"
            }]}
        except CalledProcessError as e:
            timeEnded = time.time()
            print(f"Error: {e.output}")
            os.remove(tmp.name)

            return {"events": [{
                "Delay": timeEnded - timeStarted,
                "Message": e.output,
                "Kind": "stderr"
            }]}