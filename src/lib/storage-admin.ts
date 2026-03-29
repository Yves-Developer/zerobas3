import { 
  CreateBucketCommand, 
  HeadBucketCommand, 
  PutBucketPolicyCommand 
} from "@aws-sdk/client-s3";
import { s3 } from "./storage";

export async function ensureBucket(name: string, isPublic = false) {
  const bucketName = name.toLowerCase();
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
  } catch (error: any) {
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
      
      if (isPublic) {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await s3.send(new PutBucketPolicyCommand({ 
          Bucket: bucketName, 
          Policy: JSON.stringify(policy) 
        }));
      }
    }
  }
}
