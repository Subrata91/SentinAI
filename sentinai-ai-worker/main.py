import json
import hashlib
import os
import redis
import threading
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime
import zoneinfo
from dotenv import load_dotenv
from pymongo import MongoClient
from confluent_kafka import Consumer, KafkaError
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# Load environment variables
load_dotenv()

# Dummy HTTP Server to satisfy Render Free Web Service health checks
class HealthCheckHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-type", "text/plain")
        self.end_headers()
        self.wfile.write(b"SentinAI Python Worker Operational")

    def log_message(self, format, *args):
        return  # Suppress HTTP access logging

def start_health_server():
    port = int(os.getenv("PORT", 10000))
    server = HTTPServer(("0.0.0.0", port), HealthCheckHandler)
    print(f"[AI ENGINE] Health server listening on port {port}...")
    server.serve_forever()

# Launch HTTP health server daemon thread
threading.Thread(target=start_health_server, daemon=True).start()

# Connection to Upstash Redis
redis_client = redis.Redis(
    host=os.getenv('REDIS_HOST'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    password=os.getenv('REDIS_PASSWORD'),
    ssl=True
)

# Connection to MongoDB Atlas
mongo_client = MongoClient(
    os.getenv('MONGO_URI'),
    tls=True,
    tlsAllowInvalidCertificates=True
)
db = mongo_client['sentinai_db']
logs_collection = db['scan_logs']

print("[AI ENGINE] Loading Sentiment Analyzer...")
analyzer = SentimentIntensityAnalyzer()
print("[AI ENGINE] Analyzer Loaded Successfully.")

# Connection to Aiven Kafka
conf = {
    'bootstrap.servers': os.getenv('KAFKA_BOOTSTRAP_SERVERS'),
    'security.protocol': 'SASL_SSL',
    'sasl.mechanism': 'SCRAM-SHA-256',
    'sasl.username': os.getenv('KAFKA_USERNAME'),
    'sasl.password': os.getenv('KAFKA_PASSWORD'),
    'ssl.ca.location': 'ca.pem',
    'group.id': 'ai-worker-group',
    'auto.offset.reset': 'earliest'
}

consumer = Consumer(conf)
consumer.subscribe(['content-scan-requests'])

def get_ist_timestamp():
    ist = zoneinfo.ZoneInfo("Asia/Kolkata")
    return datetime.now(ist).strftime("%Y-%m-%d %H:%M:%S IST")

SECURITY_PATTERNS = [
    "ignore all safety rules", "ignore previous instructions", "crash the target server",
    "wipe system logs", "drop table", "select * from", "eval(", "exec(", "password", "secret"
]

def process_message(msg_val):
    data = json.loads(msg_val)
    scan_id = data.get('scanId')
    payload = data.get('payload', '')
    timestamp = data.get('timestamp') or get_ist_timestamp()
    
    if not scan_id:
        return

    # Rule-Based Security Inspection
    has_security_threat = any(pattern in payload.lower() for pattern in SECURITY_PATTERNS)

    # Lightweight Sentiment & Toxicity Inspection
    sentiment_scores = analyzer.polarity_scores(payload)
    is_negative = sentiment_scores['compound'] <= -0.40 or sentiment_scores['neg'] >= 0.35
    confidence_score = round(abs(sentiment_scores['compound']) * 100, 2)

    # Hybrid Verdict Determination
    if has_security_threat or is_negative:
        status = "FLAGGED"
        threat_type = "Prompt Injection / Malicious Command Risk" if has_security_threat else "High Risk / Harmful Content Detected"
        confidence = "99.90%" if has_security_threat else f"{confidence_score}%"
    else:
        status = "CLEARED"
        threat_type = "Low Risk Payload"
        confidence = f"{round((1 - abs(sentiment_scores['compound'])) * 100, 2)}%"

    response_data = {
        "scanId": scan_id,
        "status": status,
        "confidence": confidence,
        "threatType": threat_type,
        "payload": payload,
        "timestamp": timestamp
    }
    
    # Store in Redis and update MongoDB Atlas
    sha_hash = hashlib.sha256(payload.encode('utf-8')).hexdigest()
    redis_client.set(f"hash:{sha_hash}", json.dumps(response_data), ex=86400)
    
    logs_collection.update_one(
        {"_id": scan_id},
        {"$set": {
            "status": status,
            "threatType": threat_type,
            "confidence": confidence,
            "payload": payload,
            "timestamp": timestamp
        }},
        upsert=True
    )
    print(f"[AI ENGINE] Processed: {status} ({confidence}) for Scan ID: {scan_id}")

print("[AI ENGINE] Active. Listening for Aiven Kafka events...")

try:
    while True:
        msg = consumer.poll(timeout=1.0)
        if msg is None:
            continue
        if msg.error():
            if msg.error().code() != KafkaError._PARTITION_EOF:
                print(f"[KAFKA ERROR] {msg.error()}")
            continue
            
        process_message(msg.value().decode('utf-8'))

except KeyboardInterrupt:
    print("[AI ENGINE] Shutting down...")
finally:
    consumer.close()