FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10

WORKDIR /app

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 7878

CMD ["gunicorn", "-b", "0.0.0.0:7878", "-w", "3", "--log-file", "-", "--log-level", "debug", "--access-logfile", "-", "app:app"]