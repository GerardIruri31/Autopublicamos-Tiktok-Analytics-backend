import apify_client
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio

app = FastAPI()
# Habilitar CORS en FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Puedes restringirlo a ["http://ca-apifast-python-v1final"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class FetchRequest(BaseModel):
    ApiToken: str
    StartDate: str
    FinishDate: str
    AccountList: list

async def fetch_data(ApiToken, StartDate, FinishDate, AccountList):
    try:
        run_input = {
        "resultsPerPage": 1000,
        "excludePinnedPosts": True,
        "newestPostDate": FinishDate,                                  
        "oldestPostDate": StartDate,                                     
        "profiles": AccountList   
        }

        client = apify_client.ApifyClient(ApiToken)
        loop = asyncio.get_event_loop()
        run = await loop.run_in_executor(None, lambda: client.actor("clockworks/free-tiktok-scraper").call(run_input=run_input))
        dataset_id = run.get("defaultDatasetId")
        if not dataset_id:
            return {"onError": {"error": "No se encontró datasetId en la respuesta de Apify"}}
        data = await loop.run_in_executor(None, lambda: list(client.dataset(dataset_id).iterate_items()))
        return {"onSuccess": {"data": data}}
    except Exception as e:
        print("Error: " + str(e))
        return {"onError": {"error": str(e)}}
    

@app.post("/APICall")
async def fetch_tiktok_data(request:FetchRequest):
    return await fetch_data(
        ApiToken=request.ApiToken,
        StartDate=request.StartDate,
        FinishDate=request.FinishDate,
        AccountList=request.AccountList
    )




        
   

