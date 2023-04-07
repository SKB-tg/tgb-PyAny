FROM python:3.10-slim-buster

WORKDIR /app

ENV TELEGRAM_API_TOKEN = "1699887557:AAGvYsHg0IjLplNPmWiBRwbWfQrXVIRzZmU"

COPY requirements.txt /app/
RUN pip install --no-cache-dir -r /APP/requirements.txt

COPY ashop-tg /app
#COPY createdb.sql ./ / /

EXPOSE 8000

ENTRYPOINT ["python", "main.py"]
