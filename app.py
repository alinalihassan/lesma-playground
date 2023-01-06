"""Server backend to run"""
import tempfile
import time
import os
import os.path

from subprocess import check_output, CalledProcessError

from pydantic import BaseModel
from fastapi import FastAPI

app = FastAPI()


class RunRequest(BaseModel):
    body: str


@app.post("/api/run")
def run_code(req: RunRequest):
    """Expect body to contain the Lesma code, runs it, and then returns details about execution"""
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        tmp.write(req.body.encode())
        tmp.close()

        time_started = time.time()
        try:
            out = check_output(["lesma", "run", tmp.name])
            time_ended = time.time()
            os.remove(tmp.name)

            return {"events": [{
                "Delay": time_ended - time_started,
                "Message": out.decode("utf-8"),
                "Kind": "stdout"
            }]}
        except CalledProcessError as error:
            time_ended = time.time()
            print(f"Error: {error.output}")
            os.remove(tmp.name)

            return {"events": [{
                "Delay": time_ended - time_started,
                "Message": error.output,
                "Kind": "stderr"
            }]}
