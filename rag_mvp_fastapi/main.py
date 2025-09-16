from fastapi import FastAPI , File , UploadFile , Form 
from pydantic import BaseModel
from typing import List
from qdrant_client import QdrantClient
from qdrant_client.models import PointStruct , Filter , FieldCondition , MatchValue
from sentence_transformers import SentenceTransformer
import fitz
import uuid
from dotenv import load_dotenv
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse , JSONResponse
import httpx
import json
load_dotenv()
import logging
QDRANT_KEY = os.getenv("QDRANT_KEY")
QDRANT_URL = os.getenv("QDRANT_URL")
LLM_BASE_URL = os.getenv("LLM_URL")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(name)s - %(message)s"
)

logger = logging.getLogger(__name__)



app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # List of allowed origins
    allow_credentials=True,  # Allow cookies and credentials
    allow_methods=["*"],     # Allow all HTTP methods
    allow_headers=["*"],     # Allow all headers
)

qdrant = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_KEY
)

model = SentenceTransformer("all-MiniLM-L6-v2")

COLLECTION_NAME = "rag_mvp_v1"

if COLLECTION_NAME not in [c.name for c in qdrant.get_collections().collections]:
    qdrant.recreate_collection(
        collection_name=COLLECTION_NAME,
        vectors_config={"size":384,"distance":"Cosine"}
    )

    qdrant.create_payload_index(
        collection_name=COLLECTION_NAME,
        field_name="org_id",
        field_schema="keyword"
    )

    logger.info(f"[*] Collection created with name {COLLECTION_NAME}")
else:
    logger.info(f"[*] Collection already exists with name {COLLECTION_NAME}")
    

def extract_text_from_doc(file_bytes : bytes) -> str:
    doc = fitz.open(stream=file_bytes,filetype="pdf")
    return "\n".join([page.get_text() for page in doc])

def chunk_text(text:str,chunk_size:int=500,overlap:int=50) -> List[str]:
    words = text.split()
    chunks = []
    for i in range(0,len(words),chunk_size-overlap):
        chunk = words[i:i+chunk_size]
        chunks.append(" ".join(chunk))
    return chunks

class QueryRequest(BaseModel):
    id : str
    query : str


@app.post("/upload")
async def upload_documents(
    file : UploadFile = File(),
    orgID : str = Form()
):
    try:

        logger.info("UPLOAD FUNCTION TRIGGERED")
        content = await file.read()
        
        text = extract_text_from_doc(content)
        chunks = chunk_text(text)

        vectors = model.encode(chunks).tolist()

        logger.info(vectors)
        points = [
            PointStruct(
                id = str(uuid.uuid4()),
                vector=vectors[i],
                payload={"text" : chunks[i] , "org_id" : orgID}
            )
            for i in range(len(chunks))
        ]

        qdrant.upsert(collection_name=COLLECTION_NAME,points=points)

        logger.info(f"Uploaded and stored {len(points)} chunks for org_id {orgID}")

        return {"meta" : f"Uploaded and stored {len(points)} chunks for org_id {orgID}",
                "message" : f"File uploaded successfully : {file.filename}"}
    except Exception as e:
        logger.info("Something went wrong please try again later")
        logger.error(e)
        return {"message" : "Something went wrong please try again later"}


def semantic_search(req : QueryRequest):
    query_vector = model.encode(req.query).tolist()

    result = qdrant.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        limit=3,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="org_id",
                    match=MatchValue(value=req.id)
                )
            ]
        )
    )
  
    return [{"text":hit.payload["text"],"score" : hit.score} for hit in result]


@app.post("/proxy_llm_strem")
async def generate_text_llm(req : QueryRequest):
    context_res = semantic_search(req)
    context = "\n\n".join(context["text"] for context in context_res)
    llm_payload = {
        "context" : context,
        "query" : req.query
    }

    async def stream_llm_response():
        async with httpx.AsyncClient(timeout=None) as client:
            async with client.stream(
                "POST",
                f"{LLM_BASE_URL}/llm_streaming",
                json=llm_payload,
                headers={"accept" : "text/event-stream"}
            ) as response:
                async for line in response.aiter_text():
                    if line:
                        yield line
    return StreamingResponse(stream_llm_response(),media_type="text/event-stream")





# Command to run
# uvicorn main:app --host 0.0.0.0 --reload