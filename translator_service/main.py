from fastapi import FastAPI
from pydantic import BaseModel
from transformers import MarianMTModel, MarianTokenizer

app = FastAPI()

class TranslationRequest(BaseModel):
    src_text: str
    src_lang: str
    tgt_lang: str

model_cache = {}

def get_model(src_lang, tgt_lang):
    model_name = f'Helsinki-NLP/opus-mt-{src_lang}-{tgt_lang}'
    if model_name not in model_cache:
        tokenizer = MarianTokenizer.from_pretrained(model_name)
        model = MarianMTModel.from_pretrained(model_name)
        model_cache[model_name] = (tokenizer, model)
    return model_cache[model_name]

@app.post('/translate')
async def translate(req: TranslationRequest):
    tokenizer, model = get_model(req.src_lang, req.tgt_lang)
    inputs = tokenizer([req.src_text], return_tensors='pt', padding=True)
    translated = model.generate(**inputs)
    tgt_text = tokenizer.decode(translated[0], skip_special_tokens=True)
    return {
        'translated_text': tgt_text,
        'model': f'opus-mt-{req.src_lang}-{req.tgt_lang}'
    }
