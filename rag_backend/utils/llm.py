import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY", "dummy-key"))
print(os.getenv("GROQ_API_KEY"))

def generate_answer(question: str, context: str) -> str:
    """Generates an answer using the provided context against Groq."""
    system_prompt = (
        "You are a helpful company assistant.\n"
        "Answer the question ONLY based on the provided Context.\n"
        "Do not hallucinate.\n"
    )
    
    user_prompt = f"Context:\n{context}\n\nQuestion:\n{question}"
#    print(user_prompt)
    
    try:
        response = client.chat.completions.create(messages=[{"role": "system", "content": system_prompt},{"role": "user", "content": user_prompt}],
        model="llama-3.1-8b-instant",
        temperature=0.0,
        max_tokens=200)
        return response.choices[0].message.content
    except Exception as e:
        print(f"LLM Error: {e}")
        return "Not available"

def stream_generate_answer(question: str, context: str):
    """Yields tokens from Groq as they are generated."""
    system_prompt = (
        "You are a helpful company assistant.\n"
        "Answer the question ONLY based on the provided Context.\n"
        "Do not hallucinate.\n"
    )
    user_prompt = f"Context:\n{context}\n\nQuestion:\n{question}"
    
    try:
        response = client.chat.completions.create(
            messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}],
            model="llama-3.1-8b-instant",
            temperature=0.0,
            max_tokens=600,
            stream=True
        )
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        print(f"Streaming LLM Error: {e}")
        yield "An error occurred while generating the answer."

if __name__ == "__main__":
    question = "What is Paddy Disease?"
    
    context = """
    The images of the diseased paddy leaves  include the effects of various paddy leaf  diseases such as bacterial leaf blight, brown  spot, and leaf blast. The images of the paddy  leaves, both diseased and healthy, were taken  under natural environmental conditions, thus  simulating the actual scenario of paddy  farming.    
---
Paddy, as a food crop, has a  high susceptibility to a number of leaf diseases,  such as bacterial leaf blight, brown spot, and  leaf blast, which can cause considerable  damage to the yield as well as the quality of the  rice grains. The spread of these diseases,  especially under favorable climatic conditions,  has become a major threat to the food security  of the global population.
---
Thus, the detection of  paddy leaf diseases has become very important  to effectively address the challenges associated  with these diseases.
---
Traditionally, the detection of these diseases has  been carried out using the visual observation  method, wherein the symptoms of the diseases,  such as leaf discoloration, the presence of  lesions, wilting, and abnormal growth, are  observed to determine the presence of the  disease, as well as the type of disease, in the  paddy crop.
---
Paddy Disease Detection using Machine Learning    Department of Information Technology, Coimbatore Institute of Technology, Coimbatore, India. I. Introduction    Paddy, which refers to rice, is one of the most  important food crops grown globally, playing a  vital role as a food source to a large part of the  world’s population.
Context:
The images of the diseased paddy leaves  include the effects of various paddy leaf  diseases such as bacterial leaf blight, brown  spot, and leaf blast. The images of the paddy  leaves, both diseased and healthy, were taken  under natural environmental conditions, thus  simulating the actual scenario of paddy  farming.
---
Paddy, as a food crop, has a  high susceptibility to a number of leaf diseases,  such as bacterial leaf blight, brown spot, and  leaf blast, which can cause considerable  damage to the yield as well as the quality of the  rice grains. The spread of these diseases,  especially under favorable climatic conditions,  has become a major threat to the food security  of the global population.
---
Thus, the detection of  paddy leaf diseases has become very important  to effectively address the challenges associated  with these diseases.
---
Traditionally, the detection of these diseases has  been carried out using the visual observation  method, wherein the symptoms of the diseases,  such as leaf discoloration, the presence of  lesions, wilting, and abnormal growth, are  observed to determine the presence of the  disease, as well as the type of disease, in the  paddy crop.
---
Paddy Disease Detection using Machine Learning    Department of Information Technology, Coimbatore Institute of Technology, Coimbatore, India. I. Introduction    Paddy, which refers to rice, is one of the most  important food crops grown globally, playing a  vital role as a food source to a large part of the  world’s population.
    """

    answer = generate_answer(question, context)
    print("\nFinal Answer:", answer)