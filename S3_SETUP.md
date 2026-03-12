# S3 Setup Guide: Profile Picture Storage

Profile pictures are stored in **Amazon S3**. The backend already has the upload logic; you only need to create the bucket, configure permissions, and add credentials to your project.

---

## Prerequisites

- An [AWS account](https://aws.amazon.com)
- AWS CLI installed (optional, but useful for verification)

---

## Step 1: Create an S3 Bucket

1. Sign in to the [AWS Console](https://console.aws.amazon.com/) and open **S3**.
2. Click **Create bucket**.
3. Set:
   - **Bucket name** – e.g. `nu-cs196-chirper` or `yourname-chirper-profile-pics` (must be globally unique).
   - **Region** – e.g. `us-east-1` (use the same region you put in `.env`).
4. Under **Block Public Access settings**:
   - **Uncheck** “Block all public access”.
   - Acknowledge the warning.
5. Click **Create bucket**.

---

## Step 2: Allow Public ACLs (So Uploaded Images Are Viewable)

The app uploads objects with `ACL: public-read` so the profile picture URLs work in browsers.

1. Go to your bucket → **Permissions**.
2. Under **Object Ownership**:
   - Click **Edit**.
   - Choose **ACLs enabled** and **Bucket owner preferred**.
   - Save.
3. Under **Block Public Access (bucket settings)**:
   - Click **Edit**.
   - Uncheck **Block public access to buckets and objects granted through new access control lists (ACLs)**.
   - Keep other settings as you prefer.
   - Save.

---

## Step 3: Create an IAM User for the Backend

The backend needs AWS credentials that can write to your bucket.

1. Open **IAM** → **Users** → **Create user**.
2. **User name**: e.g. `chirper-s3-uploader`.
3. Click **Next**.
4. Choose **Attach policies directly** → search and select **AmazonS3FullAccess** → **Next** → **Create user**.
5. Open the user → **Security credentials** → **Create access key**:
   - Use case: **Application running outside AWS**.
6. Copy the **Access Key ID** and **Secret Access Key** (you won’t see the secret again).

---

## Step 4: Add Credentials to Your Backend

1. Open `backend/.env`.
2. Set:

```env
# AWS S3 (profile picture uploads)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here
S3_BUCKET=nu-cs196-chirper
```

Replace:

- `us-east-1` if your bucket is in another region.
- `your_access_key_id_here` and `your_secret_access_key_here` with the IAM user’s keys.
- `nu-cs196-chirper` with your actual bucket name.

---

## Step 5: Restart the Backend

Restart your backend server so it picks up the new env variables:

```bash
cd backend && npm run dev
```

---

## What You Add to `.env`

| Variable             | Example                | Description                              |
|----------------------|------------------------|------------------------------------------|
| `AWS_REGION`         | `us-east-1`           | AWS region where the bucket lives        |
| `AWS_ACCESS_KEY_ID`  | `AKIA...`             | IAM user Access Key ID                   |
| `AWS_SECRET_ACCESS_KEY` | `...`             | IAM user Secret Access Key               |
| `S3_BUCKET`          | `nu-cs196-chirper`    | Your S3 bucket name                      |

---

## Quick Checklist

- [ ] S3 bucket created
- [ ] Block public access turned off (or ACLs allowed as above)
- [ ] Object ownership: ACLs enabled
- [ ] IAM user created with S3 `PutObject` and `PutObjectAcl`
- [ ] Access key created and copied
- [ ] `backend/.env` updated with the 4 variables
- [ ] Backend restarted

---

## Troubleshooting

| Error | Likely cause |
|-------|--------------|
| `Access Denied` / 403 on upload | IAM policy missing `PutObject`/`PutObjectAcl` or wrong bucket/prefix |
| `403 Forbidden` when viewing image in browser | ACLs not allowed or `Block public access` still on |
| `The bucket does not allow ACLs` | Object ownership not set to “ACLs enabled” or public ACL blocked |
| `Credentials not found` | `.env` not loaded or `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` wrong |

---

## Security Notes

- **Never commit** real keys. `.env` should be in `.gitignore` (and usually is).
- The IAM user should only have the minimal S3 permissions above.
- For production, consider using IAM roles (e.g. on ECS/EC2) instead of access keys in env.
