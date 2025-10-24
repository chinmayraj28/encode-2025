# 🔑 Pinata Setup Guide

## Getting Started with Pinata

### 1. Create Account
- Go to [https://pinata.cloud](https://pinata.cloud)
- Sign up for FREE account
- Free tier includes:
  - 1 GB storage
  - Unlimited bandwidth
  - Perfect for hackathons!

### 2. Get Your API Key (JWT)

1. Log in to Pinata dashboard
2. Click **API Keys** in the sidebar
3. Click **+ New Key** button
4. Configure permissions:
   - ✅ **Admin** (easiest for hackathon)
   - OR select specific permissions:
     - ✅ pinFileToIPFS
     - ✅ pinJSONToIPFS
     - ✅ unpin
5. Give it a name: `Artist Blockchain Platform`
6. Click **Generate Key**
7. **IMPORTANT**: Copy the JWT immediately! You can't see it again
8. Save it to your `.env.local` file

### 3. Get Your Gateway Domain

1. In Pinata dashboard, go to **Gateways**
2. You'll see your default gateway URL
3. It looks like: `gateway.pinata.cloud` or `<yourname>.mypinata.cloud`
4. Copy this domain (without https://)
5. Save it to your `.env.local` file

### 4. Configure Your Project

Create `.env.local` in your project root:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourDeployedContractAddress
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_PINATA_GATEWAY=gateway.pinata.cloud
```

**Security Note**: The `NEXT_PUBLIC_` prefix means these variables are exposed to the browser. For production:
- Use server-side API routes to hide JWT
- Implement rate limiting
- Use signed URLs for uploads

### 5. Test Your Setup

Run this in your terminal to test:

```bash
npm run dev
```

Then:
1. Connect your wallet
2. Try uploading a small test file
3. Check your Pinata dashboard → Files tab
4. You should see your uploaded files!

## 📊 Pinata Dashboard Features

### Files Tab
- View all uploaded files
- See CID (Content Identifier)
- Check file size and upload date
- Pin/unpin files

### Gateways Tab
- Manage custom domains
- View bandwidth usage
- Configure access controls

### API Keys Tab
- Create multiple keys with different permissions
- Revoke compromised keys
- Monitor key usage

## 🔗 IPFS Links

When you upload a file, you get a CID like:
```
QmX... or bafybeif...
```

You can access it via:
1. **Pinata Gateway**: `https://gateway.pinata.cloud/ipfs/QmX...`
2. **Public IPFS**: `https://ipfs.io/ipfs/QmX...`
3. **Cloudflare IPFS**: `https://cloudflare-ipfs.com/ipfs/QmX...`
4. **Your Custom Gateway**: `https://yourname.mypinata.cloud/ipfs/QmX...`

## 💡 Best Practices

### For Hackathons:
- ✅ Use Admin key for simplicity
- ✅ Upload to public network
- ✅ Test with small files first
- ✅ Keep JWT in `.env.local` (not committed to git)

### For Production:
- ✅ Use specific permissions (not Admin)
- ✅ Implement server-side API routes
- ✅ Add file type validation
- ✅ Implement file size limits
- ✅ Use signed upload URLs
- ✅ Enable IPFS pinning for redundancy
- ✅ Monitor usage and set up alerts

## 🐛 Troubleshooting

### "JWT not configured" error
- Check `.env.local` file exists
- Verify `NEXT_PUBLIC_PINATA_JWT` is set
- Restart dev server after changing env vars

### "Upload failed" error
- Check your JWT is valid and not revoked
- Verify file size is under your plan limit
- Check network connection
- View browser console for detailed errors

### "Gateway not found" error
- Verify `NEXT_PUBLIC_PINATA_GATEWAY` domain
- Don't include `https://` in the gateway URL
- Check your gateway is active in Pinata dashboard

### Files not showing in dashboard
- Wait a few seconds for sync
- Refresh the page
- Check you're logged in to correct account

## 📈 Upgrade Options

If you need more for your hackathon:

### Free Tier
- 1 GB storage
- Unlimited bandwidth
- Good for: Small demos

### Picnic Plan ($20/month)
- 20 GB storage
- Unlimited bandwidth
- Custom domains
- Good for: Full hackathon projects

### Maker Plan ($200/month)
- 200 GB storage
- Priority support
- Advanced analytics
- Good for: Production launches

## 🎯 Quick Reference

```typescript
// Upload file
const upload = await pinata.upload.public.file(file);
console.log(upload.cid); // The IPFS hash

// Upload JSON
const jsonUpload = await pinata.upload.public.json({
  name: "My Asset",
  description: "Cool stuff"
});

// Get URL
const url = `https://${gateway}/ipfs/${upload.cid}`;
```

## 🔗 Useful Links

- Pinata Dashboard: https://app.pinata.cloud
- Pinata Docs: https://docs.pinata.cloud
- SDK Docs: https://github.com/PinataCloud/pinata-web3
- IPFS Docs: https://docs.ipfs.tech
- Support: https://pinata.cloud/support

---

Need help? Check the Pinata docs or their Discord community!
