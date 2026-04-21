import os
from dotenv import load_dotenv
import boto3
from pinecone import Pinecone
from groq import Groq

# 1. Load the environment variables
load_dotenv()

def test_aws():
    print("\n--- Testing AWS S3 ---")
    try:
        # Create an STS client to check AWS identity
        sts = boto3.client('sts')
        identity = sts.get_caller_identity()
        print(f"✅ AWS Credentials Valid!")
        print(f"Account: {identity['Account']}")
        print(f"User ARN: {identity['Arn']}")
        
        # Test S3 specific bucket access
        s3 = boto3.client('s3')
        bucket_name = os.getenv('S3_BUCKET_NAME')
        print(f"Checking access to Bucket: {bucket_name} ...")
        # Just fetching the bucket location as a lightweight read
        s3.get_bucket_location(Bucket=bucket_name)
        print(f"✅ Successfully accessed S3 bucket '{bucket_name}'.")
    except Exception as e:
        print(f"❌ AWS Test Failed: {e}")

def test_pinecone():
    print("\n--- Testing Pinecone ---")
    try:
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key or "your-pinecone" in api_key:
            print("❌ Pinecone API Key appears to be placeholder or missing.")
            return

        pc = Pinecone(api_key=api_key)
        index_name = os.getenv("PINECONE_INDEX_NAME")
        
        # Fetch index info
        stats = pc.Index(index_name).describe_index_stats()
        print(f"✅ Pinecone Connected!")
        print(f"Index Dimensions: {stats['dimension']}")
        print(f"Total Vectors: {stats['total_vector_count']}")
    except Exception as e:
        print(f"❌ Pinecone Test Failed: {e}")

def test_groq():
    print("\n--- Testing Groq ---")
    try:
        client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        print(os.getenv("GROQ_API_KEY"))
        # Run a tiny tiny prompt
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": "What is 2 + 2?"}],
            model="llama-3.1-8b-instant",
            max_tokens=100
        )
        print(f"✅ Groq LLM Connected! Output: {response.choices[0].message.content}")
    except Exception as e:
        print(f"❌ Groq Test Failed: {e}")

if __name__ == "__main__":
    print("Starting Setup Diagnostic Tool...\n")
    test_aws()
    test_pinecone()
    test_groq()
    print("\nDiagnostic complete.")
