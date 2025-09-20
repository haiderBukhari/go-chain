# Haider Bukhari Blockchain

A complete blockchain implementation with both backend API and frontend interface, built with Go and modern web technologies by Haider Bukhari (Roll No: i22-0980).

## 🏗️ Project Structure

```
haider-bukhari-blockchain/
├── backend/                 # Go blockchain API server
│   ├── api/
│   │   └── main.go         # Main blockchain handler
│   ├── go.mod              # Go module definition
│   └── vercel.json         # Vercel deployment config
├── frontend/               # React frontend interface
│   ├── src/
│   │   ├── pages/
│   │   │   └── Index.tsx   # Main blockchain explorer page
│   │   └── components/     # React components
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## 🚀 Backend (Go Blockchain API)

### What It Is
Haider Bukhari's serverless blockchain implementation built with Go, designed to run on Vercel's edge functions. It provides a complete blockchain with Proof of Work mining, Merkle trees, and transaction management. The genesis block contains the roll number "i22-0980".

### Key Features

#### 🔗 **Block Structure**
- **Index**: Block height/position in chain
- **Timestamp**: When the block was created
- **Transactions**: Array of transaction data (strings)
- **PrevHash**: Hash of the previous block
- **Hash**: Current block's hash (Proof of Work)
- **Nonce**: Mining nonce for Proof of Work
- **MerkleRoot**: Merkle tree root of transactions

#### ⛏️ **Proof of Work Mining**
- **Difficulty**: 4 leading zeros required
- **Mining Process**: Incremental nonce until hash meets difficulty
- **Block Validation**: Each block must have valid hash

#### 🌳 **Merkle Tree Implementation**
- **Efficient Storage**: Secure transaction verification
- **Tree Building**: Bottom-up hash tree construction
- **Empty Handling**: Graceful handling of empty transaction sets

#### 📝 **Transaction Management**
- **Mempool**: Pending transactions waiting to be mined
- **Transaction Types**: String-based transaction data
- **Status Tracking**: Mempool vs confirmed transactions

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Show available endpoints |
| `GET` | `/chain` | Get complete blockchain |
| `POST` | `/tx` | Add transaction to mempool |
| `POST` | `/mine` | Mine a new block |
| `GET` | `/search?q=query` | Search transactions |
| `GET` | `/txs` | Get all transactions (mempool + confirmed) |

### API Examples

#### Add Transaction
```bash
POST /tx
Content-Type: application/json

{
  "tx": "Alice sends 10 coins to Bob"
}
```

#### Mine Block
```bash
POST /mine
# Returns the newly mined block
```

#### Get Blockchain
```bash
GET /chain
# Returns complete blockchain array
```

#### Search Transactions
```bash
GET /search?q=Alice
# Returns matching transactions
```

### Technical Implementation

#### **CORS Support**
- All origins allowed (`*`)
- Preflight request handling
- Cross-origin API access enabled

#### **Serverless Architecture**
- **Vercel Functions**: Deployed as serverless functions
- **Cold Start**: Genesis block initialization
- **Stateless**: In-memory storage (resets on cold start)

#### **Security Features**
- **Hash Chaining**: Each block references previous block
- **Merkle Trees**: Efficient transaction verification
- **Proof of Work**: Computational security through mining

## 🎨 Frontend (React Interface)

### Current Features
- **Blockchain Explorer**: Visual blockchain viewer with "Haider Bukhari Blockchain" header
- **Transaction Interface**: Add and view transactions
- **Mining Dashboard**: Real-time mining status
- **Search Interface**: Transaction search functionality
- **Statistics**: Blockchain metrics and analytics

### Technology Stack
- **React**: Modern frontend framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Real-time Updates**: API polling for live data

## 🚀 Deployment

### Backend Deployment (Vercel)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy Backend**:
   ```bash
   cd backend
   vercel --prod
   ```

3. **Environment**: Automatically deployed to Vercel's edge network

### Local Development

1. **Run Backend Locally**:
   ```bash
   cd backend
   go run api/main.go
   ```

2. **Access API**: `http://localhost:8080`

## 🔧 Configuration

### Vercel Configuration (`vercel.json`)
```json
{
  "routes": [
    { "src": "/(.*)", "dest": "/api" }
  ]
}
```

### Go Module (`go.mod`)
```go
module go-chain-backend
go 1.22
```

## 📊 Blockchain Features

### ✅ **Implemented**
- [x] Genesis block creation with roll number "i22-0980"
- [x] Block structure with all required fields
- [x] Merkle tree implementation
- [x] Proof of Work mining algorithm
- [x] Transaction management (mempool)
- [x] Blockchain validation
- [x] Search functionality
- [x] RESTful API endpoints
- [x] CORS support
- [x] Serverless deployment
- [x] React frontend with "Haider Bukhari Blockchain" header
- [x] Complete blockchain explorer interface

### 🔄 **In Progress**
- [ ] Real-time updates
- [ ] Advanced search filters
- [ ] Blockchain statistics

### 🎯 **Future Enhancements**
- [ ] Persistent storage (database)
- [ ] Multiple node support
- [ ] Consensus mechanisms
- [ ] Smart contracts
- [ ] Wallet integration
- [ ] Transaction signing

## 🛠️ Development

### Prerequisites
- **Go 1.22+**: For backend development
- **Vercel CLI**: For deployment
- **Git**: Version control

### Getting Started

1. **Clone Repository**:
   ```bash
   git clone <repository-url>
   cd go-chain
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   go mod tidy
   go run api/main.go
   ```

3. **Test API**:
   ```bash
   curl http://localhost:8080/chain
   ```

## 📈 Performance

### Backend Performance
- **Cold Start**: ~100-200ms
- **Warm Requests**: ~10-50ms
- **Mining Speed**: Depends on difficulty (4 zeros)
- **Memory Usage**: Minimal (in-memory storage)

### Scalability
- **Serverless**: Auto-scaling with Vercel
- **Edge Network**: Global distribution
- **Stateless**: Horizontal scaling ready

## 🔒 Security Considerations

### Current Security
- **Proof of Work**: Computational security
- **Hash Chaining**: Tamper detection
- **Merkle Trees**: Transaction integrity

### Production Recommendations
- **Persistent Storage**: Database for data persistence
- **Input Validation**: Enhanced request validation
- **Rate Limiting**: API request throttling
- **Authentication**: User access control
- **HTTPS**: Secure communication

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---
