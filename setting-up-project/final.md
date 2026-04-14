python -m venv .venv
source .venv/bin/activate

IN MAIN FOLDER:

sudo apt update

sudo apt install -y \
  clang llvm libbpf-dev \
  linux-headers-$(uname -r) \
  linux-tools-common \
  linux-tools-$(uname -r) \
  iproute2 \
  python3 python3-venv python3-pip \
  iperf3

pip install joblib
pip install pandas
pip install xgboost

terminal 1: bash scripts/run_xdp_loader_with_logs.sh
terminal 2: bash scripts/run_iperf_server_with_logs.sh
terminal 3: bash scripts/run_stats_reader_with_logs.sh

IN BACKEND:

cd backend
python -m venv .venv
pip install fastapi
pip install uvicorn