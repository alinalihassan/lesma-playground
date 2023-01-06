# Lesma Playground

## Command to run
```bash
python -m uvicorn app:app --reload --host 0.0.0.0 --port 18080
```

## Commands to run in VM Instance
```bash
pm2 resurrect
pm2 start "python -m uvicorn app:app --host 0.0.0.0 --port 18080" --name lesma-playground
sudo sysctl net.ipv4.ip_unprivileged_port_start=80
PORT=80 pm2 start "npm start" --name lesma-playground-web
```