import os
import boto3

# Initialize S3 client
s3_client = boto3.client('s3', region_name=os.getenv("AWS_REGION", "us-east-1"))
BUCKET_NAME = os.getenv("S3_BUCKET_NAME", "enterprise-rag-bucket")

def upload_file_to_s3(file_obj, object_name: str):
    """Uploads a file object to S3."""
    s3_client.upload_fileobj(file_obj, BUCKET_NAME, object_name)

def get_file_stream_from_s3(object_name: str):
    """Retrieves a file from S3 as a stream."""
    response = s3_client.get_object(Bucket=BUCKET_NAME, Key=object_name)
    return response['Body']

def list_files_in_s3(prefix: str = ""):
    """Lists files in S3 bucket with an optional prefix."""
    try:
        response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, Prefix=prefix)
        if 'Contents' in response:
            return [
                {
                    "key": obj['Key'],
                    "size": obj['Size'],
                    "last_modified": obj['LastModified'].isoformat()
                } 
                for obj in response['Contents']
            ]
        return []
    except Exception as e:
        print(f"Error listing files: {str(e)}")
        return []
